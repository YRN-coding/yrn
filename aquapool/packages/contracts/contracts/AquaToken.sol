// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title AquaToken — Aquapool platform utility token
/// @notice ERC-20 with EIP-2612 permit (gasless approvals) and controlled minting
contract AquaToken is ERC20, ERC20Burnable, ERC20Permit, Ownable {
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18; // 1 billion tokens

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);

    mapping(address => bool) public minters;

    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "AquaToken: caller is not a minter");
        _;
    }

    constructor(address initialOwner)
        ERC20("AquaToken", "AQUA")
        ERC20Permit("AquaToken")
        Ownable(initialOwner)
    {
        // Mint 10% to deployer for liquidity bootstrapping
        _mint(initialOwner, 100_000_000 * 10 ** 18);
    }

    function mint(address to, uint256 amount) external onlyMinter {
        require(totalSupply() + amount <= MAX_SUPPLY, "AquaToken: max supply exceeded");
        _mint(to, amount);
    }

    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }

    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
}
