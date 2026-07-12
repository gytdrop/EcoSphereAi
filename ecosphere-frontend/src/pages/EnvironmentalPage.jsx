import { useState, useMemo, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { PageLoader } from '../components/ui/Spinner'
import DataTable from '../components/ui/DataTable'
import { Form, FormGroup, Input, Select, FormActions, SubmitButton } from '../components/ui/Form'
import { useEnvironmentalData } from '../hooks/useEnvironmentalData'

export default function EnvironmentalPage() {
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ department: '', emission_factor_id: '', quantity: '', notes: '' })

  const { transactions, isLoading, factors, goals, deptSummary, createTransaction } = useEnvironmentalData()

  const handleSubmit = useCallback(() => {
    createTransaction.mutate(form, {
      onSuccess: () => {
        setShowModal(false)
        setForm({ department: '', emission_factor_id: '', quantity: '', notes: '' })
      }
    })
  }, [form, createTransaction])

  const totalCO2 = useMemo(() => transactions.reduce((sum, t) => sum + parseFloat(t.co2_value), 0), [transactions])

  const columns = useMemo(() => [
    { key: 'transaction_date', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
    { key: 'department', label: 'Department', render: (val) => <span style={{ fontWeight: 500 }}>{val}</span> },
    { key: 'factor_name', label: 'Emission Factor' },
    { key: 'quantity', label: 'Quantity', render: (val, row) => `${parseFloat(val).toLocaleString()} ${row.factor_unit}` },
    { key: 'co2_value', label: 'CO₂ (kg)', render: (val) => <span style={{ fontWeight: 500, color: 'var(--primary)' }}>{parseFloat(val).toFixed(2)}</span> },
    { key: 'recorded_by', label: 'Recorded By' }
  ], [])

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Environmental Management</h1>
          <p className="page-subtitle">Carbon tracking, sustainability targets, and analytics</p>
        </div>
        <button id="add-transaction-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Log Transaction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total CO₂ (30 Days)</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{totalCO2.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          <div className="kpi-sub">kg CO₂ equivalent</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Transactions</div>
          <div className="kpi-value">{transactions.length}</div>
          <div className="kpi-sub">Entries recorded</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Goals</div>
          <div className="kpi-value">{goals.filter(g => g.status === 'active').length}</div>
          <div className="kpi-sub">Sustainability targets</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <DataTable columns={columns} data={transactions} keyField="id" rowsPerPage={8} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div className="toolbar"><span className="toolbar-title">Emissions by Dept.</span></div>
            <div style={{ paddingTop: 8 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={deptSummary} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border-strong)', borderRadius: 4, fontSize: 12 }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Bar dataKey="total_co2" fill="var(--primary)" radius={[2, 2, 0, 0]} name="CO₂ (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="toolbar"><span className="toolbar-title">Sustainability Goals</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 12 }}>
              {goals.slice(0, 5).map((goal) => {
                const pct = Math.min(100, (goal.current_value / goal.target_value) * 100)
                return (
                  <div key={goal.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{goal.title}</span>
                      <span style={{ fontSize: 12, color: pct >= 80 ? 'var(--primary)' : 'var(--text-muted)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
                      <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--primary)' : 'var(--warning)', borderRadius: 3 }} />
                    </div>
                  </div>
                )
              })}
              {goals.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No goals defined</div>}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-title">Log Carbon Transaction</div>
            <Form onSubmit={handleSubmit}>
              <FormGroup label="Department" required>
                <Input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Engineering" required />
              </FormGroup>
              <FormGroup label="Emission Factor" required>
                <Select value={form.emission_factor_id} onChange={(e) => setForm({ ...form, emission_factor_id: e.target.value })} required>
                  <option value="">Select emission factor...</option>
                  {factors.map(f => <option key={f.id} value={f.id}>{f.name} ({f.value} {f.unit})</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Quantity" required>
                <Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0.00" min="0.01" step="0.01" required />
              </FormGroup>
              <FormGroup label="Notes">
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional context..." />
              </FormGroup>
              <FormActions>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <SubmitButton isPending={createTransaction.isPending}>Log Transaction</SubmitButton>
              </FormActions>
            </Form>
          </div>
        </div>
      )}
    </div>
  )
}
