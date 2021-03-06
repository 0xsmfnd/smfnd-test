/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import { Provider } from "@ethersproject/providers";
import type { IItemFactory, IItemFactoryInterface } from "../IItemFactory";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "claimer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardType",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "rewardRarity",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "rewardData",
        type: "bytes",
      },
    ],
    name: "LogDailyClaim",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    name: "RarityRolls",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    name: "SetReward",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "claim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    name: "setRarityRolls",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "rewardType",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "rewardRarity",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "rewardData",
        type: "bytes",
      },
    ],
    name: "setReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

export class IItemFactory__factory {
  static readonly abi = _abi;
  static createInterface(): IItemFactoryInterface {
    return new utils.Interface(_abi) as IItemFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IItemFactory {
    return new Contract(address, _abi, signerOrProvider) as IItemFactory;
  }
}
