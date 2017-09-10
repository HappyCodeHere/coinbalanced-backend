pragma solidity ^0.4.10;

contract TreatyWithFixedPayment {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public minSum;
    uint public currentSum = 0;

    uint public performerAmount;
    uint public platformShare;

    uint public depositAmount;

    function TreatyWithFixedPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _performerAmount,
        uint _platformShare,
        uint _minSum,
        uint _depositAmount
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
        minSum = _minSum;
        performerAmount = _performerAmount;
        platformShare = _platformShare;
        depositAmount = _depositAmount;
    }

    function performPayments() {
    uint platformAmount = this.balance * platformShare / 100;
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
        if (this.balance >= minSum) {
            performPayments();
        }
    }

}
