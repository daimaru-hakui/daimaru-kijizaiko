import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'
import { verifySession } from './session'

export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await verifySession(req)
    if (!user) {
      return res.status(401).json('Unauthorized')
    }
    return handler(req, res)
  }
}
