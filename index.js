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
var sampleContract = "ReferralSell.sol";
var platformAddress = "0x93c517e1f32084f8c2794abad6efe802e52c3759";

//initialization
var app = express();
var web3 = new Web3();


function initWeb3() {
    var web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(rpcnode + ':' + rpcport));
}

function generateCPAContract(platformShare, referralShare, referral, seller, platform) {
    return new Promise((resolve) => {
        fs.readFile(sampleContract, function(err, buf) {
            if (err)
                resolve({ error: err });

            var data = {
                "platformShare": platformShare,
                "referralShare": referralShare,
                "referral": referral,
                "seller": seller,
                "platform": platform
            };
            var contractString = buf.toString('utf8');
            var template = handlebars.compile(contractString)(data);
            var output = solc.compile(template, 1);
            const bytecode = output.contracts[':ReferralSell'].bytecode;
            const abi = JSON.parse(output.contracts[':ReferralSell'].interface);
            const contract = new web3.eth.Contract(abi);
            var contractInstance = contract.deploy({
                data: '0x' + bytecode
            });
            contractInstance.estimateGas().then((gas) => {
                console.log("estimatedGas = " + gas);
                return gas;
            }).then((estimatedGas) => {
                contractInstance.send({
                    data: '0x' + bytecode,
                    from: seller,
                    gas: estimatedGas
                })
                    .on('error', (err) => {
                        console.log("error " + err);
                        resolve({ error: err });
                    })
                    // .on('receipt', ())
                    .on('confirmation', (confirmationNumber, receipt) => {
                        console.log("In confirmation");
                    })
                    .on('receipt', (receipt) => {
                        console.log("in receipt()");
                        resolve({ transactionHash: receipt.transactionHash, contractAddress: receipt.contractAddress, receipt });
                    })
                    .then((res) => {
                        var a = 0;
                        console.log("in then()");
                    });
            });
        });
    });
}

app.get('/ads', function(req, res) {
    var platformShare = req.query['platformShare'];
    var referralShare = req.query['referralShare'];

    var referral = req.query['referral'];
    var seller = req.query['seller'];
    var platform = platformAddress;
    generateCPAContract(platformShare, referralShare, referral, seller, platform).then((result) => {
        res.json(result);
    });
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