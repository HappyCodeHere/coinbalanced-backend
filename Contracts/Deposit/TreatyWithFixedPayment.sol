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

    uint public depositAmount;

    function TreatyWithFixedPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _minSum,
        uint _maxSum,
        uint _performerAmount,
        uint _platformAmount,
        uint _depositAmount
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        minSum = _minSum;
        maxSum = _maxSum;
        performerAmount = _performerAmount;
        platformAmount = _platformAmount;
        depositAmount = _depositAmount;
    }

    function performPayments() {
      uint amountToCustomer = this.balance - performerAmount - platformAmount;
      performer.transfer(performerAmount);
      platform.transfer(platformAmount);
      customer.transfer(amountToCustomer);
    }

    function () payable {
        if (this.balance < depositAmount) {
            return;
        }
        buyers.push(msg.sender);
        if (this.balance >= minSum && this.balance <= maxSum) {
            performPayments();
        }
    }

}
