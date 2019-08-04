// Maximum number of transactions that can be present in a block and transaction pool
const TRANSACTION_THRESHOLD = 5;

// total number of nodes in the network
const NUMBER_OF_NODES = 3;

// Minmu number of positive votes required for the message/block to be valid
const MIN_APPROVALS = 2 * (NUMBER_OF_NODES / 3) + 1;

module.exports = {
  TRANSACTION_THRESHOLD,
  NUMBER_OF_NODES,
  MIN_APPROVALS
};
