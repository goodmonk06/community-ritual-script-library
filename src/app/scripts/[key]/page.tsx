'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Script {
  id: string
  key: string
  title: string
  ritualType: string
  descriptionMarkdown: string | null
  segments: Segment[]
  variants: Variant[]
}

interface Segment {
  id: string
  orderIndex: number
  segmentType: string
  templateMarkdown: string
  variablesJson: any
}

interface Variant {
  id: string
  variantKey: string
  conditionsJson: any
}

export default function ScriptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const key = params.key as string

  const [script, setScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newSegment, setNewSegment] = useState({
    orderIndex: 0,
    segmentType: 'opening',
    templateMarkdown: ''
  })

  useEffect(() => {
    fetchScript()
  }, [key])

  const fetchScript = async () => {
    try {
      const response = await fetch(`/api/scripts/${key}`)
      if (!response.ok) throw new Error('Failed to fetch script')
      const data = await response.json()
      setScript(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load script')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSegment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/scripts/${key}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSegment)
      })

      if (!response.ok) throw new Error('Failed to create segment')

      setNewSegment({
        orderIndex: (script?.segments.length || 0),
        segmentType: 'opening',
        templateMarkdown: ''
      })

      fetchScript()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add segment')
    }
  }

  const handleDeleteSegment = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) return

    try {
      const response = await fetch(`/api/scripts/${key}/segments/${segmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete segment')

      fetchScript()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete segment')
    }
  }

  const handleDeleteScript = async () => {
    if (!confirm('Are you sure you want to delete this entire script? This cannot be undone.')) return

    try {
      const response = await fetch(`/api/scripts/${key}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete script')

      router.push('/scripts')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete script')
    }
  }

  if (loading) return <div className="container">Loading...</div>
  if (!script) return <div className="container">Script not found</div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{script.title}</h1>
          <p style={{ color: '#666' }}>
            Key: <code>{script.key}</code> | Type: <strong>{script.ritualType}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/scripts/${key}/preview`} className="btn btn-primary">
            Preview
          </Link>
          <Link href="/scripts" className="btn btn-secondary">
            Back to List
          </Link>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {script.descriptionMarkdown && (
        <div className="card">
          <p>{script.descriptionMarkdown}</p>
        </div>
      )}

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Segments ({script.segments.length})</h2>

        {script.segments.length === 0 ? (
          <p style={{ color: '#666', marginBottom: '1rem' }}>No segments yet. Add your first segment below.</p>
        ) : (
          <div style={{ marginBottom: '2rem' }}>
            {script.segments
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((segment, index) => (
                <div
                  key={segment.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div>
                      <strong>#{segment.orderIndex}</strong> - <em>{segment.segmentType}</em>
                    </div>
                    <button
                      onClick={() => handleDeleteSegment(segment.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                    >
                      Delete
                    </button>
                  </div>
                  <pre style={{
                    background: '#f5f5f5',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '0.9rem'
                  }}>
                    {segment.templateMarkdown}
                  </pre>
                </div>
              ))}
          </div>
        )}

        <h3 style={{ marginBottom: '1rem' }}>Add New Segment</h3>
        <form onSubmit={handleAddSegment}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Order Index
            </label>
            <input
              type="number"
              className="input"
              value={newSegment.orderIndex}
              onChange={e => setNewSegment({ ...newSegment, orderIndex: parseInt(e.target.value) })}
              required
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Segment Type
            </label>
            <select
              className="select"
              value={newSegment.segmentType}
              onChange={e => setNewSegment({ ...newSegment, segmentType: e.target.value })}
              required
            >
              <option value="opening">Opening</option>
              <option value="transition">Transition</option>
              <option value="core">Core</option>
              <option value="closing">Closing</option>
              <option value="blessing">Blessing</option>
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Template Markdown
            </label>
            <textarea
              className="textarea"
              value={newSegment.templateMarkdown}
              onChange={e => setNewSegment({ ...newSegment, templateMarkdown: e.target.value })}
              placeholder="Use {{variableName}} for variable substitution"
              style={{ minHeight: '150px' }}
              required
            />
            <small style={{ color: '#666' }}>
              Use {'{{variableName}}'} for variables, e.g., {'{{communityName}}'}, {'{{moonPhase}}'}
            </small>
          </div>

          <button type="submit" className="btn btn-primary">
            Add Segment
          </button>
        </form>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Variants ({script.variants.length})</h2>

        {script.variants.length === 0 ? (
          <p style={{ color: '#666' }}>No variants defined. The default template will be used.</p>
        ) : (
          <div>
            {script.variants.map(variant => (
              <div
                key={variant.id}
                style={{
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  marginBottom: '0.5rem'
                }}
              >
                <div><strong>{variant.variantKey}</strong></div>
                <pre style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                  {JSON.stringify(
                    typeof variant.conditionsJson === 'string'
                      ? JSON.parse(variant.conditionsJson)
                      : variant.conditionsJson,
                    null,
                    2
                  )}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ background: '#ffebee' }}>
        <h3 style={{ marginBottom: '1rem', color: '#d32f2f' }}>Danger Zone</h3>
        <button
          onClick={handleDeleteScript}
          className="btn"
          style={{ background: '#d32f2f', color: 'white' }}
        >
          Delete Script
        </button>
      </div>
    </div>
  )
}
