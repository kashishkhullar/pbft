const ChainUtil = require("./chain-util");

class PreparePool {
  // list object is mapping that holds a list of prepare messages for a hash of a block
  constructor() {
    this.list = {};
  }

  // prepare function initialize a list of prepare message for a block
  // and adds the prepare message for the current node and
  // returns it
  prepare(block, wallet) {
    let prepare = this.createPrepare(block, wallet);
    this.list[block.hash] = [];
    this.list[block.hash].push(prepare);
    return prepare;
  }

  // creates a prepare message for the given block
  createPrepare(block, wallet) {
    let prepare = {
      blockHash: block.hash,
      publicKey: wallet.getPublicKey(),
      signature: wallet.sign(block.hash)
    };

    return prepare;
  }

  // pushes the prepare message for a block hash into the list
  addPrepare(prepare) {
    this.list[prepare.blockHash].push(prepare);
  }

  // checks if the prepare message already exists
  existingPrepare(prepare) {
    let exists = this.list[prepare.blockHash].find(
      p => p.publicKey === prepare.publicKey
    );
    return exists;
  }

  // checks if the prepare message is valid or not
  isValidPrepare(prepare) {
    return ChainUtil.verifySignature(
      prepare.publicKey,
      prepare.signature,
      prepare.blockHash
    );
  }
}

module.exports = PreparePool;
