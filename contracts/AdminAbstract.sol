pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/lifecycle/Destructible.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/ReentrancyGuard.sol";


/**
 * @title Store owner methods
 * @author Mahmut Bayri <mahmutbayri@gmail.com>
 */
contract AdminAbstract is Destructible, Pausable, ReentrancyGuard {

    using SafeMath for uint;

    modifier verifyChangeStorageOwner() {
        require(
            adminInfo[msg.sender].addr != address(0)
            || msg.sender == owner, "An error occured while is changing storege owner"
        );
        _;
    }

    address[] internal admins;

    struct Admin {
        uint id;
        bytes32 name;
        address addr;
    }

    mapping(address => Admin) public adminInfo;

    event AdminAdded(address adminAddr, bytes32 adminName);
    event AdminRemoved(address adminAddr, bytes32 adminName);
    event AdminUpdated(address adminAddr, bytes32 adminName);

    /**
     * @dev it creates an admin can manage store owners.
     * @param _address The address of admin
     * @param _name The name of admin
     */
    function createAdmin(address _address, bytes32 _name) external whenNotPaused nonReentrant onlyOwner() {

        uint id = admins.push(_address);

        Admin memory admin = Admin({
            id : id.sub(1),
            addr : _address,
            name : _name
        });

        adminInfo[_address] = admin;

        emit AdminAdded(_address, _name);
    }

    /**
      * @dev
      * @param _address Address of the user to be removed
      */
    function removeAdmin(address _address) external whenNotPaused nonReentrant onlyOwner {
        Admin memory admin = adminInfo[_address];
        uint index = admin.id;

        delete adminInfo[_address];

        uint lastIndex = admins.length.sub(1);

        admins[index] = admins[lastIndex];
        admins.length = admins.length.sub(1);

        emit AdminRemoved(_address, admin.name);
    }

    /**
     * @dev an admin address can not be changed. Instead of this please remove the exist admin and add a new one.
     * @param _address the admin address will be changed its name.
     */
    function updateAdminName(address _address, bytes32 _newName) external nonReentrant onlyOwner {
        Admin storage admin = adminInfo[_address];
        admin.name = _newName;
        emit AdminUpdated(_address, _newName);
    }

    /**
      * @return admins All admins
      */
    function getAdmins() external view returns (address[]) {
        return admins;
    }

    /**
      * @dev admins All admins
      * @dev https://medium.com/coinmonks/solidity-tutorial-returning-structs-from-public-functions-e78e48efb378
      * @return admins
      * @return ids
      * @return names
      */
    function getAdminWithInfo() external view returns (address[], uint[], bytes32[]) {
        address[] memory _admins = admins;
        uint adminCount = _admins.length;

        uint[] memory ids = new uint[](adminCount);
        bytes32[] memory names = new bytes32[](adminCount);

        for (uint i = 0; i < adminCount; i++) {
            address addr = _admins[i];
            Admin memory _adminInfo = adminInfo[addr];

            ids[i] = _adminInfo.id;
            names[i] = _adminInfo.name;
        }

        return (admins, ids, names);
    }
}