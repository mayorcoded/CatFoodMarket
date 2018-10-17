pragma solidity 0.4.24;

import "./AdminAbstract.sol";


/**
 * @title Store owner methods
 * @author Mahmut Bayri <mahmutbayri@gmail.com>
 */
contract StoreOwnerAbstract is AdminAbstract {

    using SafeMath for uint;

    address[] internal storeOwners;

    struct StoreOwner {
        uint id;
        bytes32 name;
        address addr;
    }

    mapping(address => StoreOwner) public storeOwnerInfo;

    event StoreOwnerAdded(address addr, bytes32 name);
    event StoreOwnerRemoved(address addr, bytes32 name);
    event StoreOwnerUpdated(address addr, bytes32 name);
    event Withdrawn(address addr, uint withdrawAmount);

    //storage owner => balance
    mapping(address => uint) public balances;

    /**
      * @dev Checks if sender address exist in storeOwnerInfo
      * @param _sender the address that will be checked;
      */
    modifier isStoreOwner (address _sender) {
        require(storeOwnerInfo[_sender].addr != address(0), "This address was not found in store owner list");
        _;
    }

    /**
     * @dev an store owner address can not be changed. Instead of this please remove the exist admin and add a new one.
     * @param _address the store owner address will be changed its name.
     */
    function updateStoreOwnerName(address _address, bytes32 _newName)
        external
        whenNotPaused
        nonReentrant
        verifyChangeStorageOwner
    {
        StoreOwner storage storeOwner = storeOwnerInfo[_address];
        storeOwner.name = _newName;
        emit StoreOwnerUpdated(_address, _newName);
    }

    /**
     * @dev Creates a store owner with _address and _name params
     * @param _address The address that will be created
     * @param _name The name of storage owner
     */
    function createStoreOwner(address _address, bytes32 _name)
        external
        whenNotPaused
        nonReentrant
        verifyChangeStorageOwner
    {
        uint id = storeOwners.push(_address);
        StoreOwner memory storeOwner = StoreOwner({
            id : id.sub(1),
            addr : _address,
            name : _name
        });

        storeOwnerInfo[_address] = storeOwner;

        emit StoreOwnerAdded(_address, _name);
    }

    /**
      * @dev Remove the store owner that exists. !!!!Removing a storage owner is not recommended!!!
      * Because some product might be related with this store owner.
      * @param _address Address of the user to be removed
      */
    function removeStoreOwner(address _address) external whenNotPaused nonReentrant verifyChangeStorageOwner {
        StoreOwner memory storeOwner = storeOwnerInfo[_address];
        uint index = storeOwner.id;

        delete storeOwnerInfo[_address];

        uint lastIndex = storeOwners.length.sub(1);

        storeOwners[index] = storeOwners[lastIndex];
        storeOwners.length = storeOwners.length.sub(1);

        emit StoreOwnerRemoved(_address, storeOwner.name);
    }

    /**
      * @return all store owners
      */
    function getStoreOwners() external view returns (address[]) {
        return storeOwners;
    }

    /**
      * @return admins All Store Owners
      * @dev https://medium.com/coinmonks/solidity-tutorial-returning-structs-from-public-functions-e78e48efb378
      */
    function getStoreOwnerWithInfo() external view returns (address[], uint[], bytes32[]) {
        address[] memory _storeOwners = storeOwners;
        uint storeOwnerCount = _storeOwners.length;

        uint[] memory ids = new uint[](storeOwnerCount);
        bytes32[] memory names = new bytes32[](storeOwnerCount);

        for (uint i = 0; i < storeOwnerCount; i++) {
            address addr = _storeOwners[i];
            StoreOwner memory _storeOwnerInfo = storeOwnerInfo[addr];

            ids[i] = _storeOwnerInfo.id;
            names[i] = _storeOwnerInfo.name;
        }

        return (storeOwners, ids, names);
    }

    /**
     * @dev Returns a store owner information.
      * @return id The id of the store owner
      * @return name The name of the store owner
      * @return addr The address of the store owner
      * @return balance The balance value of the store owner
      */
    function getStoreOwnerInfo() public view isStoreOwner(msg.sender) returns (uint, bytes32, address, uint) {
        address sender = msg.sender;
        StoreOwner memory storeOwner = storeOwnerInfo[sender];
        uint balance = balances[sender];

        return (storeOwner.id, storeOwner.name, storeOwner.addr, balance);
    }

    /**
      *
      */
    function withdraw() public isStoreOwner(msg.sender) whenNotPaused nonReentrant {
        require(msg.sender != address(0));
        require(balances[msg.sender] > 0, "The balance of store owner has to be greater than 0");

        uint withdrawAmount = balances[msg.sender];
        balances[msg.sender] = 0;
        msg.sender.transfer(withdrawAmount);
        emit Withdrawn(msg.sender, withdrawAmount);
    }
}