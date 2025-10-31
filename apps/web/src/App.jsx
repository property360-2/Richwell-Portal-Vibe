import './index.css'

const roles = [
  {
    title: 'Dean Workspace',
    description: 'Manage courses, sections, and assign professors while reviewing academic trends.'
  },
  {
    title: 'Registrar Console',
    description: 'Validate transferees, resolve INCs, and audit archived student records.'
  },
  {
    title: 'Admission Portal',
    description: 'Guide kiosk enrollments and advise students on their next subjects.'
  }
]

export function App() {
  return (
    <main className="app">
      <header className="hero">
        <p className="eyebrow">Richwell College Portal</p>
        <h1>Academic lifecycle at a glance</h1>
        <p className="lead">
          React on the frontend, Express on the backend. Use this starter to explore flows per role
          and keep the archive-driven logic front and center.
        </p>
        <div className="actions">
          <a
            className="button"
            href="http://localhost:4000/health"
            target="_blank"
            rel="noreferrer"
          >
            API Health Check
          </a>
          <a className="button secondary" href="/docs" rel="noreferrer">
            Documentation Hub
          </a>
        </div>
      </header>

      <section className="grid">
        {roles.map((role) => (
          <article key={role.title} className="card">
            <h2>{role.title}</h2>
            <p>{role.description}</p>
          </article>
        ))}
      </section>

      <footer className="footer">
        <span>Configured for LAN kiosk flows and archive-first data management.</span>
      </footer>
    </main>
  )
}

export default App
