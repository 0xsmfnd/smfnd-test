// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./common/ERC1155SupplyCC.sol";
import "./Milk.sol";
import "./interface/IItemFactory.sol";

contract ItemFactory is ERC1155SupplyCC, AccessControl, IItemFactory {

    /// @dev Track last time a claim was made for a specific pet
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    mapping(uint256 => uint256) public _lastUpdate;
    mapping(uint256 => mapping(uint256 => bytes)) _rewardMapping;

    address public milkContractAddress;

    /// @dev Rarity rolls
    uint16 public commonRoll = 60;
    uint16 public uncommonRoll = 80;
    uint16 public rareRoll = 90;
    uint16 public epicRoll = 98;
    uint16 public legendaryRoll = 100;
    uint16 public maxRarityRoll = 100;

    struct LootData {
        uint256 min;
        uint256 max;
        uint256[] ids;
    }
    enum ERarity {
        COMMON, UNCOMMON, RARE, EPIC, LEGENDARY
    }

    enum EType {
        MILK, BOX
    }

    /// @dev rewardType => (rewardRarity => data)
    mapping(uint256 => mapping(uint256 => bytes)) rewardMapping;

    constructor(string memory _uri, address _milkContractAddress) ERC1155(_uri) {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());
        milkContractAddress = _milkContractAddress;
    }



    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function claim(address claimer, uint256 entropy) external override {

        // generate a single random number and bit shift as needed
        uint256 randomNum = randomNumber(entropy) >> 8;

        // roll and pick the rarity level of the reward
        uint256 randRarity = randomNum % legendaryRoll;
        uint256 rewardRarity;
        bytes memory rewardData;
        uint256 rewardAmount;
        uint256 rewardType = uint256(EType.BOX);

        // pick rarity based on rarity chances
        if (randRarity < commonRoll) {
            rewardRarity = uint256(ERarity.COMMON);
        } else if (randRarity < uncommonRoll) {
            rewardRarity = uint256(ERarity.UNCOMMON);
        } else if (randRarity < rareRoll) {
            rewardRarity = uint256(ERarity.RARE);
        } else if (randRarity < epicRoll) {
            rewardRarity = uint256(ERarity.EPIC);
        } else {
            rewardRarity = uint256(ERarity.LEGENDARY);
        }

        // handle Legendary on its own
        // always a box
        if (rewardRarity == uint256(ERarity.LEGENDARY)) {
            // give the user a box
            _mint(claimer, 1, 1, "");
        }

        // handle MILK or ITEMS
        else {
            // This will pick a random number between 0 and 1 inc.
            // MILK or ITEMS.
            rewardType = randomNum % (uint256(EType.BOX) + 1);

            // convert the reward mapping data to min and max
            LootData memory lootData = getLootData(rewardType, rewardRarity);

            uint petTokenId = randomNum % (lootData.ids.length + 1);
            uint256 lastUpdateForID = _lastUpdate[petTokenId];
            if (lastUpdateForID == 0) lastUpdateForID = block.timestamp;

            uint multiplier;
            // time
            unchecked {
                multiplier = (block.timestamp - lastUpdateForID) / 86400;
            }
            require(multiplier > 0, "Can claim only once per day");
            // do some bit shifting magic to create random min max

            // Give a MILK reward
            if (rewardType == uint256(EType.MILK)) {
                rewardAmount = lootData.min * multiplier + ((randomNum % ((lootData.max - lootData.min + 1)) * multiplier));
                Milk milk = Milk(milkContractAddress);
                milk.gameMint(claimer, rewardAmount);
                rewardData = abi.encode(rewardAmount);
            }

            // Give an item reward
            else {
                _mint(claimer, lootData.ids[petTokenId], 1, "");
                rewardData = abi.encode(lootData.ids[petTokenId], 1);
                _lastUpdate[petTokenId] = block.timestamp;
            }
        }

        // Claims are specific to the that pet, not the claimer or a combination of claimer and pet

        emit LogDailyClaim(claimer, rewardAmount, rewardType, rewardRarity, rewardData);
    }

    /**
    * @notice random number calculation is hackable, ideally should use chainlink
    * Or should manage it on offchain once
    */
    function randomNumber(uint entropy) internal view returns (uint256) {
        return uint256(keccak256(abi.encode(block.timestamp, block.difficulty, entropy)));
    }

    function getLootData(uint rewardType, uint rarityType) internal view returns(LootData memory) {
        (uint min, uint max, uint[] memory ids) = abi.decode(
            _rewardMapping[rewardType][rarityType], (uint, uint, uint[])
        );

        LootData memory lootData;
        lootData.min = min;
        lootData.max = max;
        lootData.ids = ids;
        return lootData;
    }

    /** SETTERS */

    /// @notice returns the rarity level set for each rarity, and the maximum roll
    /// @param _common - rarity level of common quests
    /// @param _uncommon - rarity level of uncommon quests
    /// @param _rare - rarity level of rare quests
    /// @param _epic - rarity level of epic quests
    /// @param _legendary - rarity level of legendary quests
    /// @param _maxRoll - max rarity level
    function setRarityRolls(
        uint16 _common,
        uint16 _uncommon,
        uint16 _rare,
        uint16 _epic,
        uint16 _legendary,
        uint16 _maxRoll
    ) external override onlyRole(ADMIN_ROLE) {
        require(_common < _uncommon, "Common must be less rare than uncommon");
        require(_uncommon < _rare, "Uncommon must be less rare than rare");
        require(_rare < _epic, "Rare must be less rare than epic");
        require(_epic < _legendary, "Epic must be less rare than legendary");
        require(_legendary <= _maxRoll, "Legendary rarity level must be less than or equal to the max rarity roll");

        commonRoll = _common;
        uncommonRoll = _uncommon;
        rareRoll = _rare;
        epicRoll = _epic;
        legendaryRoll = _legendary;
        maxRarityRoll = _maxRoll;
        emit RarityRolls(commonRoll, uncommonRoll, rareRoll, epicRoll, legendaryRoll, maxRarityRoll);
    }

    function setReward(uint256 rewardType, uint256 rewardRarity, bytes calldata rewardData) external override onlyRole(ADMIN_ROLE) {
        require(rewardType <= uint256(EType.BOX), "Wrong reward type");
        _rewardMapping[rewardType][rewardRarity] = rewardData;
        emit SetReward(rewardType, rewardRarity, rewardData);
    }

    function burn(uint256 id, uint256 amount) external {
        _burn(msg.sender, id, amount);
    }
}
