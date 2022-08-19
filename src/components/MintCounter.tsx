import { useAtom, useAtomValue } from 'jotai'
import { configAtom, mintAmountAtom } from 'store'

type MintCounterProps = {
  className: string
}

const MintCounter = ({ className }: MintCounterProps) => {
  const CONFIG = useAtomValue(configAtom)
  const [mintAmount, setMintAmount] = useAtom(mintAmountAtom)

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1
    if (newMintAmount < 1) {
      newMintAmount = 1
    }
    setMintAmount(newMintAmount)
  }

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1
    if (newMintAmount > CONFIG.MAX_MINT_AMOUNT) {
      newMintAmount = CONFIG.MAX_MINT_AMOUNT
    }
    setMintAmount(newMintAmount)
  }

  return (
    <div className={`w-40 flex justify-between items-center ${className}`}>
      <button
        className='bg-primary hover:hover:opacity-60 font-bold w-10 h-10 rounded-full'
        onClick={decrementMintAmount}
      >
        -
      </button>
      <span>{mintAmount}</span>
      <button
        className='bg-primary hover:hover:opacity-60 font-bold w-10 h-10 rounded-full'
        onClick={incrementMintAmount}
      >
        +
      </button>
    </div>
  )
}

export default MintCounter
