pragma solidity 0.4.24;

import "./ProductAbstract.sol";


/**
 * @title Marketplace
 * @author Mahmut Bayri <mahmutbayri@gmail.com>
 */
contract Marketplace is ProductAbstract {
    /**
      * sender could be a super admin (owner), admin, store owner, regular store user / customer.
      * admins also could be store owner, regular user
      * store owner also could be a regular user
      * @return bool[] status it returns sender roles
      */
    function getSenderRole() external view returns (bool[]) {

        address _sender = msg.sender;
        address _blankAddress = address(0);
        bool[] memory _status = new bool[](4);

        _status[0] = _sender == owner;
        _status[1] = adminInfo[_sender].addr != _blankAddress;
        _status[2] = storeOwnerInfo[_sender].addr != _blankAddress;
        _status[3] = true;

        return _status;
    }

    /**
      * @return The contract balance
      */
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}
