const ChainUtil = require("./chain-util");

class MessagePool {
  // list object is mapping that holds a list messages for a hash of a block
  constructor() {
    this.list = {};
    this.message = "INITIATE NEW ROUND";
  }

  // creates a round change message for the given block hash
  createMessage(blockHash, wallet) {
    let roundChange = {
      publicKey: wallet.getPublicKey(),
      message: this.message,
      signature: wallet.sign(ChainUtil.hash(this.message + blockHash)),
      blockHash: blockHash
    };

    this.list[blockHash] = [roundChange];
    return roundChange;
  }

  // checks if the message already exists
  existingMessage(message) {
    if (this.list[message.blockHash]) {
      let exists = this.list[message.blockHash].find(
        p => p.publicKey === message.publicKey
      );
      return exists;
    } else {
      return false;
    }
  }

  // checks if the message is valid or not
  isValidMessage(message) {
    console.log("in valid here");
    return ChainUtil.verifySignature(
      message.publicKey,
      message.signature,
      ChainUtil.hash(message.message + message.blockHash)
    );
  }

  // pushes the message for a block hash into the list
  addMessage(message) {
    this.list[message.blockHash].push(message);
  }
}

module.exports = MessagePool;
