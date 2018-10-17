const base = require('./Base');
const BigNumber = require('bignumber.js');
const web3 = base.web3;
const _ = base._;
const MarketplaceTest = base.MarketplaceTest;
const truffleAssert = require('truffle-assertions');

contract('Marketplace', async (accounts) => {
    /**
     * Some accounts
     */
    const alice = accounts[0]; // also owner
    const bob = accounts[1];
    const mark = accounts[2];
    const sally = accounts[3];

    // instance of contract
    let marketPlace;

    beforeEach(async () => {
        //create a new instance on every test
        marketPlace = await MarketplaceTest.new();
    });

    describe("Admin tests", () => {

        /**
         * It creates an admin. An admin can only created by the owner of contract (in here it is alice).
         * After creating operation 'AdminAdded' is fired.
         */
        it('creates an admin', async () => {

            let result = await marketPlace.createAdmin(bob, 'some name');

            const adminInfo = await marketPlace.adminInfo(bob);

            assert.equal(adminInfo[0].toNumber(), 0, "Bob admin id was '1'");
            assert.equal(web3.utils.toUtf8(adminInfo[1]), "some name", "Admin name should be 'some name' after converted to utf8");
            assert.equal(adminInfo[2], bob, "Admin address must be 'bob'");

            // event assertion
            truffleAssert.eventEmitted(result, 'AdminAdded', (event) => {
                return event.adminAddr === bob && web3.utils.toUtf8(event.adminName) === "some name";// some name as hex
            })
        });

        /**
         * It adds some admins and checks if the remove admin function is run correctly.
         */
        it('removes an admin', async () => {
            await marketPlace.createAdmin(bob, 'bob name', {from: alice});
            await marketPlace.createAdmin(mark, 'mark name', {from: alice});
            let result = await marketPlace.removeAdmin(bob, {from: alice});
            await marketPlace.createAdmin(sally, 'sally name', {from: alice}); //this is only for stability.

            let adminList = await marketPlace.getAdmins();

            assert.equal(2, adminList.length, "The total number of admins should be 2");

            // event assertion
            truffleAssert.eventEmitted(result, 'AdminRemoved', (event) => {
                return event.adminAddr === bob && web3.utils.toUtf8(event.adminName) === "bob name";// some name as hex
            })
        });

        /**
         * It updates the name of an existing admin and check if it is updated correctly.
         */
        it("updated an existing admin name", async () => {
            // new admin
            await marketPlace.createAdmin(bob, 'bob name', {from: alice});

            // update ops
            let result = await marketPlace.updateAdminName(bob, 'bob new name', {from: alice});

            // get updated admin
            let adminInfo = await marketPlace.adminInfo(bob);


            assert.equal(web3.utils.toUtf8(adminInfo[1]), 'bob new name', 'new name should be "bob new name"');

            // after updating operation an event called AdminUpdated  is fired.
            truffleAssert.eventEmitted(result, 'AdminUpdated', (event) => {
                return event.adminAddr === bob && web3.utils.toUtf8(event.adminName) === "bob new name";
            })
        });

        /**
         * It gets all admin address;
         */
        it('gets admin list', async () => {
            await marketPlace.createAdmin(bob, 'some name');
            await marketPlace.createAdmin(mark, 'some name');

            let adminList = await marketPlace.getAdmins();

            assert.equal(mark, adminList[1], "Second admin address (index 1) should be mark");
            assert.equal(2, adminList.length, "The total number of admins should be 2");
        });

        /**
         * To get more performance all admin gets at once.
         * While returning all admins, address, name and ids are grouped.
         * Example:
         * [bob address, mark address, sally address], [bob id, mark id, sally id], [bob name, mark name, sally name]
         *
         * String type can't be returned in an array. This is the EVM limitation, therefore, bye32 type selected to store name value of an admin.
         */
        it('gets admin list with info', async () => {
            await marketPlace.createAdmin(bob, 'bob name');
            await marketPlace.createAdmin(mark, 'mark name');
            await marketPlace.createAdmin(sally, 'sally name');
            const adminList = await marketPlace.getAdminWithInfo();

            assert.deepEqual(adminList[0], [bob, mark, sally], "it contains all addresses of admins");
            assert.deepEqual(adminList[1].map(item => item.toNumber()), [0, 1, 2], "it contains all ids of admins");
            assert.deepEqual(adminList[2].map(item => web3.utils.toUtf8(item)), ["bob name", "mark name", "sally name"], "it contains all names of admins");

            // console.log(adminList);

            // adres adedi
            // const adminLength = adminList[0].length;
            // let summaryInfo = [];
            // var BigNumber = web3.utils.toBigNumber(0).constructor;
            // console.log(web3.utils.toBN(3).toString());

            // _.range(0, adminLength).forEach(function (value, key) {
            //     summaryInfo.push({
            //         addr: adminList[0][key],
            //         id: parseInt(adminList[1][key]),
            //         name: web3.utils.toUtf8(adminList[2][key]),
            //     })
            // });
        });
    });
});
