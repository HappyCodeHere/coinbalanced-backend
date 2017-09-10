pragma solidity ^0.4.10;

contract TreatyWithoutDeposit {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public minSum;
    uint public maxSum;
    uint public currentSum = 0;

    uint public performerPercent;
    uint public platformPercent;

    function TreatyWithoutDeposit(
        address _customer,
        address _performer,
        address _platform,
        uint _minSum,
        uint _maxSum,
        uint _performerPercent,
        uint _platformPercent
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        minSum = _minSum;
        maxSum = _maxSum;
        performerPercent = _performerPercent;
        platformPercent = _platformPercent;
    }

    function performPayments() {
    	uint amountToPerformer = this.balance * performerPercent / 100;
      uint amountToPlatform = this.balance * platformPercent / 100;
      uint amountToCustomer = this.balance - amountToPerformer - amountToPlatform;
      performer.transfer(amountToPerformer);
      platform.transfer(amountToPlatform);
      customer.transfer(amountToCustomer);
    }

    function () payable {
        buyers.push(msg.sender);
        if (this.balance >= minSum && this.balance <= maxSum) {
            performPayments();
        }
    }

}
