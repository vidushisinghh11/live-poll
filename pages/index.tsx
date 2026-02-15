import { useState } from 'react'

export default function Home() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', ''])

  async function createPoll() {
    const res = await fetch('/api/create-poll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, options })
    })
    const poll = await res.json()
    window.location.href = `/poll/${poll.id}`
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>✨ Create a Poll</h1>

        <label style={styles.label}>What’s your question?</label>
        <input
          style={styles.input}
          placeholder="e.g. What's your favorite programming language?"
          value={question}
          onChange={e => setQuestion(e.target.value)}
        />

        <label style={styles.label}>Add your options</label>
        {options.map((o, i) => (
          <input
            key={i}
            style={styles.input}
            placeholder={`Option ${i + 1}`}
            value={o}
            onChange={e => {
              const copy = [...options]
              copy[i] = e.target.value
              setOptions(copy)
            }}
          />
        ))}

        <button
          style={styles.linkBtn}
          onClick={() => setOptions([...options, ''])}
        >
          + Add another option
        </button>

        <button style={styles.primaryBtn} onClick={createPoll}>
          Create Poll
        </button>

        <p style={styles.helper}>
          Once created, you’ll get a shareable link for your poll
        </p>
      </div>
    </div>
  )
}

const styles: any = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at top, #0f172a, #020617)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    width: 460,
    padding: 32,
    borderRadius: 20,
    background: 'rgba(15, 23, 42, 0.85)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 30px 80px rgba(0,0,0,.5)',
    color: '#fff'
  },
  heading: {
    fontSize: 32,
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 16,
    display: 'block'
  },
  input: {
    width: '100%',
    padding: 14,
    marginTop: 8,
    borderRadius: 12,
    background: '#1e293b',
    border: '1px solid #334155',
    color: '#fff',
    fontSize: 15
  },
  linkBtn: {
    marginTop: 12,
    background: 'none',
    border: 'none',
    color: '#93c5fd',
    cursor: 'pointer',
    fontSize: 14
  },
  primaryBtn: {
    width: '100%',
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    border: 'none',
    fontSize: 16,
    fontWeight: 600,
    background: '#fff',
    color: '#020617',
    cursor: 'pointer'
  },
  helper: {
    marginTop: 14,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.5
  }
}
