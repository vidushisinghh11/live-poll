import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '../../../lib/supabase'
import type { NextApiRequest, NextApiResponse } from 'next'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { id } = req.query

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid poll id' })
  }

  // 1. Get poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', id)
    .single()

  if (pollError || !poll) {
    return res.status(404).json({ error: 'Poll not found' })
  }

  // 2. Get votes
  const { data: votes, error: voteError } = await supabase
    .from('votes')
    .select('option_index')
    .eq('poll_id', id)

  if (voteError || !votes) {
    return res.status(500).json({ error: 'Failed to load votes' })
  }

  // 3. Build counts safely
  const counts = poll.options.map((_: string, i: number) =>
    votes.filter(v => v.option_index === i).length
  )

  // 4. Return EXACT shape frontend expects
  return res.status(200).json({
    id: poll.id,
    question: poll.question,
    options: poll.options,
    counts
  })
}
