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

//constants
var mongodbnode = 'mongodb://localhost:27017/myproject';
var rpcnode = "http://localhost";
var rpcport = "8545";
var sampleContract = "performerSell.sol";
var platformAddress = "0x93c517e1f32084f8c2794abad6efe802e52c3759";


function generateCPAContract(platformShare, performerShare, performer, customer, platform) {
    return new Promise((resolve) => {
        fs.readFile(sampleContract, function (err, buf) {
            if (err)
                resolve({ error: err });

            var data = {
                "platformShare": platformShare,
                "performerShare": performerShare,
                "performer": performer,
                "customer": customer,
                "platform": platform
            };
            var contractString = buf.toString('utf8');
            var template = handlebars.compile(contractString)(data);
            var output = solc.compile(template, 1);
            const bytecode = output.contracts[':performerSell'].bytecode;
            const abi = JSON.parse(output.contracts[':performerSell'].interface);
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
                    from: customer,
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
    var web3 = new Web3();
    var web3 = new Web3(Web3.givenProvider || new Web3.providers.HttpProvider(rpcnode + ':' + rpcport));

    new Promise((resolve, reject) => {
        MongoClient.connect(mongodbnode, function (err, db) {
            if (err) {
                console.log("cannot connect to mongoDB server");
                reject(err);
            }
            DB = db;
            assert.equal(null, err);
            console.log("Connected successfully to mongoDB server");

            var contractDB = db.db('contractDB');
            //   Create a collection
            contractsCollection = contractDB.collection('contracts');
            // contractsCollection.find().toArray(function(err, docs) {

            // });
            resolve(contractsCollection);
        });
    }).then((contractsDB) => {
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/v1/create', function (req, res) {
    console.log("/v1/create");
    if (!req.body) {
        res.json({
            error: 'invalid request body'
        });
        return;
    }
    var lastContract = contractsCollection.findOne({ $query: {}, $orderby: { id: -1 } });
    if (!lastContract)
        lastContractID = 0;
    else
        lastContractID = lastContract.id + 1;

    req.body.id = lastContractID;

    contractsCollection.insertOne(
        req.body

        // platformShare: req.query['platformShare'],
        // performerShare: req.query['performerShare'],
        // performer: req.query['performer'],
        // customer: req.query['customer'],
        // platform: platformAddress


    );
    res.send()
});

app.get('/createContract', function (req, res) {
    var platformShare = req.query['platformShare'];
    var performerShare = req.query['performerShare'];

    var performer = req.query['performer'];
    var customer = req.query['customer'];
    var platform = platformAddress;

    generateCPAContract(platformShare, performerShare, performer, customer, platform).then((result) => {
        res.json(result);
    });
});

app.get('/viewcontract', function (req, res) {

});

// app.get('/savecontract', )

// app.get('/newcontract', function (req, res) {

//     contractsCollection.insertOne({
//         sellerAddress
//     });
//     // uuidv1()
//     // contractsCollection.
//         // res.json();
// });

app.get('/v1/contracts', function (req, res) {
    contractsCollection.find().toArray(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });

    //     caseTemplateId[num; ]

    //     deposit[
    //         needDeposit[true; false; ]
    //     depositSum[num; ]
    // ]

    //     payment[
    //         paymentType[onSum; everyTransaction; ]
    //     paymentClause[more; equal; ]
    // ]

    //     customer[
    //         bool: customerIsCompany[true; false; ]
    //     string: customerName[text; ]
    //     string: customerRegisterNumber[text; ]
    //     string: customerTaxNumber[text; ]
    //     string: customerAddress[text; ]
    //     int: customerShare[num; ]
    // ]

    //     performer[
    //         bool: performerIsCompany[true; false; ]
    //     string: performerName[text; ]
    //     string: performerRegisterNumber[text; ]
    //     string: performerTaxNumber[text; ]
    //     string: performerAddress[text; ]
    //     enum: performerPayType[percent; fixed; ]
    //     int: performerShare[num; ] 
    //     int: performerFixedSum[num; ]
    // ]


    // res.json();
});

// app.get('/', function (req, res) {
//     // console.log("test");
// });


// Use connect method to connect to the server