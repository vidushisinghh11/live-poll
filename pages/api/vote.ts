import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'
import { supabase } from '../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pollId, optionIndex } = req.body

  if (typeof pollId !== 'string' || typeof optionIndex !== 'number') {
    return res.status(400).json({ error: 'Invalid vote data' })
  }

  const ip =
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'

  const ipHash = crypto
    .createHash('sha256')
    .update(ip)
    .digest('hex')

  const { error } = await supabase.from('votes').insert({
    poll_id: pollId,
    option_index: optionIndex,
    ip_hash: ipHash
  })

  if (error) {
    // Likely duplicate vote (unique constraint)
    return res.status(409).json({ error: 'Already voted' })
  }

  return res.status(200).json({ success: true })
}
