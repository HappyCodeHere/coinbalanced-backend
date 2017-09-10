pragma solidity ^0.4.10;

contract TreatyWithDeposit {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public minSum;
    uint public maxSum;
    uint public currentSum = 0;

    uint public performerPercent;
    uint public platformPercent;
    uint public depositAmount;

    function TreatyWithDeposit(
        address _customer,
        address _performer,
        address _platform,
        uint _minSum,
        uint _maxSum,
        uint _depositAmount,
        uint _performerPercent,
        uint _platformPercent
    ) {
        performerPercent = _performerPercent;
        platformPercent = _platformPercent;

        customer = _customer;
        performer = _performer;
        platform = _platform;
        minSum = _minSum;
        maxSum = _maxSum;
        depositAmount = _depositAmount;
    }

    function () payable {
        if (this.balance < depositAmount){
            return;
        } else {
            buyers.push(msg.sender);
            if (this.balance >= minSum && this.balance <= maxSum) {
                uint amountToPerformer = this.balance * performerPercent / 100;
                uint amountToPlatform = this.balance * platformPercent / 100;
                uint amountToCustomer = this.balance - amountToPerformer - amountToPlatform;
                performer.transfer(amountToPerformer);
                platform.transfer(amountToPlatform);
                customer.transfer(amountToCustomer);
            }
        }
    }

}
