pragma solidity ^0.4.2;

contract ReferralSell {

    uint constant public PERCENT_PRECISION = 100;
    address[] public _buyers;

    uint public _referralPercentX100Share = {{referralShare}};
    uint public _platformPercentX100Share = {{platformShare}};
    
    address constant public _referral = {{referral}};
    address constant public _seller = {{seller}};
    address constant public _platform = {{platform}};
    
    function itemSold(address referral) payable {
        _buyers.push(msg.sender);
        if (_referral != referral) {
            _seller.transfer(this.balance);
        }
        else {
            uint platformShareValue = this.balance / 100 * _platformPercentX100Share / PERCENT_PRECISION;
            uint referralShareValue = this.balance / 100 * _referralPercentX100Share / PERCENT_PRECISION;
            uint sellerShareValue = this.balance - referralShareValue - platformShareValue;

            _platform.transfer(platformShareValue);
            _referral.transfer(referralShareValue);
            _seller.transfer(sellerShareValue);
        }
    }
}
