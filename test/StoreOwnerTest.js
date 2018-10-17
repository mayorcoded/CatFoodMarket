const base = require('./Base');

const MarketplaceTest = base.MarketplaceTest;
const web3 = base.web3;
const Web3 = base.Web3;
const _ = base._;
const truffleAssert = require('truffle-assertions');

contract('Marketplace', async (accounts) => {
    /**
     * Some accounts
     */
    const alice = accounts[0]; // owner
    const bob = accounts[1];
    const mark = accounts[2];
    const sally = accounts[3];

    // instance of contract
    let marketPlace;

    beforeEach(async () => {
        //create a new instance on every test
        marketPlace = await MarketplaceTest.new();
    });

    describe("Store Owner tests", () => {

        /**
         * It creates a store owner.
         * Only an admin or the owner can create a store owner
         */
        it('creates store owner', async () => {
            const result = await marketPlace.createStoreOwner(bob, 'some name');

            const storeOwnerInfo = await marketPlace.storeOwnerInfo(bob);

            assert.deepEqual(
                [
                    storeOwnerInfo[0].toNumber(),
                    web3.utils.toUtf8(storeOwnerInfo[1]),
                    storeOwnerInfo[2],
                ],
                //expected
                [
                    0,// id
                    "some name", // name
                    bob, // address
                ]
            );

            // event assertion
            truffleAssert.eventEmitted(result, 'StoreOwnerAdded', (event) => {
                return event.addr === bob && event.name === '0x736f6d65206e616d650000000000000000000000000000000000000000000000';// some name as hex
            })
        });

        /**
         * It gets a store owner info. to determinate which store owner wanted, msg.sender global variable is used.
         * This method is used to show a store owner summary information on their dashboard page.
         * Note: A store owner name is stored as byte32 and it needs to be converted to utf8.
         */
        it('gets store owner info', async () => {
            // create two storage owners
            await marketPlace.createStoreOwner(bob, 'some name');
            await marketPlace.createStoreOwner(mark, 'mark name');

            const storageOwnerInfo = await marketPlace.getStoreOwnerInfo({from: bob});

            assert.equal(storageOwnerInfo[0].valueOf(), 0, "The store owner id must be 0");
            assert.equal(web3.utils.toUtf8(storageOwnerInfo[1]), "some name", "The store owner name must be some name after converted to utf8.");
            assert.equal(storageOwnerInfo[2], bob, "The store owner address must be 'bob'");
            assert.equal(storageOwnerInfo[3].valueOf(), 0, "The balance of the store owner must be 0.");
        });

        /**
         * When a store owner has been removed, fired StoreOwnerRemoved event that has two parameters are addr and name
         * After a store owner was removed, another store owner has been tried to add,
         * then check if the total number of store owners is 2
         */
        it('removes store owner', async () => {
            await marketPlace.createStoreOwner(bob, 'bob name', {from: alice});
            await marketPlace.createStoreOwner(mark, 'mark name', {from: alice});

            const result = await marketPlace.removeStoreOwner(bob, {from: alice});

            await marketPlace.createStoreOwner(sally, 'sally name', {from: alice});
            const storeOwnerList = await marketPlace.getStoreOwners();


            assert.equal(2, storeOwnerList.length, "Total number of store owner must be 2");

            // event assertion
            truffleAssert.eventEmitted(result, 'StoreOwnerRemoved', (event) => {
                return event.addr === bob && web3.utils.toUtf8(event.name) === 'bob name';
            })
        });

        /**
         * It updates the name of an existing store owner and check if it is updated correctly.
         */
        it("updated an existing store owner name", async () => {
            // new admin
            await marketPlace.createStoreOwner(bob, 'bob name', {from: alice});

            // update ops
            let result = await marketPlace.updateStoreOwnerName(bob, 'bob new name', {from: alice});

            // get updated admin
            let storeOwnerInfo = await marketPlace.getStoreOwnerInfo({from: bob});


            assert.equal(web3.utils.toUtf8(storeOwnerInfo[1]), 'bob new name', 'new name should be "bob new name"');

            // after updating operation an event called AdminUpdated  is fired.
            truffleAssert.eventEmitted(result, 'StoreOwnerUpdated', (event) => {
                return event.addr === bob && web3.utils.toUtf8(event.name) === "bob new name";
            })
        });

        /**
         * It gets all store owner addresses;
         */
        it('gets store owner list', async () => {
            await marketPlace.createStoreOwner(bob, 'some name');
            await marketPlace.createStoreOwner(mark, 'some name');

            let storeOwnerList = await marketPlace.getStoreOwners();

            assert.equal(mark, storeOwnerList[1], "Second store owner must be mark");
            assert.equal(2, storeOwnerList.length, "Total number of store owner must be 2");
        });

        ////////// store owner events
        it('emits event when a store owner was added', async () => {
            const result = await marketPlace.createStoreOwner(bob, 'some name');

            truffleAssert.eventEmitted(result, 'StoreOwnerAdded', (event) => {
                return event.addr === bob
                    && event.name === '0x736f6d65206e616d650000000000000000000000000000000000000000000000';// some name as hex
            })
        });

        /**
         * It gets all store owners
         * @dev https://medium.com/coinmonks/solidity-tutorial-returning-structs-from-public-functions-e78e48efb378
         *
         * [bob address, mark address, sally address], [bob id, mark id, sally id], [bob name, mark name, sally name]
         *
         * String type can't be returned in an array. This is the EVM limitation, therefore, bye32 type selected to store name value of a store owner.
         */
        it('gets store owner list with info', async () => {
            await marketPlace.createStoreOwner(bob, 'bob name');
            await marketPlace.createStoreOwner(mark, 'mark name');
            await marketPlace.createStoreOwner(sally, 'sally name');
            const storeOwnerList = await marketPlace.getStoreOwnerWithInfo.call();

            // adres adedi
            const storeOwnerLength = storeOwnerList[0].length;
            let summaryInfo = [];

            _.range(0, storeOwnerLength).forEach(function (value, key) {
                summaryInfo.push({
                    addr: storeOwnerList[0][key],
                    id: parseInt(storeOwnerList[1][key]),
                    name: web3.utils.toUtf8(storeOwnerList[2][key]),
                })
            });

            assert.deepEqual(
                summaryInfo,
                [
                    {
                        addr: bob,
                        id: 0,
                        name: 'bob name',
                    },
                    {
                        addr: mark,
                        id: 1,
                        name: 'mark name',
                    },
                    {
                        addr: sally,
                        id: 2,
                        name: 'sally name',
                    }
                ]
            );
        });

        /**
         * It tests withdraw operation from the start to the end.
         */
        it("withdraws value from contract", async () => {
            // create storage owner
            await marketPlace.createStoreOwner(bob, 'bob name');

            // let xxx = await marketPlace.getStoreOwnerInfo({from: bob}).then((result) => {
            //     return result[3];
            // });
            // return;
            await marketPlace.addProduct("product 1", 1000, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            // we are expecting "0"
            let balaceOfContractAtStart = await marketPlace.getBalance({from: alice});

            let originalBalanceAtStart = await web3.eth.getBalance(bob);

            // we are expecting "0"
            let balanceOfStoreOwnerAtStart = await marketPlace.getStoreOwnerInfo({from: bob}).then((result) => {
                return result[3];
            });

            // purchased first product
            await marketPlace.purchaseProduct(1, {from: alice, value: 1000});

            // we are expecting "1000"
            let balanceOfContractAfterPurchased = await marketPlace.getBalance({from: alice});

            // we are expecting "1000"
            let balanceOfStoreOwnerAtPurchased = await marketPlace.getStoreOwnerInfo({from: bob}).then((result) => {
                return result[3];
            });

            let result = await marketPlace.withdraw({from: bob});

            let originalBalanceAfterWithdraw = await web3.eth.getBalance(bob);

            // we are expecting "0"
            let balanceOfContractAfterWithdraw = await marketPlace.getBalance({from: alice});

            // we are expecting "0"
            let balanceOfStoreOwnerAtWithdraw = await marketPlace.getStoreOwnerInfo({from: bob}).then((result) => {
                return result[3];
            });

            assert.equal(balaceOfContractAtStart, 0, "balance of contract at the beginning");
            //!important this is not balance of bob address, this only value in kept in balances array
            assert.equal(balanceOfStoreOwnerAtStart, 0, "balance of bob at the beginning");


            assert.equal(balanceOfContractAfterPurchased, 1000, "balance of contract after the product was purchased.");
            //!important this is not balance of bob address, this only value in kept in balances array
            assert.equal(balanceOfContractAfterPurchased, 1000, "balance of bob after the product was purchased.");


            assert.equal(balanceOfContractAfterWithdraw, 0, "balance of contract after bob's eths has been withdrawn");
            assert.equal(balanceOfStoreOwnerAtWithdraw, 0, "balance of bob after bob's eths has been withdrawn");


            //event assertion
            truffleAssert.eventEmitted(result, 'Withdrawn', (event) => {
                return event.addr === bob;
            });

            // test original balance of bob
            // assert.isAtMost(originalBalanceAfterWithdraw, originalBalanceAtStart - 1000);
        })
    });
});
