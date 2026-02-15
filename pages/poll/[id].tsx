import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function Poll() {
  const router = useRouter()
  const { id } = router.query

  const pollId = typeof id === 'string' ? id : null

  const [poll, setPoll] = useState<any>(null)
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    if (!pollId) return

    setVoted(!!localStorage.getItem(`voted_${pollId}`))

    fetch(`/api/poll/${pollId}`)
      .then(res => res.json())
      .then(setPoll)

    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        { event: '*', table: 'votes', filter: `poll_id=eq.${pollId}` },
        () => {
          fetch(`/api/poll/${pollId}`)
            .then(res => res.json())
            .then(setPoll)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [pollId])

  async function vote(index: number) {
    if (!pollId || voted) return

    // Optimistic UI update
    setPoll((prev: any) => ({
      ...prev,
      counts: prev.counts.map((c: number, i: number) =>
        i === index ? c + 1 : c
      )
    }))

    setVoted(true)
    localStorage.setItem(`voted_${pollId}`, 'true')

    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pollId,
        optionIndex: index
      })
    })
  }

  if (!poll) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>Loading…</p>
  }

  const total = poll.counts.reduce((a: number, b: number) => a + b, 0)

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>{poll.question}</h1>
        <p style={styles.sub}>
          {total} vote{total !== 1 && 's'}
        </p>

        {poll.options.map((option: string, i: number) => {
          const pct = total
            ? Math.round((poll.counts[i] / total) * 100)
            : 0

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={voted}
              style={styles.option}
            >
              <div style={{ ...styles.fill, width: `${pct}%` }} />
              <span>{option}</span>
              <span style={styles.percent}>{pct}%</span>
            </button>
          )
        })}

        <div style={styles.actions}>
          <button
            style={styles.secondary}
            onClick={() => router.push('/')}
          >
            🏠 Create another poll
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #0f172a, #020617)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  card: {
    width: 500,
    padding: 32,
    borderRadius: 20,
    background: 'rgba(15,23,42,.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 30px 80px rgba(0,0,0,.5)',
    color: '#fff'
  },
  heading: { fontSize: 28 },
  sub: { opacity: 0.6, marginBottom: 20 },
  option: {
    position: 'relative',
    width: '100%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    border: '1px solid #334155',
    background: '#020617',
    color: '#fff',
    overflow: 'hidden',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between'
  },
  fill: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg,#2563eb,#60a5fa)',
    opacity: 0.25,
    transition: 'width 0.4s ease'
  },
  percent: { fontWeight: 600 },
  actions: { marginTop: 24 },
  secondary: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    background: '#fff',
    color: '#020617',
    border: 'none',
    cursor: 'pointer'
  }
}
