/**
 *Submitted for verification at Etherscan.io on 2023-09-24
*/

pragma solidity ^0.8.9;

interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract Roulette {
    address payable owner;
    address public apeCoinAddress;

    event Entered(address bidder, uint amount);

    IERC20 public immutable M20;


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
    address public lastWinner;
    uint public lastPayOut;


    mapping (address => uint) public bids;
    address [] public bidders;

    uint private seed;

    constructor(uint _gameLength, uint _maxBet) {
        owner = payable(msg.sender);
        parameters.gameLength = _gameLength;
        apeCoinAddress = 0x328507DC29C95c170B56a1b3A758eB7a9E73455c;
        parameters.maxBet = _maxBet;
        parameters.houseFee = 5; //5% fee
        M20 = IERC20(0x328507DC29C95c170B56a1b3A758eB7a9E73455c);
        lastWinner = address(0);
        lastPayOut = 0;
    }

    modifier onlyOwner() {
        require (msg.sender == owner);
        _;
    }

    

    function GetAllowance() private returns(uint256){
       return M20.allowance(msg.sender, address(this));
    }

    function AcceptPayment(uint256 _tokenamount) internal returns(bool) {
       require(_tokenamount <= GetAllowance(), "Please approve tokens before transferring");
       M20.transferFrom(msg.sender, address(this), _tokenamount);
       return true;
    }

    function updateGameLength(uint _gameLength) public {
        parameters.gameLength = _gameLength;
    }

    function updateMaxBet(uint _maxBet) public {
        parameters.maxBet = _maxBet;
    }

    function startGame() public {
        require (!gameStarted);
        gameStarted = true;
        endTime = block.timestamp + (parameters.gameLength) * 60;
    }


    function endGame() public returns (address _winner, uint256 _savedPot){
        require (gameStarted);
        // TODO: Uncomment the below for testing purposes
        // require (block.timestamp > endTime);

        winner = chooseWinner();
        uint fee = (parameters.houseFee * totalPot) / 100; // Calculate the fee amount
        uint savedPot = totalPot;

        M20.approve(address(this), totalPot); // Grant approval to the contract

        M20.transferFrom(address(this), owner, fee); // Transfer the fee to the owner
        M20.transfer(winner, savedPot - fee); // Transfer the remaining amount to the winner

        lastWinner = winner;
        lastPayOut = savedPot;

        reset(); // Reset variables
    }
    function reset() public {
        winner = payable(address(0));
        totalPot = 0;

        for (uint i = 0; i < bidders.length; i++) {
            bids[bidders[i]] = 0;
        }
        delete bidders;

        gameStarted = false;
        endTime = 0;
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

    function getBidderAtIndex(uint _index) public view returns (address) {
        require (_index < bidders.length);
        return bidders[_index];
    }

    function getBidFromBidder(address _bidder) public view returns (uint) {
        return bids[_bidder];
    }

    //can we AUTOMATICALLY calculate the winner RANDOMLY after the game is supposed to end?

    function submitBid(uint256 value) public {
        require (value > 0);
        require (value <= (parameters.maxBet * (10**18)));
        //require (msg.sender != owner);
        require (block.timestamp <= endTime);
        require (gameStarted == true);
        require (bids[msg.sender] == 0);


        AcceptPayment(value);

        bidders.push(msg.sender);
        bids[msg.sender] = value;
        totalPot += value;
    }

}