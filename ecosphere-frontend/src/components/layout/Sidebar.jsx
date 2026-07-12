import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Leaf, Users, Shield, Trophy,
  Brain, FlaskConical, FileBarChart, LogOut, Sprout
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/environment',  label: 'Environmental',icon: Leaf },
  { path: '/social',       label: 'Social',       icon: Users },
  { path: '/governance',   label: 'Governance',   icon: Shield },
  { path: '/gamification', label: 'Gamification', icon: Trophy },
  { path: '/ai-advisor',   label: 'AI Advisor',   icon: Brain },
  { path: '/simulator',    label: 'ESG Simulator', icon: FlaskConical },
  { path: '/reports',      label: 'Reports',      icon: FileBarChart },
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
      width: 240,
      minWidth: 240,
      background: 'var(--surface-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'var(--primary)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sprout size={20} color="white" />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
              EcoSphere
            </div>
            <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.05em' }}>
              AI PLATFORM
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink key={path} to={path} style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 12px',
            borderRadius: 8,
            marginBottom: 2,
            textDecoration: 'none',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.15s',
            background: isActive ? 'rgba(16,185,129,0.12)' : 'transparent',
            color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
            borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px 16px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--primary)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 13, color: 'white',
          }}>
            {user?.name?.[0] || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              {user?.role?.replace('_', ' ')}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{ width: '100%' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  )
}
