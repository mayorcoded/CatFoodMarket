const MarketplaceTest = artifacts.require("Marketplace");
let Web3 = require('web3');
let _ = Web3.utils._;

module.exports = {
    // truffle uses old wersion of web3
    // in order to use web 1.0.0 features we call it as web3 new.
    web3: new Web3(web3.currentProvider),
    MarketplaceTest: MarketplaceTest,
    _: _
};