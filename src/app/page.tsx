import Link from 'next/link'

export default function Home() {
  return (
    <div className="container">
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        Ritual Script Library
      </h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem', color: '#666' }}>
        Manage and render ritual scripts with parameterized templates
      </p>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Welcome</h2>
        <p style={{ marginBottom: '1rem' }}>
          This library stores and manages ritual scripts for various ceremonies and gatherings.
          Scripts are parameterized by context such as moon phase, group size, and location.
        </p>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/scripts" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Browse Scripts
          </Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Features</h3>
        <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Create and manage ritual scripts with multiple segments</li>
          <li>Template-based rendering with variable substitution</li>
          <li>Context-aware variants (moon phase, group size, location)</li>
          <li>API endpoints for integration with other services</li>
        </ul>
      </div>
    </div>
  )
}
