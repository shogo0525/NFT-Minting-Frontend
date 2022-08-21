import { ethers } from 'ethers'
import { useAtom, useAtomValue } from 'jotai'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import BuyButton from 'components/BuyButton'
import MintCounter from 'components/MintCounter'
import abi from 'contracts/abi.json'

import {
  configAtom,
  blockchainAtom,
  contractDataAtom,
  mintAmountAtom,
  receiptAtom,
} from 'store'

const truncate = (input: string, len: number) =>
  input.length > len ? `${input.substring(0, len)}...` : input

const Home: NextPage = () => {
  const CONFIG = useAtomValue(configAtom)
  const mintAmount = useAtomValue(mintAmountAtom)

  const [blockchain, setBlockchain] = useAtom(blockchainAtom)
  const [contractData, setContractData] = useAtom(contractDataAtom)
  const [receipt, setReceipt] = useAtom(receiptAtom)

  const [minting, setMinting] = useState<boolean>(false)

  const connect = async () => {
    const { ethereum } = window
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask

    if (!metamaskIsInstalled) {
      alert('Install Metamask.')
      return
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const networkId = await ethereum.request({ method: 'net_version' })

      if (networkId != CONFIG.NETWORK.ID) {
        alert(`Change network to ${CONFIG.NETWORK.NAME}.`)
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, abi, signer)

      setBlockchain(() => ({
        account: accounts[0],
        contract,
      }))
    } catch (e) {
      console.log('e', e)
    }
  }

  const mint = async () => {
    setReceipt(null)
    if (!blockchain) return

    setMinting(true)

    const totalCostWei = String(CONFIG.WEI_COST * mintAmount)
    const gasLimit = String(CONFIG.GAS_LIMIT * mintAmount)

    try {
      const tx = await blockchain.contract.mint(mintAmount, {
        value: totalCostWei,
        gasLimit,
      })
      const receipt = await tx.wait()
      setReceipt(receipt)
    } catch (e) {
      console.log('Minting error', e)
    } finally {
      setMinting(false)
    }
  }

  const signAndVerifySample = async () => {
    const { ethereum } = window
    const metamaskIsInstalled = ethereum && ethereum.isMetaMask

    if (!metamaskIsInstalled) {
      alert('Install Metamask.')
      return
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      const networkId = await ethereum.request({ method: 'net_version' })

      if (networkId != CONFIG.NETWORK.ID) {
        alert(`Change network to ${CONFIG.NETWORK.NAME}.`)
        return
      }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()

      // NOTE: You could create an API for getting `nonce` but here we just create it on frontend.
      const nonce = uuidv4()
      const signature = await signer.signMessage(nonce)

      const response = await fetch('/api/sample', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: accounts[0],
          nonce,
          signature,
        }),
      })

      console.log('response', await response.json())
    } catch (e) {
      console.log('e', e)
    }
  }

  const getData = useCallback(async () => {
    if (!blockchain) return
    const totalSupply = (await blockchain.contract.totalSupply()).toNumber()
    setContractData({
      totalSupply,
    })
  }, [blockchain, setContractData])

  useEffect(() => {
    getData()
  }, [getData, blockchain])

  const handleAccountsChanged = (accounts: string[]) => {
    console.log('handleAccountsChanged', accounts)
    if (accounts.length === 0) {
      alert('Please connect to MetaMask.')
    } else {
      setBlockchain((oldBlockchain) => {
        if (!oldBlockchain) return null
        return {
          ...oldBlockchain,
          account: accounts[0],
        }
      })
    }
  }

  const handleChainChanged = (chainId: string) => {
    if (parseInt(chainId, 16) != CONFIG.NETWORK.ID) {
      window.location.reload()
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  })
  return (
    <>
      <Head>
        <title>{CONFIG.SITE_NAME}</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='h-full p-3 bg-primary text-center flex flex-col  items-center md:justify-center'>
        <h1 className='text-3xl md:text-6xl text-accent'>{CONFIG.SITE_NAME}</h1>
        <div className='w-full mt-5 md:mt-10 flex flex-col justify-between items-center md:flex-row'>
          <div className='hidden md:block md:w-3/12'>
            <div className='w-32 h-32 md:w-44 md:h-44 relative mx-auto rounded-full border-secondary border-2 border-dashed'>
              <Image
                className='rounded-full'
                alt='example'
                src='/images/example.gif'
                layout='fill'
              />
            </div>
          </div>

          <div className='w-3/4 h-[450px] md:h-[500px] md:w-6/12 px-6 py-20 flex flex-col justify-center items-center rounded-xl bg-accent border-secondary border-8 border-dashed'>
            <p className='text-5xl font-bold'>
              {contractData?.totalSupply ?? 0} / {CONFIG.MAX_SUPPLY}
            </p>

            <Link
              href={`${CONFIG.SCAN_LINK}/address/${CONFIG.CONTRACT_ADDRESS}`}
            >
              <a
                className='block mt-5 font-extrabold text-secondary'
                target='_blank'
              >
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </a>
            </Link>

            <p className='mt-5 text-lg'>
              1 {CONFIG.SYMBOL} costs{' '}
              {ethers.utils.formatEther(String(CONFIG.WEI_COST))}{' '}
              {CONFIG.NETWORK.SYMBOL}
            </p>
            <p>Excluding gas fees.</p>

            {!blockchain && (
              <>
                <p className='mt-10'>
                  Connect to the {CONFIG.NETWORK.NAME} network
                </p>
                <button
                  className='mt-10 bg-secondary hover:opacity-60 font-bold py-2 px-4 rounded-full'
                  onClick={connect}
                >
                  Connect
                </button>
              </>
            )}

            {blockchain && (
              <div className='mt-5'>
                <p>Click buy to mint your NFT.</p>
                <MintCounter className='mt-5 mx-auto' />
                <div className='mt-5'>
                  {!minting && <BuyButton onClick={mint} />}
                  {minting && (
                    <div className='flex flex-col justify-center items-center'>
                      <div className='animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent'></div>
                      Minting...
                    </div>
                  )}
                </div>
              </div>
            )}

            {receipt && (
              <Link href={`${CONFIG.SCAN_LINK}/tx/${receipt.transactionHash}`}>
                <a
                  className='block mt-5 text-red-300 text-lg font-bold'
                  target='_blank'
                >
                  View transaction on etherscan
                </a>
              </Link>
            )}
          </div>

          <div className='md:w-3/12'>
            <div className='w-32 h-32 md:w-44 md:h-44 mt-5 md:mt-0 relative mx-auto rounded-full border-secondary border-2 border-dashed -scale-x-100'>
              <Image
                className='rounded-full'
                alt='example'
                src='/images/example.gif'
                layout='fill'
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
