pragma solidity ^0.4.2;

contract ReferralSell {

    uint constant public PERCENT_PRECISION = 100;
    address[] public _buyers;
    uint public _referralPercentShare= {{share}};
    address constant public _referral = {{referral}};
    address constant public _seller = {{seller}};
    
    function itemSold(address referral) payable {
        _buyers.push(msg.sender);
        // uint referralShare = _referralPercentShare;
        if (_referral != referral) {
            // referralShare = 0;
            _seller.transfer(this.balance);
        }
        else {
            //revert order of math ops, to increase preceseness?
            uint referralShareValue = this.balance / PERCENT_PRECISION * _referralPercentShare;
            uint sellerShare = this.balance - referralShareValue;
            _referral.transfer(referralShareValue);
            _seller.transfer(sellerShare);
        }

    }
}