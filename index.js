// libs
var exec = require('child_process').execFile;
var express = require('express');
var Web3 = require('web3');
var handlebars = require('handlebars');
var fs = require('fs');
var solc = require('solc');
var uuidv1 = require('uuid/v1');
const bodyParser = require('body-parser');

// var CPAContractModel = require('./models').CPAContractModel;
// var session = require("express-session");

var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

//globals
var contractsCollection;
var app;
var web3;
var obj;

//constants
var mongodbnode = 'mongodb://localhost:27017/coinbalanced';
var rpcnode = "http://localhost";
var rpcport = "8545";
var sampleContract = "performerSell.sol";
var platformAddress = "0x93c517e1f32084f8c2794abad6efe802e52c3759";
var platformShare = 1;
var minSum = 100;

function generateContractFromRequest(req
) {
    var contractPath = "Contracts/" + contractFromRequest(req);
    // var contractPath = "Contracts/nonDeposit/TreatyWithAmountOfPaymentPercent.sol";
    // test();
    // req = obj;

    return new Promise((resolve) => {
        fs.readFile(contractPath, function (err, buf) {
            if (err)
                resolve({ error: err });

            var contractString = buf.toString('utf8');
            var output = solc.compile(contractString, 1);
            var contractKey = Object.keys(output.contracts)[0];
            const bytecode = output.contracts[contractKey].bytecode;
            const abi = JSON.parse(output.contracts[contractKey].interface);
            const contract = new web3.eth.Contract(abi);

            var args = [
                req.customer.customerAddress,
                req.performer.performerAddress,
                platformAddress
            ];

            if (req.performer.performerFixedSum) {
                args.push(web3.utils.toWei(req.performer.performerFixedSum));
            }
            else {
                args.push(req.performer.performerShare);
            }
            args.push(platformShare);
            if (req.payment.paymentType === "onSum") {
                args.push(web3.utils.toWei(minSum));
            }
            if (req.performer.depositSum) {
                args.push(web3.utils.toWei(req.performer.depositSum));
            }
            var contractInstance = contract.deploy({
                data: '0x' + bytecode,
                arguments: args
            });
            contractInstance.estimateGas().then((gas) => {
                console.log("contract_id = " + req.id + "; estimatedGas: " + gas);
                return gas;
            }).then((estimatedGas) => {
                contractInstance.send({
                    data: '0x' + bytecode,
                    from: platformAddress,
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

function init() {
    app = express();
    web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(rpcnode + ':' + rpcport));

    new Promise((resolve, reject) => {
        MongoClient.connect(mongodbnode, function (err, db) {
            if (err) {
                console.log("cannot connect to mongoDB server");
                reject(err);
            }
            assert.equal(null, err);
            console.log("Connected successfully to mongoDB server");

            contractsCollection = db.collection('contracts');
            resolve(contractsCollection);
        });
    }).then(() => {
        var server = app.listen(8081, function () {
            var host = server.address().address;
            var port = server.address().port;
            console.log("Example app listening at http://%s:%s", host, port);
        });
    });
}

init();

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// // create application/json parser
// var jsonParser = bodyParser.json()

// // create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/v1/create', function (req, res) {
    console.log("/v1/create");
    var contract = req.body;
    if (!req.body) {
        res.json({
            error: 'invalid request body'
        });
        return;
    }

    generateContractFromRequest(req.body).then((receipt) => {
        this.receipt = receipt;
        contractsCollection.findOne({ $query: {}, $orderby: { id: -1 } }, function (err, lastContract) {
            if (err) {
                console.log(err);
                res.json({ error: err });
                return;
            }

            if (!lastContract)
                lastContractID = 0;
            else
                lastContractID = lastContract.id + 1;

            req.body.id = lastContractID;
            req.body.transactionHash = receipt.transactionHash;
            req.body.contractAddress = receipt.contractAddress;
            contractsCollection.insertOne(req.body,
                function (err, r) {
                    if (err) {
                        console.log(err);
                        res.send(400, "err");
                    }
                }
            );
            res.json({
                status: "OK"
            });
        });
    });


});

function contractFromRequest(req) {
    if (req.test)
        return "ReferralSell.sol";
    if (req.payment.paymentType === "onSum" && req.performer.performerPayType === "percent" && req.deposit.needDeposit) {
        return "Deposit/TreatyWithDeposit.sol"
    }
    else if (req.payment.paymentType === "onSum" && req.performer.performerPayType === "percent" && !req.deposit.needDeposit) {
        return "nonDeposit/TreatyWithoutDeposit.sol"
    }
    else if (req.payment.paymentType === "onSum" && req.performer.performerPayType === "fixed" && req.deposit.needDeposit) {
        return "Deposit/TreatyWithFixedPayment.sol"
    }
    else if (req.payment.paymentType === "onSum" && req.performer.performerPayType === "fixed" && !req.deposit.needDeposit) {
        return "nonDeposit/TreatyWithFixedPayment.sol";
    }
    if (req.payment.paymentType === "everyTransaction" && req.performer.performerPayType === "percent" && req.deposit.needDeposit) {
        return "Deposit/TreatyWithAmountOfPaymentPercent.sol"
    }
    else if (req.payment.paymentType === "everyTransaction" && req.performer.performerPayType === "percent" && !req.deposit.needDeposit) {
        return "nonDeposit/TreatyWithAmountOfPaymentPercent.sol"
    }
    else if (req.payment.paymentType === "everyTransaction" && req.performer.performerPayType === "fixed" && req.deposit.needDeposit) {
        return "Deposit/TreatyWithAmountOfPaymentFixed.sol"
    }
    else if (req.payment.paymentType === "everyTransaction" && req.performer.performerPayType === "fixed" && !req.deposit.needDeposit) {
        return "nonDeposit/TreatyWithAmountOfPaymentFixed.sol"
    }
    else
        return "";
}

// function contractFromTypeID(typeID) {
//     var contractMap = {
//         0: "ReferralSell",
//         //deposit
//         1: "TreatyWithAmountOfPaymentFixed",
//         2: "TreatyWithAmountOfPaymentPercent",

//         3: "TreatyWithDeposit",
//         4: "TreatyWithFixedPayment",
//         //no-deposit
//         5: "TreatyWithAmountOfPaymentFixed",
//         6: "TreatyWithAmountOfPaymentPercent",

//         7: "TreatyWithFixedPayment",
//         8: "TreatyWithoutDeposit"
//     };

//     return contractMap[typeID];
// }

// app.get('/createContract', function (req, res) {
//     var platformShare = req.query['platformShare'];
//     var performerShare = req.query['performerShare'];

//     var performer = req.query['performer'];
//     var customer = req.query['customer'];
//     var platform = platformAddress;

//     generateCPAContract(platformShare, performerShare, performer, customer, platform).then((result) => {
//         res.json(result);
//     });
// });

app.get('/viewcontract', function (req, res) {
    // req.
});

app.post('/v1/delete', function (req, res) {
    // req.query
});

app.get('/v1/contracts', function (req, res) {
    contractsCollection.find().toArray(function (err, docs) {
        // console.log(docs);
        res.json(docs);
    });
});


function test() {
    obj = {
        deposit: {
            depositSum : 100
        },
        payment: {
            paymentType: 
                    "onSum"
                    // "everyTransaction"
        },
        customer: {
            customerName: "nikita",
            customerAddress: "0xfed4354865b65a4639e6679558d9475bd4cb77bf",
            customerShare: 1
        },
        performer: {
            performerName: "margaret",
            performerAddress: "0x37c9e4f27608b1fbacafb262931c4afb07db391e",
            performerPayType: "percent",
            performerShare: 2,
        }
    }
    /*    caseTemplateId[num; ]

        deposit[
            needDeposit[true; false; ]
        depositSum[num; ]
    ]

        payment[
            paymentType[onSum; everyTransaction; ]
        paymentClause[more; equal; ]
    ]

        customer[
            bool: customerIsCompany[true; false; ]
        string: customerName[text; ]
        string: customerRegisterNumber[text; ]
        string: customerTaxNumber[text; ]
        string: customerAddress[text; ]
        int: customerShare[num; ]
    ]

        performer[
            bool: performerIsCompany[true; false; ]
        string: performerName[text; ]
        string: performerRegisterNumber[text; ]
        string: performerTaxNumber[text; ]
        string: performerAddress[text; ]
        enum: performerPayType[percent; fixed; ]
        int: performerShare[num; ] 
        int: performerFixedSum[num; ]
    ]
    */
}