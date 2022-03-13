// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMilk {
    function deposit(address user, bytes calldata depositData) external;
    function gameWithdraw(address owner, uint256 amount) external;
    function gameTransferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external;
    function gameBurn(address owner, uint256 amount) external;

    event GameWithdraw(address owner, uint amount);
    event GameTransferFrom(address sender, address recipient, uint amount);
    event GameBurn(address owner, uint amount);
    event GameMint(address to, uint amount);
}