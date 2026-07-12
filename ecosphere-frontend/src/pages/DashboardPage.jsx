import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Leaf, Users, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '../services/dashboard.service'
import { PageLoader } from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import DataTable from '../components/ui/DataTable'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px 12px', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
            {p.value?.toLocaleString()} kg CO₂
          </div>
        ))}
      </div>
    )
  }
  return null
}

function KpiCard({ label, value, sub, color, trend }) {
  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: color || 'var(--text-primary)', marginTop: 4, display: 'flex', alignItems: 'center' }}>
        {value}
        {trend === 'up' && <TrendingUp size={14} color="var(--success)" style={{ marginLeft: 6 }} />}
        {trend === 'down' && <TrendingDown size={14} color="var(--danger)" style={{ marginLeft: 6 }} />}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ScoreKpi({ label, score, icon: Icon }) {
  const color = score >= 75 ? 'var(--text-primary)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="card" style={{ padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 600, color }}>
        {score}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
      </div>
      <div style={{ marginTop: 8, height: 4, background: 'var(--surface-3)', borderRadius: 2 }}>
        <div style={{ width: `${score}%`, background: color, height: '100%', borderRadius: 2 }} />
      </div>
    </div>
  )
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
    <div style={{ padding: 16, background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>
      Failed to load enterprise dashboard data.
    </div>
  )

  const { scores, leaderboard, compliance, csr, emissionTrend } = data

  const leaderboardColumns = [
    { key: 'name', label: 'Employee', render: (val, row) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, border: '1px solid var(--border)' }}>{val.charAt(0)}</div>
        <div style={{ fontSize: 12, fontWeight: 500 }}>{val}</div>
      </div>
    )},
    { key: 'department', label: 'Department', render: (val) => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{val}</span> },
    { key: 'xp', label: 'Impact Score', render: (val) => <span style={{ fontWeight: 600 }}>{val} <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 400 }}>XP</span></span> }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>Enterprise Overview</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Welcome, {user?.name} | {new Date().toLocaleDateString()}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>Export PDF</button>
          <button className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }}>Generate Report</button>
        </div>
      </div>

      {/* Alerts */}
      <div style={{ display: 'flex', gap: 12 }}>
        {compliance.open_issues > 0 && (
          <div style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} color="var(--danger)" />
            <span style={{ fontSize: 12, color: 'var(--danger)' }}>
              <strong>{compliance.open_issues} Open Compliance Issues</strong> ({compliance.critical_issues} critical, {compliance.overdue_issues} overdue)
            </span>
          </div>
        )}
        <div style={{ flex: 1, padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} color="var(--warning)" />
          <span style={{ fontSize: 12, color: '#92400E' }}>
            <strong>3 Pending Approvals</strong> require your review in the Social module.
          </span>
        </div>
      </div>

      {/* Main KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <ScoreKpi label="Overall ESG" score={scores.overall} icon={TrendingUp} />
        <ScoreKpi label="Environmental" score={scores.environmental} icon={Leaf} />
        <ScoreKpi label="Social" score={scores.social} icon={Users} />
        <ScoreKpi label="Governance" score={scores.governance} icon={Shield} />
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard label="Active CSR Programs" value={csr.active_csr} sub={`${csr.total_participants} participants`} />
        <KpiCard label="Open Issues" value={compliance.open_issues} sub={`${compliance.critical_issues} critical`} color={Number(compliance.open_issues) > 3 ? 'var(--danger)' : 'var(--warning)'} />
        <KpiCard label="Overdue Actions" value={compliance.overdue_issues} sub="Require immediate attention" color={Number(compliance.overdue_issues) > 0 ? 'var(--danger)' : ''} />
        <KpiCard label="Weight Config (E/S/G)" value={`${scores.weights.environmental}/${scores.weights.social}/${scores.weights.governance}`} sub="Current scoring model" />
      </div>

      {/* Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 16 }}>
        {/* Charts */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface-3)' }}>
            <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Emissions Trajectory</span>
          </div>
          <div style={{ padding: '16px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={emissionTrend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)' }} />
                <Line type="monotone" dataKey="total_emissions" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--surface)', stroke: 'var(--primary)', strokeWidth: 2, r: 3 }} activeDot={{ r: 5, fill: 'var(--primary)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Contributors */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>Top Contributors</div>
          <DataTable columns={leaderboardColumns} data={leaderboard || []} rowsPerPage={5} />
        </div>
      </div>
    </div>
  )
}
