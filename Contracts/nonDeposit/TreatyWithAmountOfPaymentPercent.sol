pragma solidity ^0.4.10;

contract TreatyWithAmountOfPayment {
    
    address public performer;
    address public customer;
    address public platform;
    address[] public buyers;

    uint public performerPercent;
    uint public platformPercent;

    function TreatyWithAmountOfPayment(
        address _customer,
        address _performer,
        address _platform,
        uint _performerPercent,
        uint _platformPercent 
    ) {
        customer = _customer;
        performer = _performer;
        platform = _platform;
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
        performPayments();
    }

}
