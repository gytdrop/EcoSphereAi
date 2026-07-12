import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/dashboard':    { title: 'ESG Dashboard',       sub: 'Overview of sustainability performance metrics' },
  '/environment':  { title: 'Environmental',        sub: 'Carbon emissions, goals and transactions' },
  '/social':       { title: 'Social',               sub: 'CSR activities, training and diversity' },
  '/governance':   { title: 'Governance',           sub: 'Policies, compliance and audit management' },
  '/gamification': { title: 'Gamification',         sub: 'Challenges, badges and leaderboard' },
  '/ai-advisor':   { title: 'AI ESG Advisor',       sub: 'Executive ESG report and recommendations' },
  '/simulator':    { title: 'ESG Score Simulator',  sub: 'Predict score changes before implementation' },
  '/reports':      { title: 'ESG Reports',          sub: 'Comprehensive sustainability performance report' },
}

export default function Layout() {
  const location = useLocation()
  const page = PAGE_TITLES[location.pathname] || { title: 'EcoSphere AI', sub: '' }
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top header bar */}
        <header style={{
          height: 46,
          background: 'var(--surface-2)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>EcoSphere AI</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>›</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{page.title}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{now}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: '20px 24px',
          overflowY: 'auto',
          background: 'var(--surface)',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
