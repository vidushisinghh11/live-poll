import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../lib/supabase'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { question, options } = req.body

  if (!question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' })
  }

  const { data, error } = await supabase
    .from('polls')
    .insert({ question, options })
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ id: data.id })
}
