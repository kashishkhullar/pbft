// Import total number of nodes used to create validators list
const { NUMBER_OF_NODES } = require("./config");

// Used to verify block
const Block = require("./block");

class Blockchain {
  // the constructor takes an argument validators class object
  // this is used to create a list of validators
  constructor(validators) {
    this.validatorList = validators.generateAddresses(NUMBER_OF_NODES);
    this.chain = [Block.genesis()];
  }

  // pushes confirmed blocks into the chain
  addBlock(block) {
    this.chain.push(block);
    console.log("NEW BLOCK ADDED TO CHAIN");
    return block;
  }

  // wrapper function to create blocks
  createBlock(transactions, wallet) {
    const block = Block.createBlock(
      this.chain[this.chain.length - 1],
      transactions,
      wallet
    );
    return block;
  }

  // calculates the next propsers by calculating a random index of the validators list
  // index is calculated using the hash of the latest block
  getProposer() {
    let index =
      this.chain[this.chain.length - 1].hash[0].charCodeAt(0) % NUMBER_OF_NODES;
    return this.validatorList[index];
  }

  // checks if the received block is valid
  isValidBlock(block) {
    const lastBlock = this.chain[this.chain.length - 1];
    if (
      lastBlock.sequenceNo + 1 == block.sequenceNo &&
      block.lastHash === lastBlock.hash &&
      block.hash === Block.blockHash(block) &&
      Block.verifyBlock(block) &&
      Block.verifyProposer(block, this.getProposer())
    ) {
      console.log("BLOCK VALID");
      return true;
    } else {
      console.log("BLOCK INVLAID");
      return false;
    }
  }

  // updates the block by appending the prepare and commit messages to the block
  addUpdatedBlock(hash, blockPool, preparePool, commitPool) {
    let block = blockPool.getBlock(hash);
    block.prepareMessages = preparePool.list[hash];
    block.commitMessages = commitPool.list[hash];
    this.addBlock(block);
  }
}
module.exports = Blockchain;
