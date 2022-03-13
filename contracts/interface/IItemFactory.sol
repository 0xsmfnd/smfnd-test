// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IItemFactory {
    function claim(address, uint) external;
    function setRarityRolls(uint16, uint16, uint16, uint16, uint16, uint16) external;
    function setReward(uint256 rewardType, uint256 rewardRarity, bytes calldata rewardData) external;

    event RarityRolls(uint16, uint16, uint16, uint16, uint16, uint16);
    event SetReward(uint, uint, bytes);
    event LogDailyClaim(address indexed claimer, uint256 rewardAmount, uint256 rewardType, uint256 rewardRarity, bytes rewardData);
}