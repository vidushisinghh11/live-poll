import crypto from 'crypto'
import { supabase } from '../../lib/supabase' 


export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const hash = crypto.createHash('sha256').update(String(ip)).digest('hex')

  const { pollId, optionIndex } = req.body

  const { error } = await supabase.from('votes').insert({
    poll_id: pollId,
    option_index: optionIndex,
    ip_hash: hash
  })

  if (error) return res.status(400).json({ error: 'Already voted' })
  res.json({ success: true })
}
