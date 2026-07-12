import { useQuery } from '@tanstack/react-query'
import { BarChart2, Leaf, Users, Shield, Download, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { reportsService } from '../services/reports.service'
import { PageLoader } from '../components/ui/Spinner'

const PIE_COLORS = ['#22C55E', '#4ADE80', '#86EFAC', '#9CA3AF', '#6B7280', '#4B5563']

const SCORE_ICONS = [
  { key: 'overall',       label: 'Overall ESG',    icon: BarChart2, color: 'var(--primary)' },
  { key: 'environmental', label: 'Environmental',   icon: Leaf,      color: 'var(--primary)' },
  { key: 'social',        label: 'Social',          icon: Users,     color: 'var(--text-secondary)' },
  { key: 'governance',    label: 'Governance',      icon: Shield,    color: 'var(--text-secondary)' },
]

export default function ReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['esg-report'],
    queryFn: () => reportsService.getESGReport().then(r => r.data.data),
  })

  if (isLoading) return <PageLoader />

  const { scores, emissionsByDept, emissionTrend, csrSummary, complianceSummary, topBadgeEarners, goalsSummary, generatedAt } = data

  const handleExport = () => {
    // Generate CSV content
    const lines = []
    lines.push('EcoSphere AI - ESG Report')
    lines.push(`Generated At,${new Date(generatedAt).toLocaleString()}`)
    lines.push('')
    
    lines.push('--- SCORES ---')
    lines.push(`Overall ESG,${scores.overall}`)
    lines.push(`Environmental,${scores.environmental}`)
    lines.push(`Social,${scores.social}`)
    lines.push(`Governance,${scores.governance}`)
    lines.push('')
    
    lines.push('--- EMISSIONS BY DEPARTMENT ---')
    lines.push('Department,Total CO2 (kg),Transactions')
    emissionsByDept?.forEach(d => lines.push(`${d.department},${d.total_co2},${d.transactions}`))
    lines.push('')
    
    lines.push('--- COMPLIANCE SUMMARY ---')
    lines.push(`Total Issues,${complianceSummary?.total_issues}`)
    lines.push(`Resolved,${complianceSummary?.resolved}`)
    lines.push(`Open,${complianceSummary?.open}`)
    lines.push(`Overdue,${complianceSummary?.overdue}`)
    lines.push('')
    
    const csvContent = lines.join('\\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `esg_report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ESG Report</h1>
          <p className="page-subtitle">Comprehensive sustainability performance report · Generated {new Date(generatedAt).toLocaleString()}</p>
        </div>
        <button className="btn btn-primary" onClick={handleExport}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, alignItems: 'start' }}>

        {/* Left filter/navigation panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'sticky', top: 20 }}>

          {/* Score Summary */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Score Summary</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {SCORE_ICONS.map(({ key, label, icon: Icon, color }) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderBottom: '1px solid var(--border)' }}>
                  <Icon size={13} color={color} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: scores[key] >= 75 ? 'var(--primary)' : scores[key] >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                    {scores[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Quick View */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Compliance</span>
            </div>
            <div style={{ padding: '4px 0' }}>
              {[
                { label: 'Total Issues', value: complianceSummary?.total_issues, color: 'var(--text-primary)' },
                { label: 'Resolved',     value: complianceSummary?.resolved,     color: 'var(--primary)' },
                { label: 'Open',         value: complianceSummary?.open,         color: 'var(--warning)' },
                { label: 'Overdue',      value: complianceSummary?.overdue,      color: 'var(--danger)' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 14px', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color }}>{value || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Report sections nav */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Sections</span>
            </div>
            <div style={{ padding: '4px 0' }}>
              {['Emissions Analysis', 'CSR Overview', 'Sustainability Goals', 'Top Performers'].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <ChevronRight size={11} color="var(--text-muted)" />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main report content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Score KPI strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {SCORE_ICONS.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="kpi-card" style={{ borderLeft: `2px solid ${scores[key] >= 75 ? 'var(--primary)' : scores[key] >= 50 ? 'var(--warning)' : 'var(--danger)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                  <Icon size={12} color={color} />
                  <span className="kpi-label">{label}</span>
                </div>
                <div className="kpi-value" style={{ color: scores[key] >= 75 ? 'var(--primary)' : scores[key] >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                  {scores[key]}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div className="progress-bar" style={{ marginTop: 4 }}>
                  <div className="progress-fill" style={{ width: `${scores[key]}%`, background: scores[key] >= 75 ? 'var(--primary)' : scores[key] >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="card" style={{ padding: 0 }}>
              <div className="toolbar">
                <span className="toolbar-title">Emissions by Department (Q3)</span>
              </div>
              <div style={{ padding: '8px 12px 8px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={emissionsByDept} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 11 }}
                      itemStyle={{ color: 'var(--primary)' }} labelStyle={{ color: 'var(--text-muted)' }} />
                    <Bar dataKey="total_co2" fill="var(--primary)" radius={[3, 3, 0, 0]} name="CO₂ (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card" style={{ padding: 0 }}>
              <div className="toolbar">
                <span className="toolbar-title">CSR Activities by Category</span>
              </div>
              <div style={{ padding: '8px 12px 8px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={csrSummary}
                      cx="50%" cy="50%"
                      outerRadius={72}
                      dataKey="activity_count"
                      nameKey="category"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {csrSummary?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sustainability Goals Table */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Sustainability Goals Status</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Progress</th>
                    <th style={{ textAlign: 'right' }}>Current / Target</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {goalsSummary?.map((g, i) => {
                    const pct = Math.min(100, (g.current_value / g.target_value) * 100)
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{g.title}</td>
                        <td style={{ width: 160 }}>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: g.status === 'achieved' ? 'var(--primary)' : pct > 60 ? 'var(--text-secondary)' : 'var(--warning)' }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{pct.toFixed(0)}%</div>
                        </td>
                        <td style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {g.current_value} / {g.target_value}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 500, color: g.status === 'achieved' ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>
                            {g.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Performers Table */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Top Sustainability Champions</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>XP Points</th>
                    <th style={{ textAlign: 'center' }}>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {topBadgeEarners?.map((u, i) => (
                    <tr key={u.name}>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 500,
                          background: i === 0 ? 'rgba(245,158,11,0.15)' : 'var(--surface-3)',
                          color: i === 0 ? '#FCD34D' : 'var(--text-muted)',
                        }}>{i + 1}</span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.department}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--primary)' }}>{u.xp}</td>
                      <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{u.badges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
