import {expect} from "chai";
import {ethers} from "hardhat";
import {
    ItemFactory,
    ItemFactory__factory, ItemFactoryMock, ItemFactoryMock__factory,
    Milk,
    Milk__factory
} from "../typechain-types";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {defaultAbiCoder} from "ethers/lib/utils";
import { time } from "@openzeppelin/test-helpers"

describe("ItemFactory", function () {
    let itemFactory: ItemFactoryMock,
        milk: Milk,
        owner: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress;
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners()

        const Milk: Milk__factory =  (await ethers.getContractFactory("Milk")) as Milk__factory
        milk = await Milk.connect(owner).deploy("milk", "MLK")
        const ItemFactory: ItemFactoryMock__factory = (await ethers.getContractFactory("ItemFactoryMock")) as ItemFactoryMock__factory
        itemFactory = await ItemFactory.connect(owner).deploy("", milk.address);

        await itemFactory.connect(owner).deployed();

        const masterRole = await milk.MASTER_ROLE();
        const contractRole = await milk.CONTRACT_ROLE();
        const depositorRole = await milk.DEPOSITOR_ROLE();
        await milk.connect(owner).grantRole(masterRole, itemFactory.address);
        await milk.connect(owner).grantRole(contractRole, itemFactory.address);
        await milk.connect(owner).grantRole(depositorRole, itemFactory.address);
    })

    describe("Rarity set check", function () {
        it("should revert wrong rarity format common > uncommon", async function () {
            const common = 10
            const uncommon = 5
            const rare = 15
            const epic = 20
            const legendary = 100
            const maxRoll = 100

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.be.revertedWith("Common must be less rare than uncommon")
        })

        it("should revert wrong rarity format uncommon > rare", async function () {
            const common = 10
            const uncommon = 15
            const rare = 15
            const epic = 20
            const legendary = 100
            const maxRoll = 100

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.be.revertedWith("Uncommon must be less rare than rare")
        })

        it("should revert wrong rarity format rare > epic", async function () {
            const common = 10
            const uncommon = 15
            const rare = 20
            const epic = 20
            const legendary = 100
            const maxRoll = 100

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.be.revertedWith("Rare must be less rare than epic")
        })

        it("should revert wrong rarity format epic > legendary", async function () {
            const common = 10
            const uncommon = 15
            const rare = 20
            const epic = 105
            const legendary = 100
            const maxRoll = 100

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.be.revertedWith("Epic must be less rare than legendary")
        })

        it("should revert wrong rarity format legendary > maxRoll", async function () {
            const common = 10
            const uncommon = 15
            const rare = 18
            const epic = 20
            const legendary = 100
            const maxRoll = 80

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.be.revertedWith("Legendary rarity level must be less than or equal to the max rarity roll")
        })

        it("should set Rarity rolls", async function () {
            const common = 10
            const uncommon = 15
            const rare = 18
            const epic = 20
            const legendary = 90
            const maxRoll = 100

            await expect(itemFactory.setRarityRolls(common, uncommon, rare, epic, legendary, maxRoll)).to.emit(itemFactory, "RarityRolls").withArgs(common, uncommon, rare, epic, legendary, maxRoll)
        })
    })

    it("should set reward", async function () {
        const calldata = defaultAbiCoder.encode(['uint', 'uint', 'uint[]'], [0, 100, [0,1]])

        await expect(itemFactory.setReward(0, 3, calldata)).to.emit(itemFactory, "SetReward")
    })

    it("should set reward revert", async function () {
        const calldata = defaultAbiCoder.encode(['uint', 'uint', 'uint[]'], [0, 100, [0,1]])

        await expect(itemFactory.setReward(10, 100, calldata)).to.be.revertedWith("Wrong reward type")
    })

    it("should claim random milk amount", async function() {
        const calldata = defaultAbiCoder.encode(['uint', 'uint', 'uint[]'], [0, 100, [0,1]])
        await itemFactory.setReward(0, 0, calldata)
        await itemFactory.setReward(0, 1, calldata)
        await itemFactory.setReward(0, 2, calldata)
        await itemFactory.setReward(0, 3, calldata)
        await itemFactory.setReward(0, 4, calldata)
        await itemFactory.setReward(1, 0, calldata)
        await itemFactory.setReward(1, 1, calldata)
        await itemFactory.setReward(1, 2, calldata)
        await itemFactory.setReward(1, 3, calldata)
        await itemFactory.setReward(1, 4, calldata)
        await itemFactory.connect(owner).claim(user1.address, 999, 0, 0, 100)
        expect(await milk.balanceOf(user1.address)).to.be.eq(100)
    })

    it("should claim once per day", async function() {
        await time.increase(3000);
        await expect(itemFactory.connect(owner).claim(user1.address, 999, 0, 0, 100)).to.revertedWith("Can claim only once per day")
    })

    it("should claim once per day", async function() {
        await time.increase(86400);
        await itemFactory.connect(owner).claim(user1.address, 999, 0, 0, 100)
        expect(await milk.balanceOf(user1.address)).to.be.eq(200)
    })

    it("should claim for legendary", async function() {
        await time.increase(86400);
        await itemFactory.connect(owner).claim(user1.address, 999, 4, 0, 100)
        expect(await itemFactory.balanceOf(user1.address, 1)).to.be.eq(1)
    })

    it("should claim nft by id", async function() {
        await time.increase(86400);
        await itemFactory.connect(owner).claim(user1.address, 999, 2, 1, 100)
        expect(await itemFactory.balanceOf(user1.address, 0)).to.be.eq(1)
    })

    it("should check total supply", async function () {
        expect(await itemFactory.totalSupply(0)).to.be.eq(1);
    })

    it("should check burn event", async function () {
        await itemFactory.connect(user1).burn(0, 1);
        expect(await itemFactory.totalSupply(0)).to.be.eq(0);
    })

    it("should check if nft exist", async function () {
        expect(await itemFactory.connect(user1).exists(0)).to.be.false;
    })
})