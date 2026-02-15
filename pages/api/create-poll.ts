import { supabase } from '../../lib/supabase' 


export default async function handler(req, res) {
  const { question, options } = req.body

  const { data, error } = await supabase
    .from('polls')
    .insert({ question, options })
    .select()
    .single()

  if (error) return res.status(500).json(error)
  res.json(data)
}
