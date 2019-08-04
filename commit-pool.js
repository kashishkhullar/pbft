const ChainUtil = require("./chain-util");

class CommitPool {
  // list object is mapping that holds a list commit messages for a hash of a block
  constructor() {
    this.list = {};
  }

  // commit function initialize a list of commit message for a prepare message
  // and adds the commit message for the current node and
  // returns it
  commit(prepare, wallet) {
    let commit = this.createCommit(prepare, wallet);
    this.list[prepare.blockHash] = [];
    this.list[prepare.blockHash].push(commit);
    return commit;
  }

  // creates a commit message for the given prepare message
  createCommit(prepare, wallet) {
    let commit = {};
    commit.blockHash = prepare.blockHash;
    commit.publicKey = wallet.getPublicKey();
    commit.signature = wallet.sign(prepare.blockHash);
    return commit;
  }

  // checks if the commit message already exists
  existingCommit(commit) {
    let exists = this.list[commit.blockHash].find(
      p => p.publicKey === commit.publicKey
    );
    return exists;
  }

  // checks if the commit message is valid or not
  isValidCommit(commit) {
    return ChainUtil.verifySignature(
      commit.publicKey,
      commit.signature,
      commit.blockHash
    );
  }

  // pushes the commit message for a block hash into the list
  addCommit(commit) {
    this.list[commit.blockHash].push(commit);
  }
}

module.exports = CommitPool;
