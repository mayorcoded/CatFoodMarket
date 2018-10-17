const base = require('./Base');

const MarketplaceTest = base.MarketplaceTest;
const web3 = base.web3;

/**
 * Some teneral test
 */
contract('Marketplace', async (accounts) => {
    /**
     * Some accounts
     */
    const alice = accounts[0]; // owner because it is the first
    const bob = accounts[1];
    const mark = accounts[2];
    const sally = accounts[3];

    // instance of contract
    let marketPlace;

    beforeEach(async () => {
        //create a new instance on every test
        marketPlace = await MarketplaceTest.new();
    });
    describe("General", () => {

        /**
         * getSenderRole methods returns a role array by given address (via msg.sender).
         * The roles array length is fixed.
         * First item represent if the sender is super admin (owner). if true, the sender is super admin
         * Second item represent if the sender is admin . if true, the sender is admin
         * Third item represent if the sender is store owner . if true, the sender is store owner
         * Fourth item represent if the sender is shoppers . if true, the sender is shoppers. Now fourth item is always true. It will be used in future to ban etc.
         */
        it('gets correct role', async () => {
            let roles;
            roles = await marketPlace.getSenderRole({from: alice});
            assert.deepEqual(roles, [true, false, false, true]);

            await marketPlace.createAdmin(alice, 'some name');
            roles = await marketPlace.getSenderRole({from: alice});
            assert.deepEqual(roles, [true, true, false, true]);

            await marketPlace.createStoreOwner(alice, 'some name');
            roles = await marketPlace.getSenderRole({from: alice});
            assert.deepEqual(roles, [true, true, true, true]);

            await marketPlace.createAdmin(bob, 'some name');
            roles = await marketPlace.getSenderRole({from: bob});
            assert.deepEqual(roles, [false, true, false, true]);
        });

        /**
         * It checks authorizations
         *
         * Only the owner create an admin.
         * The owner or an admin can create a store owner.
         * An admin can not create another admin.
         * A store owner can not create another store owner.
         */
        it('checks authorizations', async () => {
            // super admin can define a user as admin
            await marketPlace.createAdmin(bob, 'some name', {from: alice});

            // super admin can define a user as store owner
            await marketPlace.createStoreOwner(bob, 'some name');

            // admin can not!! define a user as admin
            try {
                await marketPlace.createAdmin(mark, 'some name', {from: bob});
                assert(false);
            } catch (err) {
                assert(true);
            }

            // admin can define a user as store owner
            await marketPlace.createStoreOwner(mark, 'some name', {from: bob});

            // store owner can not define a user as store owner
            try {
                await marketPlace.createStoreOwner(sally, 'some name', {from: mark});
                assert(false);
            } catch (err) {
                assert(true);
            }
        });

        /**
         * In paused mode most features are disable.
         * In this test we should see creating an admin operation throws an error.
         */
        it('checks paused mode / emergency mode', async () => {
            await marketPlace.createAdmin(bob, 'some name', {from: alice});

            marketPlace.pause();

            try {
                await marketPlace.createAdmin(mark, 'some name', {from: alice});
                assert(false);
            } catch (err) {
                assert(true);
            }
        });

        /**
         * It tests what will be happen after destruct a contract.
         * as simply it tests the mortal design pattern implementation.
         */
        it('destructs the contract', async () => {

            let somePrice = web3.utils.toWei("0.1", "ether");

            await marketPlace.createStoreOwner(bob, 'some name', {from: alice});
            await marketPlace.addProduct("product 1", somePrice, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            await marketPlace.purchaseProduct(1, {from: mark, value: somePrice});

            let balanceOfBeforeDestruct = await web3.eth.getBalance(alice);
            let balanceOfContractBeforeDestruct = await marketPlace.getBalance({from: alice});

            await marketPlace.destroy({from: alice});

            let balanceOfContractAfterDestruct = await web3.eth.getBalance(alice);

            assert.equal(balanceOfContractBeforeDestruct, somePrice, "The price should be equal to contract balance before contract destructing");
            assert(web3.utils.fromWei(balanceOfContractAfterDestruct.valueOf(), 'ether') > web3.utils.fromWei(balanceOfBeforeDestruct.valueOf(), 'ether'));

            try {
                await marketPlace.getBalance({from: alice});
                assert(false);
            } catch (err) {
                assert(true);
            }
        });
    });
});
