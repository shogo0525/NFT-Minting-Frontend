export * from './configAtom'

import { ethers } from 'ethers'
import { atom } from 'jotai'

type BlockchainInfo = {
  account: string
  contract: ethers.Contract
}

export const blockchainAtom = atom<BlockchainInfo | null>(null)

type ContractData = {
  totalSupply: number
}

export const contractDataAtom = atom<ContractData | null>(null)

export const mintAmountAtom = atom(1)

export const receiptAtom = atom<ethers.ContractReceipt | null>(null)
