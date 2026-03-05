const Web3 = require("web3");
const path = require("path");
require("dotenv").config();

const contractJson = require(path.join(__dirname, "../../build/contracts/EHRAccessAudit.json"));

const web3 = new Web3(process.env.RPC_URL);
const address = contractJson.networks[process.env.NETWORK_ID].address;
const contract = new web3.eth.Contract(contractJson.abi, address);

module.exports = { web3, contract };