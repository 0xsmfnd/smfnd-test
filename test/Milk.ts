import {expect} from "chai";
import {ethers} from "hardhat";
import {Milk, Milk__factory} from "../typechain-types";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {defaultAbiCoder} from "ethers/lib/utils";

describe("Milk", function () {
    let milk: Milk,
        owner: SignerWithAddress,
        user1: SignerWithAddress,
        user2: SignerWithAddress;
    before(async function () {
        [owner, user1, user2] = await ethers.getSigners()

        const Milk: Milk__factory = (await ethers.getContractFactory("Milk")) as Milk__factory
        milk = await Milk.deploy("milk", "MLK");
        await milk.connect(owner).deployed();
    })

    it("should revert on deposit with wrong calldata", async function () {
        const fakeCalldata = defaultAbiCoder.encode(['uint'], ['0'])
        await expect(milk.deposit(owner.address, fakeCalldata)).to.be.revertedWith("Milk: deposit failed")
    })

    it("should revert with non-depositor access", async function () {
        const calldata = defaultAbiCoder.encode(['uint'], ['1'])
        await expect(milk.connect(user1).deposit(user1.address, calldata)).to.be.reverted
        await expect(milk.connect(owner).deposit(user1.address, calldata)).to.emit(milk, "Transfer")
        expect(await milk.balanceOf(user1.address)).to.be.eq(1)
    })

    it('should unable to withdraw with wrong amount', async function () {
        await expect(milk.connect(owner).withdraw(100)).to.be.revertedWith("ERC20: burn amount exceeds balance")
    });

    it("should withdraw works", async function () {
        await expect(milk.connect(user1).withdraw(1)).to.emit(milk, "Transfer").withArgs(user1.address, ethers.constants.AddressZero, 1)
    })

    it("should gameWithdraw works", async function () {
        const calldata = defaultAbiCoder.encode(['uint'], ['100'])
        await milk.deposit(user1.address, calldata)
        await expect(milk.gameWithdraw(user1.address, 10)).to.emit(milk, "GameWithdraw").withArgs(user1.address, 10)
    })

    it("should gameTransferFrom works", async function () {
        await expect(milk.gameTransferFrom(user1.address, user2.address, 10)).to.emit(milk, "GameTransferFrom").withArgs(user1.address, user2.address, 10)
    })

    it("should gameBurn works", async function () {
        await expect(milk.gameBurn(user1.address, 10)).to.emit(milk, "GameBurn").withArgs(user1.address, 10)
    })

    it("should gameMint works", async function () {
        await expect(milk.gameMint(user1.address, 10)).to.emit(milk, "GameMint").withArgs(user1.address, 10)
    })

    it("should masterMint works", async function () {
        await expect(milk.connect(owner).mint(user1.address, 10)).to.emit(milk, "Transfer")
    })
})