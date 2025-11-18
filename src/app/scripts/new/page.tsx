'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewScriptPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    communityId: 'default',
    key: '',
    title: '',
    ritualType: 'new_moon' as const,
    descriptionMarkdown: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create script')
      }

      const script = await response.json()
      router.push(`/scripts/${script.key}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create script')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create New Script</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Community ID
            </label>
            <input
              type="text"
              className="input"
              value={formData.communityId}
              onChange={e => setFormData({ ...formData, communityId: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Key (unique identifier)
            </label>
            <input
              type="text"
              className="input"
              value={formData.key}
              onChange={e => setFormData({ ...formData, key: e.target.value })}
              placeholder="e.g., new-moon-opening"
              required
            />
            <small style={{ color: '#666' }}>Use lowercase with hyphens</small>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Title
            </label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., New Moon Opening Ceremony"
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Ritual Type
            </label>
            <select
              className="select"
              value={formData.ritualType}
              onChange={e => setFormData({ ...formData, ritualType: e.target.value as any })}
              required
            >
              <option value="new_moon">New Moon</option>
              <option value="full_moon">Full Moon</option>
              <option value="daily">Daily</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Description (optional)
            </label>
            <textarea
              className="textarea"
              value={formData.descriptionMarkdown}
              onChange={e => setFormData({ ...formData, descriptionMarkdown: e.target.value })}
              placeholder="Brief description of this ritual script..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Script'}
            </button>
            <Link href="/scripts" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
