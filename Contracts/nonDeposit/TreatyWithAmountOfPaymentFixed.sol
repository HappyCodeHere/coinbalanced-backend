pragma solidity ^0.4.10;

contract TreatyWithAmountOfPayment {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public amountOfPayments;
    uint public currentAmountOfPayments = 0;

    uint public performerAmount;
    uint public platformAmount;

    function TreatyWithAmountOfPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _amountOfPayments,
        uint _performerAmount,
        uint _platformAmount 
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        amountOfPayments = _amountOfPayments;
        performerAmount = _performerAmount;
        platformAmount = _platformAmount; 
    }

    function performPayments() {
      uint amountToCustomer = this.balance - performerAmount - platformAmount;
      performer.transfer(performerAmount);
      platform.transfer(platformAmount);
      customer.transfer(amountToCustomer);
    }

    function () payable {
        currentAmountOfPayments++;
        buyers.push(msg.sender);
        if (currentAmountOfPayments >= amountOfPayments) {
            performPayments();
            currentAmountOfPayments = 0;
        }
    }

}
