pragma solidity ^0.4.10;

contract TreatyWithAmountOfPayment {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public performerAmount;
    uint public platformShare;

    function TreatyWithAmountOfPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _performerAmount,
        uint _platformShare
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        performerAmount = _performerAmount;
        platformShare = _platformShare; 
    }

    function performPayments() {
      uint platformAmount = this.balance * platformShare / 100;
      uint amountToCustomer = this.balance - performerAmount - platformAmount;
      performer.transfer(performerAmount);
      platform.transfer(platformAmount);
      customer.transfer(amountToCustomer);
    }

    function () payable {
        buyers.push(msg.sender);
        performPayments();
    }

}
