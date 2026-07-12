import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Leaf, Users, Shield, Trophy,
  Brain, FlaskConical, FileBarChart, LogOut, Sprout
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { path: '/environment',  label: 'Environmental',  icon: Leaf },
  { path: '/social',       label: 'Social',         icon: Users },
  { path: '/governance',   label: 'Governance',     icon: Shield },
  { path: '/gamification', label: 'Gamification',   icon: Trophy },
  { path: '/ai-advisor',   label: 'AI Advisor',     icon: Brain },
  { path: '/simulator',    label: 'ESG Simulator',  icon: FlaskConical },
  { path: '/reports',      label: 'Reports',        icon: FileBarChart },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      minWidth: 'var(--sidebar-width)',
      background: 'var(--surface-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28,
            background: 'var(--primary)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sprout size={15} color="black" />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              EcoSphere AI
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
              ESG Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Label */}
      <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        Menu
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 8px',
            borderRadius: 6,
            marginBottom: 1,
            textDecoration: 'none',
            fontSize: 12,
            fontWeight: 500,
            transition: 'background 0.1s, color 0.1s',
            background: isActive ? 'var(--primary-muted)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
            borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
          })}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 26, height: 26,
            background: 'var(--surface-3)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: 11, color: 'var(--primary)',
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'flex-start', gap: 6, fontSize: 12 }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
