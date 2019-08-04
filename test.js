const Wallet = require("./wallet");
const Transaction = require("./transaction");
const { NUMBER_OF_NODES } = require("./config");

// let secret = "hello";

// let myWallet = new Wallet(secret);

// console.log(myWallet.toString());

// let txn = myWallet.createTransaction("hi");

// console.log(txn);

// Transaction.verifyTransaction(txn)
//   ? console.log("verified")
//   : console.log("tampered");

// SECRET="NODE0" P2P_PORT=5002 HTTP_PORT=3002 PEERS=ws://localhost:5001 node app

let wallets = [];

Array(NUMBER_OF_NODES)
  .fill()
  .map(Math.random)
  .forEach((number, index) => {
    wallets.push(new Wallet("NODE" + index));
  });

wallets.forEach(wallet => {
  console.log(wallet.getPublicKey());
});
