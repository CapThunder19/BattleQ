// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BTQ Token
 * @dev BattleQ in-game currency token.
 * Users can buy BTQ by sending native currency (ETH/RHT/testnet chain token).
 * Rate: 0.001 native token = 1 BTQ
 */
contract BTQToken is ERC20, ERC20Burnable, Ownable {
    /// @dev Rate: how many native tokens = 1 BTQ token (in wei)
    /// Default: 0.001 ETH = 1 BTQ, so rate = 10^15 wei (0.001 * 10^18)
    uint256 public rate = 1e15; // 0.001 ETH in wei

    event RateUpdated(uint256 newRate);
    event TokensPurchased(address indexed buyer, uint256 nativeAmount, uint256 tokenAmount);

    // OpenZeppelin v5 Ownable requires an initial owner in the base constructor
    constructor() ERC20("BattleQ", "BTQ") Ownable(msg.sender) {}

    /**
     * @dev Allow users to buy BTQ tokens by sending native currency.
     * For every `rate` wei of native currency, they receive 1 BTQ token.
     */
    function buy() external payable {
        require(msg.value > 0, "Must send native currency");

        // Calculate BTQ amount: if rate = 1e15 (0.001 ETH), then 1 ETH = 1000 BTQ
        uint256 btqAmount = (msg.value * 1e18) / rate;
        require(btqAmount > 0, "Insufficient funds to buy at least 1 BTQ");

        // Mint BTQ to buyer
        _mint(msg.sender, btqAmount);

        emit TokensPurchased(msg.sender, msg.value, btqAmount);
    }

    /**
     * @dev Update the exchange rate (only owner).
     * @param _newRate: native wei per 1 BTQ token (with 18 decimals)
     */
    function setRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Rate must be > 0");
        rate = _newRate;
        emit RateUpdated(_newRate);
    }

    /**
     * @dev Withdraw accumulated native currency (only owner).
     */
    function withdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Allow receiving native currency.
     */
    receive() external payable {}
}
