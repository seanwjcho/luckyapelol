/**
 *Submitted for verification at Etherscan.io on 2023-09-24
*/

pragma solidity ^0.8.9;


contract Roulette {
    address payable owner;
    address public apeCoinAddress;

    event Entered(address bidder, uint amount);

    struct Parameters {
        uint gameLength; //in minutes, updatable only by owner
        uint maxBet; //maximum single bet
        uint houseFee; //percentage of fee taken by owner
    }

    Parameters public parameters;

    bool public gameStarted;
    uint public endTime;

    uint public totalPot; 
    address payable winner;

    mapping (address => uint) public bids;
    address [] public bidders;

    uint private seed;

    constructor(uint _gameLength, uint _maxBet, address _apeCoinAddress) {
        owner = payable(msg.sender);
        parameters.gameLength = _gameLength;
        apeCoinAddress = _apeCoinAddress;
        parameters.maxBet = _maxBet;
        parameters.houseFee = 5; //5% fee
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    function updateGameLength(uint _gameLength) public onlyOwner {
        parameters.gameLength = _gameLength;
    }

    function updateMaxBet(uint _maxBet) public onlyOwner {
        parameters.maxBet = _maxBet;
    }

    function startGame() public onlyOwner {
        require (!gameStarted);
        gameStarted = true;
        endTime = block.timestamp + (parameters.gameLength) * 60;
    }

    function endGame() public { 
        require (gameStarted);
        require (block.timestamp > endTime);

        winner = chooseWinner();
        uint fee = (parameters.houseFee/100) * totalPot;
        uint savedPot = totalPot;
        reset(); //reset variables
        owner.transfer(fee);
        winner.transfer(savedPot - fee);
    }

    function reset() private {
        winner = payable(address(0));
        totalPot = 0;
        gameStarted = false;

        for (uint i = 0; i < bidders.length; i++) {
            bids[bidders[i]] = 0;
        }
        delete bidders;
    }

    function generateRandom(uint max) internal view returns (uint){
        uint randomHash = uint(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender, seed, bidders)));
        uint randomNumber = randomHash % (max + 1);
        return randomNumber;
    }

    function chooseWinner() internal view returns (address payable){
        uint random = generateRandom(totalPot);
        uint temp = 0;
        for (uint i = 0; i < bidders.length; i++) {
            temp += bids[bidders[i]];
            if (random <= temp) {
                return payable(bidders[i]);
            }
        }
    }

    function getPot() public view returns (uint totalPot) {
        return totalPot;
    }

    function getApes() public view returns (uint numApes) {
        return bidders.length;
    }

    function getTime() public view returns (uint timeLeft) { 
        return endTime - block.timestamp;
    }

    //can we AUTOMATICALLY calculate the winner RANDOMLY after the game is supposed to end?

    function submitBid() payable external returns (bool) {
        require (msg.value > 0);
        require (msg.value <= parameters.maxBet);
        //require (msg.sender != owner);
        require (block.timestamp <= endTime);
        require (gameStarted == true);
        require (bids[msg.sender] == 0);
        //require (msg.sender == apeCoinAddress);

        bidders.push(msg.sender);
        bids[msg.sender] = msg.value;
        emit Entered(msg.sender, msg.value);
    }
}