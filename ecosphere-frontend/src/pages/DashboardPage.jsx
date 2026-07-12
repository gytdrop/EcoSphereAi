import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Leaf, Users, Shield, AlertTriangle, Activity } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { dashboardService } from '../services/dashboard.service'
import { PageLoader } from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'

function ScoreCard({ label, score, color, icon: Icon }) {
  const radius = 45
  const circ = 2 * Math.PI * radius
  const dash = (score / 100) * circ

  return (
    <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center' }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={8} />
        <circle cx={55} cy={55} r={radius} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 55 55)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x={55} y={55} dominantBaseline="middle" textAnchor="middle"
          style={{ fill: 'white', fontFamily: 'Poppins', fontWeight: 700, fontSize: 20 }}>
          {score}
        </text>
      </svg>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Icon size={14} color={color} />
        <span className="stat-label">{label}</span>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
            {p.value?.toLocaleString()} kg CO₂
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get().then(r => r.data.data),
    refetchInterval: 60000,
  })

  if (isLoading) return <PageLoader />
  if (error) return (
    <div style={{ color: 'var(--danger)', padding: 24 }}>
      Failed to load dashboard. Is the backend running?
    </div>
  )

  const { scores, leaderboard, compliance, csr, emissionTrend, recentTransactions } = data

  const scoreColor = scores.overall >= 75 ? '#10b981' : scores.overall >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ESG Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name} — here's your sustainability performance overview</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live</span>
        </div>
      </div>

      {/* Overall ESG Score + Module Scores */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ alignItems: 'center', textAlign: 'center', gridRow: '1', background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.3)' }}>
          <svg width={130} height={130} viewBox="0 0 130 130">
            <circle cx={65} cy={65} r={55} fill="none" stroke="var(--surface-3)" strokeWidth={10} />
            <circle cx={65} cy={65} r={55} fill="none" stroke={scoreColor} strokeWidth={10}
              strokeDasharray={`${(scores.overall / 100) * (2 * Math.PI * 55)} ${2 * Math.PI * 55}`}
              strokeLinecap="round" transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dasharray 0.8s ease' }} />
            <text x={65} y={60} dominantBaseline="middle" textAnchor="middle"
              style={{ fill: 'white', fontFamily: 'Poppins', fontWeight: 800, fontSize: 26 }}>
              {scores.overall}
            </text>
            <text x={65} y={82} dominantBaseline="middle" textAnchor="middle"
              style={{ fill: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 11 }}>
              /100
            </text>
          </svg>
          <div className="stat-label" style={{ fontSize: 13 }}>Overall ESG Score</div>
        </div>

        <ScoreCard label="Environmental" score={scores.environmental} color="#10b981" icon={Leaf} />
        <ScoreCard label="Social" score={scores.social} color="#3b82f6" icon={Users} />
        <ScoreCard label="Governance" score={scores.governance} color="#8b5cf6" icon={Shield} />
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Active CSR Programs', value: csr.active_csr, sub: `${csr.total_participants} participants`, color: '#10b981' },
          { label: 'Open Compliance Issues', value: compliance.open_issues, sub: `${compliance.critical_issues} critical`, color: Number(compliance.open_issues) > 3 ? '#ef4444' : '#f59e0b' },
          { label: 'Overdue Issues', value: compliance.overdue_issues, sub: 'Require immediate action', color: Number(compliance.overdue_issues) > 0 ? '#ef4444' : '#10b981' },
          { label: 'ESG Weights (E/S/G)', value: `${scores.weights.environmental}/${scores.weights.social}/${scores.weights.governance}`, sub: 'Configurable weightage', color: '#8b5cf6' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
            <div className="stat-sub">{sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Emission Trend */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 20 }}>Carbon Emissions Trend</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={emissionTrend} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="total_emissions" name="CO₂ Emissions"
                stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Top Performers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {leaderboard?.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: i === 0 ? '#f59e0b' : i === 1 ? 'var(--surface-3)' : '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.department}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>{u.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {compliance.open_issues > 0 && (
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="#ef4444" />
          <div>
            <span style={{ fontWeight: 600, color: '#fca5a5' }}>{compliance.open_issues} open compliance issues</span>
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}> — {compliance.critical_issues} critical, {compliance.overdue_issues} overdue. Review in Governance module.</span>
          </div>
        </div>
      )}
    </div>
  )
}
