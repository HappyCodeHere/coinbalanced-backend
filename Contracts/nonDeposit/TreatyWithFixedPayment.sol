pragma solidity ^0.4.10;

contract TreatyWithFixedPayment {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public minSum;
    uint public maxSum;
    uint public currentSum = 0;

    uint public performerAmount;
    uint public platformAmount;

    function TreatyWithFixedPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _minSum,
        uint _maxSum,
        uint _performerAmount,
        uint _platformAmount
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        minSum = _minSum;
        maxSum = _maxSum;        
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
        buyers.push(msg.sender);
        if (this.balance >= minSum && this.balance <= maxSum) {
            performPayments();
        }
    }

}
