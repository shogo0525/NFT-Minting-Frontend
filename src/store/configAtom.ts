import { atom } from 'jotai'

type Config = {
  CONTRACT_ADDRESS: string
  SCAN_LINK: string
  NETWORK: {
    NAME: string
    SYMBOL: string
    ID: number
  }
  NFT_NAME: string
  SYMBOL: string
  MAX_MINT_AMOUNT: number
  MAX_SUPPLY: number
  WEI_COST: number
  GAS_LIMIT: number
  SITE_NAME: string
}

export const configAtom = atom<Config>({
  CONTRACT_ADDRESS: '0x181b7df2526dd89ee724145e7937bc5caa077df8',
  SCAN_LINK: 'https://rinkeby.etherscan.io',
  NETWORK: {
    NAME: 'Rinkeby',
    SYMBOL: 'ETH',
    ID: 4,
  },
  NFT_NAME: 'NFT Minting Frontend',
  SYMBOL: 'NMF',
  MAX_MINT_AMOUNT: 10,
  MAX_SUPPLY: 500,
  WEI_COST: 100000000000000,
  GAS_LIMIT: 285000,
  SITE_NAME: 'NFT Minting Frontend',
})
