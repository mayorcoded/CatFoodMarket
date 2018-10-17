pragma solidity 0.4.24;

import "./StoreOwnerAbstract.sol";


/**
 * @title Marketplace
 * @author Mahmut Bayri <mahmutbayri@gmail.com>
 */
contract ProductAbstract is StoreOwnerAbstract {
    using SafeMath for uint;

    uint internal currentProductIndex = 1;

    uint[] internal productIndexes;
    mapping(uint => Product) internal products;

    struct Product {
        uint id;
        string name;
        uint price;
        uint quantity;
        string imageHash;
        address storeOwner;
    }

    event ProductAdded(uint productId, string productName);
    event ProductRemoved(uint productId);
    event ProductUpdated(uint productId);
    event ProductPurchased(uint productId, address indexed sender);

    // customer address -> product
    mapping(address => Product[]) internal customerPurchasedProduct;

    modifier isOnlyProductStoreOwner(uint _productId) {
//        Product memory product = products[_productId]; // removed -> Checks-Effects-Interactions Pattern
        require(products[_productId].storeOwner == msg.sender);
        _;
    }

    /**
      * @param _name The name of product
      * @param _price The price of product
      * @param _quantity The quantity of product
      * @param _imageHash The ipfs image hash of product
      */
    function addProduct(string _name, uint _price, uint _quantity, string _imageHash)
        external
        whenNotPaused
        nonReentrant
        isStoreOwner(msg.sender)
    {
        uint newId = currentProductIndex++;

        Product memory product = Product({
            id : newId,
            name : _name,
            price : _price,
            quantity : _quantity,
            imageHash : _imageHash,
            storeOwner : msg.sender
        });

        // product info
        products[newId] = product;

        // product index
        productIndexes.push(newId);

        emit ProductAdded(newId, _name);
    }

    /**
      * @dev Removes the product information from productIndexes (it keeps product id)
      * and products (it keeps product detail)
      *
      * @param _productId The id of product
      */
    function removeProduct(uint _productId) external whenNotPaused nonReentrant isOnlyProductStoreOwner(_productId) {
        uint productLength = productIndexes.length;
        uint[] memory productIndexesCopy = productIndexes;
        // foundedIndex will be >=0
        // if foundedIndex is still -1, this means there was not found any product.
        int foundedIndex = -1;

        for (uint i = 0; i < productLength; i++) {
            if (productIndexesCopy[i] == _productId) {
                foundedIndex = int(i);
                break;
            }
        }

        if (foundedIndex != -1) {
            uint lastIndex = productLength.sub(1);
            productIndexes[uint(foundedIndex)] = productIndexes[lastIndex];
            productIndexes.length = productIndexes.length.sub(1);
            delete products[_productId];
        }

        emit ProductRemoved(_productId);
    }

    /*
      * @dev Updated name, price, quantity by store owner of product
      * @param _productId The id of an existed product.
      * @param _newName The name of an existed product.
      * @param _newPrice The price of an existed product.
      * @param _newQuantity The quantity of an existed product.
      */
    function updateProduct(uint _productId, string _newName, uint _newPrice, uint _newQuantity)
        external
        whenNotPaused
        nonReentrant
        isOnlyProductStoreOwner(_productId)
        returns (bool)
    {
        Product storage product = products[_productId];
        product.name = _newName;
        product.price = _newPrice;
        product.quantity = _newQuantity;
        emit ProductUpdated(_productId);
        return true;
    }

    /**
      * @dev a copy of product is copied to customerPurchasedProduct to show in Purchased Product page
      * @param _productId The id of product will be purchased.
      */
    function purchaseProduct(uint _productId) external payable whenNotPaused {
        Product memory productCopy = products[_productId];
        require(productCopy.price == msg.value, "Value is not enough to purchase");

        // add purchased product to customerPurchasedProduct mapping
        productCopy.quantity = 1;
        // customer purchase 1 product
        customerPurchasedProduct[msg.sender].push(productCopy);

        Product storage product = products[_productId];
        product.quantity = product.quantity.sub(1);
        balances[product.storeOwner] = balances[product.storeOwner].add(uint(msg.value));
        emit ProductPurchased(_productId, msg.sender);
    }

    /**
      * @return length of project
      */
    function getProductsCount() external view returns (uint) {
        return productIndexes.length;
    }

    /**
      * @return Product ids
      */
    function getProductIndexes() external view returns (uint[]) {
        return productIndexes;
    }

    /**
      * @param _storeOwner The address of store owner
      */
    function getProductIndexesByStoreOwner(address _storeOwner) external view returns (uint[]) {
        uint productsLength = productIndexes.length;
        uint[] memory storeOwnerProductIndexes = new uint[](productsLength);
        uint productId;

        for (uint i = 0; i < productIndexes.length; i++) {
            productId = productIndexes[i];
            if (products[productId].storeOwner == _storeOwner) {
                storeOwnerProductIndexes[i] = productId;
            }
        }

        return storeOwnerProductIndexes;
    }

    /**
      * @param _productId The id of product
      * @return product
      */
    function getProduct(uint _productId) external view returns (uint, string, uint, uint, string, address) {
        Product memory product = products[_productId];
        return (product.id, product.name, product.price, product.quantity, product.imageHash, product.storeOwner);
    }

    /**
      * @dev gets the product is purchased by a customer.
      * @param _purchasedIndex The product index! of purchased product
      * @return The id of the product
      * @return The name of the product
      * @return The price of the product
      * @return The imageHash of the product to show product thumbnail
      * @return The store owner address of the product
      */
    function getPurchasedProduct(uint _purchasedIndex) external view returns (uint, string, uint, string, address) {
        Product memory purchasedProduct = customerPurchasedProduct[msg.sender][_purchasedIndex];
        return (
            purchasedProduct.id,
            purchasedProduct.name,
            purchasedProduct.price,
            purchasedProduct.imageHash,
            purchasedProduct.storeOwner
        );
    }

    /**
      * @dev gets the count of purchased products by a customer is given by msg.sender global variable.
      * @return The length of purchased product by a customer
      */
    function getPurchasedProductCount() external view returns (uint) {
        Product[] memory purchasedProducts = customerPurchasedProduct[msg.sender];
        return purchasedProducts.length;
    }
}
