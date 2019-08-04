// Import the ChainUtil class used for hashing and verification
const ChainUtil = require("./chain-util");
// Import transaction class  used for creating transactions
const Transaction = require("./transaction");

class Wallet {
  // The secret phase is passed an argument when creating a wallet
  // The keypair generated for a secret phrase is always the same
  constructor(secret) {
    this.keyPair = ChainUtil.genKeyPair(secret);
    this.publicKey = this.keyPair.getPublic("hex");
  }

  // Used for prining the wallet details
  toString() {
    return `Wallet - 
            publicKey: ${this.publicKey.toString()}`;
  }

  // Used for signing data hashes
  sign(dataHash) {
    return this.keyPair.sign(dataHash).toHex();
  }

  // Creates and returns transactions
  createTransaction(data) {
    return new Transaction(data, this);
  }

  // Return public key
  getPublicKey() {
    return this.publicKey;
  }
}

module.exports = Wallet;
