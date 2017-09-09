var Web3 = require("web3");
var web3 = new Web3();

var seller = "0xfed4354865b65a4639e6679558d9475bd4cb77bf";
var referrer = "0x37c9e4f27608b1fbacafb262931c4afb07db391e";
var buyer = "0xc6353881f1bd9d899b9a685c0325f0379dae5ead";

function testCPAContract(address) {
    // Reference to the deployed contract
    const CPAContract = contract.at(address);
    // Destination account for test
    const dest_account = '0xfed4354865b65a4639e6679558d9475bd4cb77bf';

    // Assert initial account balance, should be 100000
    const balance1 = CPAContract.balances.call(web3.eth.coinbase);
    // console.log(balance1 == 1000000);

    // Call the transfer function
    CPAContract.itemSold(dest_account, 100, {from: web3.eth.coinbase}, (err, res) => {
        // Log transaction, in case you want to explore
        console.log('tx: ' + res);
        // Assert destination account balance, should be 100 
        const balance2 = token.balances.call(dest_account);
        // console.log(balance2 == 100);
    });
}

testCPAContract();

module.exports.testCPAContract = testCPAContract;