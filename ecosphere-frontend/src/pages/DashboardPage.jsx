import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, Leaf, Users, Shield, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardService } from '../services/dashboard.service'
import { PageLoader } from '../components/ui/Spinner'
import { useAuthStore } from '../store/authStore'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'rgba(20,20,20,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 16px' }}>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 500 }}>
            {p.value?.toLocaleString()} kg CO₂
          </div>
        ))}
      </div>
    )
  }
  return null
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

function KpiCard({ label, value, sub, color, trend }) {
  return (
    <motion.div variants={cardVariants} className="kpi-card" whileHover={{ scale: 1.02 }}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
        {trend === 'up' && <TrendingUp size={16} color="var(--success)" style={{ marginLeft: 8, verticalAlign: 'middle' }} />}
        {trend === 'down' && <TrendingDown size={16} color="var(--danger)" style={{ marginLeft: 8, verticalAlign: 'middle' }} />}
      </div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </motion.div>
  )
}

function ScoreKpi({ label, score, icon: Icon }) {
  const color = score >= 75 ? '#FFFFFF' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <motion.div variants={cardVariants} className="kpi-card" whileHover={{ scale: 1.02 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.05)', padding: 6, borderRadius: 6 }}>
          <Icon size={14} color={color} />
        </div>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value" style={{ color }}>
        {score}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>/100</span>
      </div>
      <div className="progress-bar" style={{ marginTop: 12, height: 3, background: 'rgba(255,255,255,0.1)' }}>
        <motion.div 
          className="progress-fill" 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          style={{ background: color, height: '100%', borderRadius: 99 }} 
        />
      </div>
    </motion.div>
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
    <div className="alert alert-danger" style={{ marginTop: 24 }}>
      Failed to load dashboard data.
    </div>
  )

  const { scores, leaderboard, compliance, csr, emissionTrend } = data

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
    >
      {/* Page header */}
      <motion.div variants={cardVariants} className="page-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 24, marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 400, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Intelligence Center</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Welcome back, {user?.name}. Here is your enterprise sustainability overview.</p>
        </div>
      </motion.div>

      {/* Compliance alert */}
      {compliance.open_issues > 0 && (
        <motion.div variants={cardVariants} className="alert alert-danger" style={{ marginBottom: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} color="#F87171" />
          <span style={{ color: '#FCA5A5' }}>
            <strong style={{ color: '#FFF' }}>{compliance.open_issues} open compliance issues</strong> — {compliance.critical_issues} critical, {compliance.overdue_issues} overdue.
            {' '}<span style={{ color: 'rgba(255,255,255,0.6)' }}>Review in the Governance module.</span>
          </span>
        </motion.div>
      )}

      {/* ESG Score KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
        <ScoreKpi label="ESG Rating" score={scores.overall} icon={TrendingUp} />
        <ScoreKpi label="Environmental" score={scores.environmental} icon={Leaf} />
        <ScoreKpi label="Social" score={scores.social} icon={Users} />
        <ScoreKpi label="Governance" score={scores.governance} icon={Shield} />
      </div>

      {/* Secondary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <KpiCard
          label="Active CSR Programs"
          value={csr.active_csr}
          sub={`${csr.total_participants} total participants`}
          color="#FFFFFF"
        />
        <KpiCard
          label="Open Issues"
          value={compliance.open_issues}
          sub={`${compliance.critical_issues} critical`}
          color={Number(compliance.open_issues) > 3 ? 'var(--danger)' : 'var(--warning)'}
        />
        <KpiCard
          label="Overdue Actions"
          value={compliance.overdue_issues}
          sub="Require immediate attention"
          color={Number(compliance.overdue_issues) > 0 ? 'var(--danger)' : '#FFFFFF'}
        />
        <KpiCard
          label="Weight Config (E/S/G)"
          value={`${scores.weights.environmental}/${scores.weights.social}/${scores.weights.governance}`}
          sub="Current scoring model"
          color="#FFFFFF"
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

        {/* Emission Trend */}
        <motion.div variants={cardVariants} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="toolbar" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="toolbar-title" style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Emissions Trajectory</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Monthly CO₂ (kg)</span>
          </div>
          <div style={{ padding: '24px 24px 16px' }}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={emissionTrend} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="total_emissions"
                  name="CO₂ Emissions"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  dot={{ fill: '#000', stroke: '#FFF', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#FFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={cardVariants} className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="toolbar" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="toolbar-title" style={{ fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top Contributors</span>
          </div>
          <div style={{ padding: '8px 0' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Employee</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Impact</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.slice(0, 6).map((u, i) => (
                  <tr key={u.id} style={{ borderBottom: i !== 5 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: '#FFF', fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{u.department}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right', fontSize: 13, fontWeight: 500, color: '#FFFFFF' }}>{u.xp} <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>XP</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
