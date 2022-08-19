type BuyButtonProps = {
  onClick: () => void
}

const BuyButton = ({ onClick }: BuyButtonProps) => {
  return (
    <div className={`flex justify-around items-center`}>
      <button
        className='bg-secondary hover:opacity-60 font-bold py-2 px-4 rounded-full'
        onClick={onClick}
      >
        Buy
      </button>
    </div>
  )
}

export default BuyButton
