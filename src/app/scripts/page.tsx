import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ScriptsPage() {
  const scripts = await prisma.ritualScript.findMany({
    include: {
      segments: true,
      variants: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Ritual Scripts</h1>
        <Link href="/scripts/new" className="btn btn-primary">
          Create New Script
        </Link>
      </div>

      {scripts.length === 0 ? (
        <div className="card">
          <p>No scripts found. Create your first ritual script!</p>
        </div>
      ) : (
        <div>
          {scripts.map(script => (
            <div key={script.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    <Link href={`/scripts/${script.key}`} style={{ color: '#0070f3' }}>
                      {script.title}
                    </Link>
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Key: <code>{script.key}</code> | Type: <strong>{script.ritualType}</strong>
                  </p>
                  {script.descriptionMarkdown && (
                    <p style={{ marginTop: '0.5rem' }}>{script.descriptionMarkdown}</p>
                  )}
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#666' }}>
                    <span>{script.segments.length} segments</span>
                    <span>{script.variants.length} variants</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/scripts/${script.key}`} className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>
                    Edit
                  </Link>
                  <Link href={`/scripts/${script.key}/preview`} className="btn btn-primary" style={{ fontSize: '0.9rem' }}>
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
