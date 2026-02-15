import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

export default function Poll() {
  const router = useRouter()
  const id = router.query.id as string
  const [poll, setPoll] = useState<any>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const voted =
    typeof window !== 'undefined' &&
    localStorage.getItem(`voted_${id}`)

  useEffect(() => {
    if (!id) return

    fetch(`/api/poll/${id}`)
      .then(r => r.json())
      .then(setPoll)

    const channel = supabase
      .channel('votes')
      .on(
        'postgres_changes',
        { event: '*', table: 'votes', filter: `poll_id=eq.${id}` },
        () =>
          fetch(`/api/poll/${id}`)
            .then(r => r.json())
            .then(setPoll)
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [id])

  async function vote(i: number) {
    if (voted) return

    setSelectedIndex(i)

    // optimistic UI update
    setPoll((prev: any) => ({
      ...prev,
      counts: prev.counts.map((c: number, idx: number) =>
        idx === i ? c + 1 : c
      )
    }))

    localStorage.setItem(`voted_${id}`, 'true')

    await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: id, optionIndex: i })
    })
  }

  if (!poll || !poll.options || !poll.counts) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>Loading…</p>
  }

  const total = poll.counts.reduce((a: number, b: number) => a + b, 0)

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>{poll.question}</h1>
        <p style={styles.sub}>{total} vote{total !== 1 && 's'}</p>

        {/* ✅ THANK YOU BANNER */}
        {voted && (
          <div style={styles.thankYou}>
            <div style={styles.check}>✓</div>
            <div>
              <div style={styles.thankTitle}>Thanks for voting!</div>
              <div style={styles.thankSub}>
                Here are the current results:
              </div>
            </div>
          </div>
        )}

        {poll.options.map((o: string, i: number) => {
          const pct = total ? Math.round((poll.counts[i] / total) * 100) : 0
          const isSelected = i === selectedIndex

          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={!!voted}
              style={{
                ...styles.option,
                transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                boxShadow: isSelected
                  ? '0 0 0 2px #60a5fa, 0 15px 40px rgba(96,165,250,0.45)'
                  : 'none'
              }}
            >
              <div
                style={{
                  ...styles.fill,
                  width: `${pct}%`,
                  transition: 'width 0.6s ease'
                }}
              />
              <span>{o}</span>
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
    width: 520,
    padding: 32,
    borderRadius: 20,
    background: 'rgba(15,23,42,.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 30px 80px rgba(0,0,0,.5)',
    color: '#fff'
  },
  heading: {
    fontSize: 28
  },
  sub: {
    opacity: 0.6,
    marginBottom: 20
  },

  /* THANK YOU BANNER */
  thankYou: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    background: '#1e293b',
    border: '1px solid #334155',
    marginBottom: 20
  },
  check: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    fontWeight: 'bold'
  },
  thankTitle: {
    fontWeight: 600
  },
  thankSub: {
    fontSize: 14,
    opacity: 0.7
  },

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
    justifyContent: 'space-between',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  fill: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg,#2563eb,#60a5fa)',
    opacity: 0.25
  },
  percent: {
    fontWeight: 600
  },
  actions: {
    display: 'flex',
    marginTop: 24
  },
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
