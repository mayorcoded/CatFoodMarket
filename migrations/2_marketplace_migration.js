var Migrations = artifacts.require("./Marketplace.sol");

module.exports = function(deployer) {
    deployer.deploy(Migrations);
};
