// libs
var exec = require('child_process').execFile;
var express = require('express');
var Web3 = require('web3');
var handlebars = require('handlebars');
var fs = require("fs");
var solc = require('solc')

//constants
var rpcnode = "http://localhost";
var rpcport = "8545";
var sampleContract = "sample_contract.sol";

//initialization
var app = express();
var web3 = new Web3();


function initWeb3() {
    var web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(rpcnode + ':' + rpcport));
}

function generateCPAContract(share, referral, seller) {
    //exec("testrpc");
    fs.readFile(sampleContract, function(err, buf) {

        if (err)
            throw err;
        var data = {
            "share": share,
            "referral": referral,
            "seller": seller
        };
        var contractString = buf.toString('utf8');
        var template = handlebars.compile(contractString)(data);
        var output = solc.compile(template, 1);
        // Object.keys(contracts.contracts)
        const bytecode = output.contracts[':ReferralSell'].bytecode;
        const abi = JSON.parse(output.contracts[':ReferralSell'].interface);
        const contract = new web3.eth.Contract(abi);
        var contractInstance = contract.deploy({
            data: '0x' + bytecode
        });
        contractInstance.estimateGas().then((gas) => {
            console.log(gas);
            // contractInstance.send({
            //     from: 'seller',
            //     gas: 1500000,
            //     gasPrice: '30000000000000'
            // });
        });
        // contractInstance.estimateGas(function(err, gas) {
        //     console.log(gas);
        // });
        // var contractData = contract.new.getData();
        // var estimate = web3.eth.estimateGas({ data: contractData })

        // const contractInstance = contract.new({
        //     data: '0x' + bytecode,
        //     from: seller,
        //     gas: 90000 * 2
        // }, (err, res) => {
        //     if (err) {
        //         console.log(err);
        //         return;
        //     }

        //     // Log the tx, you can explore status with eth.getTransaction()
        //     console.log(res.transactionHash);

        //     // If we have an address property, the contract was deployed
        //     if (res.address) {
        //         console.log('Contract address: ' + res.address);
        //         // Let's test the deployed contract
        //         testContract(res.address);
        //     }
        // });
    });
    // template
    // compile
}

app.get('/ads', function(req, res) {
    var share = req.query['share'];
    var referral = req.query['referral'];
    var seller = req.query['seller'];
    generateCPAContract(share, referral, seller);
    // req.params.balance
});

app.get('/', function(req, res) {
    console.log("test");
});


initWeb3();

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});