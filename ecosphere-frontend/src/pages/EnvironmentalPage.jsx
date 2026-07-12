import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { environmentService } from '../services/environment.service'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'

export default function EnvironmentalPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ department: '', emission_factor_id: '', quantity: '', notes: '' })
  const [search, setSearch] = useState('')

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['env-transactions'],
    queryFn: () => environmentService.getTransactions().then(r => r.data),
  })
  const { data: factorsData } = useQuery({
    queryKey: ['env-factors'],
    queryFn: () => environmentService.getFactors().then(r => r.data.data),
  })
  const { data: goalsData } = useQuery({
    queryKey: ['env-goals'],
    queryFn: () => environmentService.getGoals().then(r => r.data.data),
  })
  const { data: deptData } = useQuery({
    queryKey: ['env-dept'],
    queryFn: () => environmentService.getDepartmentSummary().then(r => r.data.data),
  })

  const createMutation = useMutation({
    mutationFn: environmentService.createTransaction,
    onSuccess: () => {
      qc.invalidateQueries(['env-transactions'])
      qc.invalidateQueries(['env-dept'])
      setShowModal(false)
      setForm({ department: '', emission_factor_id: '', quantity: '', notes: '' })
    },
  })

  if (txLoading) return <PageLoader />

  const totalCO2 = txData?.data?.reduce((sum, t) => sum + parseFloat(t.co2_value), 0) || 0
  const filteredTx = txData?.data?.filter(t =>
    !search || t.department?.toLowerCase().includes(search.toLowerCase()) ||
    t.factor_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Module</h1>
          <p className="page-subtitle">Carbon emissions tracking, sustainability goals, and department analysis</p>
        </div>
        <button id="add-transaction-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Log Transaction
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total CO₂ (Last 30 Days)</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{totalCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="kpi-sub">kg CO₂ equivalent</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Transactions Logged</div>
          <div className="kpi-value">{txData?.data?.length || 0}</div>
          <div className="kpi-sub">Carbon entries recorded</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Goals</div>
          <div className="kpi-value">{goalsData?.filter(g => g.status === 'active').length || 0}</div>
          <div className="kpi-sub">Sustainability targets</div>
        </div>
      </div>

      {/* Main content: table (primary) + charts (secondary) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}>

        {/* Transaction Table — primary */}
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">Carbon Transactions</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={12} style={{ position: 'absolute', left: 8, color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                placeholder="Filter by dept / factor..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 26, width: 200, fontSize: 12, padding: '5px 8px 5px 26px' }}
              />
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Emission Factor</th>
                  <th>Quantity</th>
                  <th>CO₂ (kg)</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx?.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{new Date(t.transaction_date).toLocaleDateString()}</td>
                    <td><span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{t.department}</span></td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.factor_name}</td>
                    <td>{parseFloat(t.quantity).toLocaleString()} {t.factor_unit}</td>
                    <td style={{ fontWeight: 500, color: 'var(--primary)' }}>{parseFloat(t.co2_value).toFixed(2)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.recorded_by}</td>
                  </tr>
                ))}
                {(!filteredTx || filteredTx.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No transactions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Department Bar Chart */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Emissions by Dept.</span>
            </div>
            <div style={{ padding: '8px 12px 8px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={deptData} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 6, fontSize: 11 }}
                    labelStyle={{ color: 'var(--text-muted)' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Bar dataKey="total_co2" fill="var(--primary)" radius={[3, 3, 0, 0]} name="CO₂ (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Goals */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Sustainability Goals</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {goalsData?.slice(0, 5).map((goal) => {
                const pct = Math.min(100, (goal.current_value / goal.target_value) * 100)
                return (
                  <div key={goal.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{goal.title}</span>
                      <span style={{ fontSize: 11, color: pct >= 80 ? 'var(--primary)' : 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--primary)' : 'var(--warning)' }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </div>
                  </div>
                )
              })}
              {(!goalsData || goalsData.length === 0) && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No goals defined</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Log Carbon Transaction</div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Department</label>
                <input className="form-input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" required />
              </div>
              <div className="form-group">
                <label className="form-label">Emission Factor</label>
                <select className="form-input" value={form.emission_factor_id} onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })} required>
                  <option value="">Select emission factor...</option>
                  {factorsData?.map(f => <option key={f.id} value={f.id}>{f.name} ({f.value} {f.unit})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input className="form-input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0.00" min="0.01" step="0.01" required />
              </div>
              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional context..." />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner size={14} /> : 'Log Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
