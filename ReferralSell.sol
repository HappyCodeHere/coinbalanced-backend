pragma solidity ^0.4.2;

contract performerSell {

    uint constant public PERCENT_PRECISION = 100;
    address[] public _buyers;

    uint public _performerPercentX100Share = {{performerShare}};
    uint public _platformPercentX100Share = {{platformShare}};
    
    address constant public _performer = {{performer}};
    address constant public _customer = {{customer}};
    address constant public _platform = {{platform}};
    
    function itemSold(address performer) payable {
        _buyers.push(msg.sender);
        if (_performer != performer) {
            _customer.transfer(this.balance);
        }
        else {
            uint platformShareValue = this.balance / 100 * _platformPercentX100Share / PERCENT_PRECISION;
            uint performerShareValue = this.balance / 100 * _performerPercentX100Share / PERCENT_PRECISION;
            uint customerShareValue = this.balance - performerShareValue - platformShareValue;

            _platform.transfer(platformShareValue);
            _performer.transfer(performerShareValue);
            _customer.transfer(customerShareValue);
        }
    }
}
