// import the ws module
const WebSocket = require("ws");

// import the min approval constant which will be used to compare the count the messages
const { MIN_APPROVALS } = require("./config");

// decalre a p2p server port on which it would listen for messages
// we will pass the port through command line
const P2P_PORT = process.env.P2P_PORT || 5001;

// the neighbouring nodes socket addresses will be passed in command line
// this statemet splits them into an array
const peers = process.env.PEERS ? process.env.PEERS.split(",") : [];

// message types used to avoid typing messages
// also used in swtich statement in message handlers
const MESSAGE_TYPE = {
  transaction: "TRANSACTION",
  prepare: "PREPARE",
  pre_prepare: "PRE-PREPARE",
  commit: "COMMIT",
  round_change: "ROUND_CHANGE"
};

class P2pserver {
  constructor(
    blockchain,
    transactionPool,
    wallet,
    blockPool,
    preparePool,
    commitPool,
    messagePool,
    validators
  ) {
    this.blockchain = blockchain;
    this.sockets = [];
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockPool = blockPool;
    this.preparePool = preparePool;
    this.commitPool = commitPool;
    this.messagePool = messagePool;
    this.validators = validators;
  }

  // Creates a server on a given port
  listen() {
    const server = new WebSocket.Server({ port: P2P_PORT });
    server.on("connection", socket => {
      console.log("new connection");
      this.connectSocket(socket);
    });
    this.connectToPeers();
    console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
  }

  // connects to a given socket and registers the message handler on it
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log("Socket connected");
    this.messageHandler(socket);
  }

  // connects to the peers passed in command line
  connectToPeers() {
    peers.forEach(peer => {
      const socket = new WebSocket(peer);
      socket.on("open", () => this.connectSocket(socket));
    });
  }

  // broadcasts transactions
  broadcastTransaction(transaction) {
    this.sockets.forEach(socket => {
      this.sendTransaction(socket, transaction);
    });
  }

  // sends transactions to a perticular socket
  sendTransaction(socket, transaction) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.transaction,
        transaction: transaction
      })
    );
  }

  // broadcasts preprepare
  broadcastPrePrepare(block) {
    this.sockets.forEach(socket => {
      this.sendPrePrepare(socket, block);
    });
  }

  // sends preprepare to a particular socket
  sendPrePrepare(socket, block) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.pre_prepare,
        block: block
      })
    );
  }

  // broadcast prepare
  broadcastPrepare(prepare) {
    this.sockets.forEach(socket => {
      this.sendPrepare(socket, prepare);
    });
  }

  // sends prepare to a particular socket
  sendPrepare(socket, prepare) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.prepare,
        prepare: prepare
      })
    );
  }

  // broadcasts commit
  broadcastCommit(commit) {
    this.sockets.forEach(socket => {
      this.sendCommit(socket, commit);
    });
  }

  // sends commit to a particular socket
  sendCommit(socket, commit) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.commit,
        commit: commit
      })
    );
  }

  // broacasts round change
  broadcastRoundChange(message) {
    this.sockets.forEach(socket => {
      this.sendRoundChange(socket, message);
    });
  }

  // sends round change message to a particular socket
  sendRoundChange(socket, message) {
    socket.send(
      JSON.stringify({
        type: MESSAGE_TYPE.round_change,
        message: message
      })
    );
  }

  // handles any message sent to the current node
  messageHandler(socket) {
    // registers message handler
    socket.on("message", message => {
      const data = JSON.parse(message);

      console.log("RECEIVED", data.type);

      // select a perticular message handler
      switch (data.type) {
        case MESSAGE_TYPE.transaction:
          // check if transactions is valid
          if (
            !this.transactionPool.transactionExists(data.transaction) &&
            this.transactionPool.verifyTransaction(data.transaction) &&
            this.validators.isValidValidator(data.transaction.from)
          ) {
            let thresholdReached = this.transactionPool.addTransaction(
              data.transaction
            );
            // send transactions to other nodes
            this.broadcastTransaction(data.transaction);

            // check if limit reached
            if (thresholdReached) {
              console.log("THRESHOLD REACHED");
              // check the current node is the proposer
              if (this.blockchain.getProposer() == this.wallet.getPublicKey()) {
                console.log("PROPOSING BLOCK");
                // if the node is the proposer, create a block and broadcast it
                let block = this.blockchain.createBlock(
                  this.transactionPool.transactions,
                  this.wallet
                );
                console.log("CREATED BLOCK", block);
                this.broadcastPrePrepare(block);
              }
            } else {
              console.log("Transaction Added");
            }
          }
          break;
        case MESSAGE_TYPE.pre_prepare:
          // check if block is valid
          if (
            !this.blockPool.exisitingBlock(data.block) &&
            this.blockchain.isValidBlock(data.block)
          ) {
            // add block to pool
            this.blockPool.addBlock(data.block);

            // send to other nodes
            this.broadcastPrePrepare(data.block);

            // create and broadcast a prepare message
            let prepare = this.preparePool.prepare(data.block, this.wallet);
            this.broadcastPrepare(prepare);
          }
          break;
        case MESSAGE_TYPE.prepare:
          // check if the prepare message is valid
          if (
            !this.preparePool.existingPrepare(data.prepare) &&
            this.preparePool.isValidPrepare(data.prepare, this.wallet) &&
            this.validators.isValidValidator(data.prepare.publicKey)
          ) {
            // add prepare message to the pool
            this.preparePool.addPrepare(data.prepare);

            // send to other nodes
            this.broadcastPrepare(data.prepare);

            // if no of prepare messages reaches minimum required
            // send commit message
            if (
              this.preparePool.list[data.prepare.blockHash].length >=
              MIN_APPROVALS
            ) {
              let commit = this.commitPool.commit(data.prepare, this.wallet);
              this.broadcastCommit(commit);
            }
          }
          break;
        case MESSAGE_TYPE.commit:
          // check the validity commit messages
          if (
            !this.commitPool.existingCommit(data.commit) &&
            this.commitPool.isValidCommit(data.commit) &&
            this.validators.isValidValidator(data.commit.publicKey)
          ) {
            // add to pool
            this.commitPool.addCommit(data.commit);

            // send to other nodes
            this.broadcastCommit(data.commit);

            // if no of commit messages reaches minimum required
            // add updated block to chain
            if (
              this.commitPool.list[data.commit.blockHash].length >=
              MIN_APPROVALS
            ) {
              this.blockchain.addUpdatedBlock(
                data.commit.blockHash,
                this.blockPool,
                this.preparePool,
                this.commitPool
              );
            }
            // Send a round change message to nodes
            let message = this.messagePool.createMessage(
              this.blockchain.chain[this.blockchain.chain.length - 1].hash,
              this.wallet
            );
            this.broadcastRoundChange(message);
          }
          break;

        case MESSAGE_TYPE.round_change:
          // check the validity of the round change message
          if (
            !this.messagePool.existingMessage(data.message) &&
            this.messagePool.isValidMessage(data.message) &&
            this.validators.isValidValidator(data.message.publicKey)
          ) {
            // add to pool
            this.messagePool.addMessage(data.message);

            // send to other nodes
            this.broadcastRoundChange(message);

            // if enough messages are received, clear the pools
            if (
              this.messagePool.list[data.message.blockHash].length >=
              MIN_APPROVALS
            ) {
              this.transactionPool.clear();
            }
          }
          break;
      }
    });
  }
}

module.exports = P2pserver;
