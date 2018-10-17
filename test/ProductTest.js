const base = require('./Base');

const web3 = base.web3;
const _ = base._;
const MarketplaceTest = base.MarketplaceTest;
const truffleAssert = require('truffle-assertions');


contract('Marketplace', async (accounts) => {
    /**
     * Some accounts
     */
    const alice = accounts[0];
    const bob = accounts[1];
    const mark = accounts[2];
    const sally = accounts[3];

    // instance of contract
    let marketPlace;


    beforeEach(async () => {
        //create a new instance on every test
        marketPlace = await MarketplaceTest.new();
    });

    describe("product tests", () => {

        it('adds a product', async () => {

            await marketPlace.createStoreOwner(bob, 'some name');

            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            const product = await marketPlace.getProduct(1);

            const expected = {
                id: 1,
                name: 'product 1',
                price: 10,
                quantity: 20,
                imageHash: "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU",
                storeOwner: bob
            };

            assert.deepEqual(
                {
                    id: product[0].toNumber(),
                    name: product[1],
                    price: product[2].toNumber(),
                    quantity: product[3].toNumber(),
                    imageHash: product[4],
                    storeOwner: product[5].toString()
                },
                expected
            );
        });

        it('removes a product', async () => {

            await marketPlace.createStoreOwner(bob, 'some name');

            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.addProduct("product 2", 10, 100, "ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.addProduct("product 3", 10, 100, "ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            await marketPlace.removeProduct(2, {from: bob});
            let product = await marketPlace.getProduct(2);
            let productIds = await marketPlace.getProductIndexes();

            let expectedIds = productIds.map((item, index) => {
                return parseInt(item);
            });

            assert.deepEqual([1, 3], expectedIds);
            assert.equal(product[0].toNumber(), 0); // because struct gives an empty value

        });

        /**
         * in this example the quantity of product 1 is 20,
         * after the purchase we are expecting to be 19
         */
        it("purchases a product and reduces of its quantity", async () => {
            await marketPlace.createStoreOwner(bob, 'some name');
            await marketPlace.addProduct("product 1", 1000, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.purchaseProduct(1, {from: alice, value: 1000});

            let product = await marketPlace.getProduct(1);

            assert.equal(product[3].toNumber(), 19)
        });

        /**
         * // let balance = await web3.eth.getBalance(marketPlace.address); backup
         */
        it("purchases a product and adds to it to the customerPurchasedProduct map", async () => {

            await marketPlace.createStoreOwner(bob, 'some name');

            await marketPlace.addProduct("product 1", 1000, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.addProduct("product 2", 10, 100, "ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.addProduct("product 3", 500, 100, "ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            //purchase product
            await marketPlace.purchaseProduct(1, {from: mark, value: 1000});

            await marketPlace.purchaseProduct(3, {from: mark, value: 500});


            // the nomber of purchased product
            const count = await marketPlace.getPurchasedProductCount({from: mark});

            // first purchased product
            const firstPurchasedProduct = await marketPlace.getPurchasedProduct(0, {from: mark});

            // get balance of market place
            const balance = await marketPlace.getBalance({from: alice});

            // purchased product count
            assert.equal(count.toNumber(), 2);

            assert.deepEqual(
                [
                    firstPurchasedProduct[0].toNumber(),
                    firstPurchasedProduct[1].toString(),
                    firstPurchasedProduct[2].toNumber(),
                ],
                [
                    1,
                    'product 1',
                    1000
                ]
            );
            assert.equal(balance.toNumber(), 1500)
        });

        it('gets all products of a store owner', async () => {
            await marketPlace.createStoreOwner(bob, 'some name');
            await marketPlace.createStoreOwner(alice, 'some name');

            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: alice});
            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            let result = await marketPlace.getProductIndexesByStoreOwner(bob);

            let filteredIds = result
                .map(item => {
                    return item.toNumber();
                })
                .filter(id => {
                    return id !== 0;
                });

            assert.deepEqual(filteredIds, [2]);
        });

        it('gets all products for list', async () => {
            await marketPlace.createStoreOwner(bob, 'some name');

            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});
            await marketPlace.addProduct("product 2", 10, 100, "ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            let productIds = await marketPlace.getProductIndexes();

            let products;

            await Promise.all(
                productIds.map((id) => {
                    return marketPlace.getProduct(id.toNumber())
                })
            ).then((result) => {

                products = result.map((product, index) => {
                    return {
                        id: product[0].toNumber(),
                        name: product[1].toString(),
                        price: product[2].toNumber(),
                        quantity: product[3].toNumber(),
                        imageHash: product[4].toString()
                    }
                });
            });

            let expected = [
                {
                    id: 1,
                    name: 'product 1',
                    price: 10,
                    quantity: 20,
                    imageHash: 'QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU'
                },
                {
                    id: 2,
                    name: 'product 2',
                    price: 10,
                    quantity: 100,
                    imageHash: 'ZmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU'
                }
            ];

            assert.deepEqual(
                products,
                expected
            );
        });

        // it.only('gets products ids by store owner address', async () => {
        //     await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU");
        //     await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU");
        // });

        it('updates a product info', async () => {
            await marketPlace.createStoreOwner(bob, 'some name');
            await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            let result = await marketPlace.updateProduct(1, "product name", 5, 10, {from: bob});

            const product = await marketPlace.getProduct(1);

            assert.equal(product[0].toNumber(), 1, "Updated product id should to be 1");
            assert.equal(product[1], "product name", "Updated product name should to be 'product name'");
            assert.equal(product[2].toNumber(), 5, "Updated product price has to be 5");
            assert.equal(product[3].toNumber(), 10, "Updated product quantity has to be 10");

            //event assertion
            truffleAssert.eventEmitted(result, 'ProductUpdated', (event) => {
                return event.productId.toNumber() === 1;
            });
        });


        it('emits event when a product was added', async () => {
            await marketPlace.createStoreOwner(bob, 'some name');
            const result = await marketPlace.addProduct("product 1", 10, 20, "QmTC2nkmUipbzUWe4o5f3jgvDz2qF9wBb1XUxq9csXmNVU", {from: bob});

            truffleAssert.eventEmitted(result, 'ProductAdded', (event) => {
                return event.productId.toNumber() === 1 && event.productName === "product 1";
            })
        });
    });
});
