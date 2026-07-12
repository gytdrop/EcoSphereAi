import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Leaf, Target, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { environmentService } from '../services/environment.service'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'

export default function EnvironmentalPage() {
  const qc = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ department: '', emission_factor_id: '', quantity: '', notes: '' })

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
    onSuccess: () => { qc.invalidateQueries(['env-transactions']); qc.invalidateQueries(['env-dept']); setShowModal(false); setForm({ department: '', emission_factor_id: '', quantity: '', notes: '' }) },
  })

  if (txLoading) return <PageLoader />

  const totalCO2 = txData?.data?.reduce((sum, t) => sum + parseFloat(t.co2_value), 0) || 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Module</h1>
          <p className="page-subtitle">Carbon emissions tracking, sustainability goals, and department analysis</p>
        </div>
        <button id="add-transaction-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Log Carbon Transaction
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total CO₂ (Last 30 days)</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{totalCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="stat-sub">kg CO₂ equivalent</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions Logged</div>
          <div className="stat-value">{txData?.data?.length || 0}</div>
          <div className="stat-sub">Carbon entries recorded</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Goals</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {goalsData?.filter(g => g.status === 'active').length || 0}
          </div>
          <div className="stat-sub">Sustainability targets</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Department Bar Chart */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Emissions by Department</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-muted)' }} itemStyle={{ color: 'var(--primary)' }} />
              <Bar dataKey="total_co2" fill="var(--primary)" radius={[4, 4, 0, 0]} name="CO₂ (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Goals */}
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Sustainability Goals</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {goalsData?.slice(0, 4).map((goal) => {
              const pct = Math.min(100, (goal.current_value / goal.target_value) * 100)
              return (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{goal.title}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--primary)' : '#f59e0b' }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins', fontWeight: 600 }}>
          Carbon Transactions
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
              {txData?.data?.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.transaction_date).toLocaleDateString()}</td>
                  <td><span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{t.department}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.factor_name}</td>
                  <td>{parseFloat(t.quantity).toLocaleString()} {t.factor_unit}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{parseFloat(t.co2_value).toFixed(2)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{t.recorded_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 20 }}>Log Carbon Transaction</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner size={16} /> : 'Log Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
