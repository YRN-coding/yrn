// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AquaSwapRouter — Route swaps to external DEX aggregators
/// @notice Lightweight router that validates and forwards swap calls with protocol fee
contract AquaSwapRouter is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    uint256 public feeBps = 10; // 0.1% protocol fee
    address public feeRecipient;

    mapping(address => bool) public approvedAggregators;

    event SwapExecuted(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 fee
    );
    event AggregatorUpdated(address aggregator, bool approved);
    event FeeBpsUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address initialOwner, address _feeRecipient) Ownable(initialOwner) {
        feeRecipient = _feeRecipient;
    }

    function setAggregator(address aggregator, bool approved) external onlyOwner {
        approvedAggregators[aggregator] = approved;
        emit AggregatorUpdated(aggregator, approved);
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 100, "AquaSwapRouter: fee too high"); // max 1%
        feeBps = _feeBps;
        emit FeeBpsUpdated(_feeBps);
    }

    function setFeeRecipient(address _feeRecipient) external onlyOwner {
        require(_feeRecipient != address(0), "AquaSwapRouter: zero address");
        feeRecipient = _feeRecipient;
        emit FeeRecipientUpdated(_feeRecipient);
    }

    function swap(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 minAmountOut,
        address aggregator,
        bytes calldata swapData
    ) external nonReentrant returns (uint256 amountOut) {
        require(approvedAggregators[aggregator], "AquaSwapRouter: aggregator not approved");
        require(amountIn > 0, "AquaSwapRouter: amountIn must be > 0");

        uint256 fee = (amountIn * feeBps) / 10_000;
        uint256 amountInAfterFee = amountIn - fee;

        IERC20(fromToken).safeTransferFrom(msg.sender, address(this), amountIn);
        if (fee > 0) {
            IERC20(fromToken).safeTransfer(feeRecipient, fee);
        }

        IERC20(fromToken).safeIncreaseAllowance(aggregator, amountInAfterFee);

        uint256 balanceBefore = IERC20(toToken).balanceOf(address(this));

        (bool success, ) = aggregator.call(swapData);
        require(success, "AquaSwapRouter: swap failed");

        amountOut = IERC20(toToken).balanceOf(address(this)) - balanceBefore;
        require(amountOut >= minAmountOut, "AquaSwapRouter: slippage too high");

        IERC20(toToken).safeTransfer(msg.sender, amountOut);

        emit SwapExecuted(msg.sender, fromToken, toToken, amountIn, amountOut, fee);
    }
}
