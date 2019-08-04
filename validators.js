// Import the wallet class
const Wallet = require("./wallet");

class Validators {
  // constructor will take an argument which is the number of nodes in the network
  constructor(numberOfValidators) {
    this.list = this.generateAddresses(numberOfValidators);
  }

  // This function generates wallets and their public key
  // The secret key has been known for demonstration purposes
  // Secret will be passed from command line to generate the same wallet again
  // As a result the same public key will be generatedd
  generateAddresses(numberOfValidators) {
    let list = [];
    for (let i = 0; i < numberOfValidators; i++) {
      list.push(new Wallet("NODE" + i).getPublicKey());
    }
    return list;
  }

  // This function verfies if the passed public key is a known validator or not
  isValidValidator(validator) {
    return this.list.includes(validator);
  }
}
module.exports = Validators;
