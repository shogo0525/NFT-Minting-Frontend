import { ethers } from 'ethers'
import type { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { account, signature, nonce } = req.body

    const signerAddress = ethers.utils.verifyMessage(nonce, signature)

    if (account.toLowerCase() !== signerAddress.toLowerCase()) {
      res.status(400).json({ message: 'Wrong signature.' })
    }

    res.status(200).json({ message: 'ok' })
  }
}

export default handler
