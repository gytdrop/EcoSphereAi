import { useQuery } from '@tanstack/react-query'
import { BarChart2, Leaf, Users, Shield, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { reportsService } from '../services/reports.service'
import { PageLoader } from '../components/ui/Spinner'

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['esg-report'],
    queryFn: () => reportsService.getESGReport().then(r => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const { scores, emissionsByDept, emissionTrend, csrSummary, complianceSummary, topBadgeEarners, goalsSummary, generatedAt } = data

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ESG Report</h1>
          <p className="page-subtitle">Comprehensive sustainability performance report · Generated {new Date(generatedAt).toLocaleString()}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => window.print()}>
          <Download size={16} /> Export
        </button>
      </div>

      {/* Score overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Overall ESG', value: scores.overall, color: 'var(--primary)', icon: BarChart2 },
          { label: 'Environmental', value: scores.environmental, color: 'var(--primary)', icon: Leaf },
          { label: 'Social', value: scores.social, color: '#3b82f6', icon: Users },
          { label: 'Governance', value: scores.governance, color: '#8b5cf6', icon: Shield },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Icon size={14} color={color} />
              <span className="stat-label">{label}</span>
            </div>
            <div className="stat-value" style={{ color }}>{value}/100</div>
            <div className="progress-bar" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${value}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Emissions by Department */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Emissions by Department (Q3)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={emissionsByDept} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
                itemStyle={{ color: 'var(--primary)' }} labelStyle={{ color: 'var(--text-muted)' }} />
              <Bar dataKey="total_co2" fill="var(--primary)" radius={[4, 4, 0, 0]} name="CO₂ (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CSR by Category */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>CSR Activities by Category</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={csrSummary} cx="50%" cy="50%" outerRadius={80} dataKey="activity_count" nameKey="category" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {csrSummary?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }} itemStyle={{ color: 'var(--text-primary)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Compliance Summary */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Compliance Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Total Issues', value: complianceSummary?.total_issues, color: 'var(--text-primary)' },
              { label: 'Resolved', value: complianceSummary?.resolved, color: 'var(--primary)' },
              { label: 'Open', value: complianceSummary?.open, color: '#f59e0b' },
              { label: 'Overdue', value: complianceSummary?.overdue, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: 'var(--surface-3)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: 'Poppins' }}>{value || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Goals */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Sustainability Goals Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {goalsSummary?.map((g, i) => {
              const pct = Math.min(100, (g.current_value / g.target_value) * 100)
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{g.title}</span>
                    <span style={{ fontSize: 11, color: g.status === 'achieved' ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {g.status === 'achieved' ? 'Achieved' : `${pct.toFixed(0)}%`}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: g.status === 'achieved' ? 'var(--primary)' : pct > 60 ? '#3b82f6' : '#f59e0b' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top performers */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins', fontWeight: 600 }}>Top Sustainability Champions</div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>#</th><th>Employee</th><th>Department</th><th>XP Points</th><th>Badges</th></tr>
            </thead>
            <tbody>
              {topBadgeEarners?.map((u, i) => (
                <tr key={u.name}>
                  <td>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? '#f59e0b' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: i === 0 ? 'white' : 'var(--text-muted)' }}>{i + 1}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.department}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.xp}</td>
                  <td>{u.badges}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
