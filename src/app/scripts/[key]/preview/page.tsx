'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface RenderedOutput {
  scriptKey: string
  title: string
  ritualType: string
  segments: Array<{
    orderIndex: number
    segmentType: string
    renderedMarkdown: string
  }>
  fullText: string
  selectedVariant: string | null
}

export default function PreviewPage() {
  const params = useParams()
  const key = params.key as string

  const [context, setContext] = useState(JSON.stringify({
    communityName: 'Mindful Circle',
    moonPhase: 'new',
    groupSize: 'medium',
    location: 'online',
    facilitator: 'Sarah'
  }, null, 2))

  const [rendered, setRendered] = useState<RenderedOutput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRender = async () => {
    setLoading(true)
    setError('')

    try {
      const contextJson = JSON.parse(context)

      const response = await fetch(`/api/scripts/${key}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextJson })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to render script')
      }

      const data = await response.json()
      setRendered(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render script')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Preview Script</h1>
        <Link href={`/scripts/${key}`} className="btn btn-secondary">
          Back to Edit
        </Link>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Rendering Context</h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Edit the JSON below to customize the rendering context. Variables used in templates will be substituted with these values.
        </p>

        <textarea
          className="textarea"
          value={context}
          onChange={e => setContext(e.target.value)}
          style={{ minHeight: '200px', fontFamily: 'monospace' }}
        />

        <button
          onClick={handleRender}
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Rendering...' : 'Render Script'}
        </button>

        {error && <div className="error" style={{ marginTop: '1rem' }}>{error}</div>}
      </div>

      {rendered && (
        <>
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>{rendered.title}</h2>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Type: <strong>{rendered.ritualType}</strong>
              {rendered.selectedVariant && (
                <> | Variant: <strong>{rendered.selectedVariant}</strong></>
              )}
            </p>

            <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '4px' }}>
              {rendered.segments.map((segment, index) => (
                <div key={index} style={{ marginBottom: index < rendered.segments.length - 1 ? '2rem' : 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    color: '#666',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem'
                  }}>
                    {segment.segmentType}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {segment.renderedMarkdown}
                  </div>
                  {index < rendered.segments.length - 1 && (
                    <hr style={{ margin: '1rem 0', border: 'none', borderTop: '1px solid #ddd' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>Full Text Output</h3>
            <pre style={{
              background: '#f5f5f5',
              padding: '1rem',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.9rem',
              whiteSpace: 'pre-wrap'
            }}>
              {rendered.fullText}
            </pre>
          </div>
        </>
      )}
    </div>
  )
}
