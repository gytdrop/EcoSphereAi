import { useState, useMemo, useCallback } from 'react'
import { Plus, Users, Heart, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'
import DataTable from '../components/ui/DataTable'
import { Form, FormGroup, Input, FormActions, SubmitButton } from '../components/ui/Form'
import { useSocialData } from '../hooks/useSocialData'

const STATUS_BADGE = {
  pending:   { bg: 'var(--surface-3)',  color: 'var(--text-secondary)',  label: 'Pending' },
  approved:  { bg: 'var(--success)',    color: '#FFFFFF',  label: 'Approved' },
  active:    { bg: 'var(--success)',    color: '#FFFFFF',  label: 'Active' },
  completed: { bg: 'var(--surface-3)',  color: 'var(--text-secondary)',  label: 'Completed' },
  cancelled: { bg: 'var(--danger)',     color: '#FFFFFF',  label: 'Cancelled' },
}

export default function SocialPage() {
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', start_date: '', end_date: '', target_participants: 20, xp_reward: 100 })

  const { csr, training, diversity, isLoading, joinMutation, approveMutation, createMutation } = useSocialData()

  const canApprove = ['admin', 'sustainability_manager'].includes(user?.role)
  const totalParticipants = useMemo(() => csr.reduce((s, a) => s + parseInt(a.participant_count || 0), 0), [csr])
  const pendingCount = useMemo(() => csr.filter(a => a.status === 'pending').length, [csr])

  const handleSubmit = useCallback(() => {
    createMutation.mutate(form, {
      onSuccess: () => {
        setShowModal(false)
        setForm({ title: '', description: '', category: '', start_date: '', end_date: '', target_participants: 20, xp_reward: 100 })
      }
    })
  }, [form, createMutation])

  const columns = useMemo(() => [
    { key: 'title', label: 'Activity', render: (val, row) => (
      <div>
        <div style={{ fontWeight: 500 }}>{val}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{row.description?.substring(0, 60)}</div>
      </div>
    )},
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (val) => {
      const cfg = STATUS_BADGE[val] || STATUS_BADGE.pending
      return (
        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: cfg.bg, color: cfg.color }}>
          {cfg.label}
        </span>
      )
    }},
    { key: 'participant_count', label: 'Participants', render: (val) => (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={12} color="var(--text-muted)" /> {val}
      </span>
    )},
    { key: 'xp_reward', label: 'XP Reward', render: (val) => <span style={{ fontWeight: 500, color: 'var(--primary)' }}>+{val} XP</span> },
    { key: 'actions', label: 'Actions', sortable: false, render: (_, row) => (
      <div style={{ display: 'flex', gap: 6 }}>
        {['approved', 'active'].includes(row.status) && (
          <button className="btn btn-primary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => joinMutation.mutate(row.id)} disabled={joinMutation.isPending}>
            <Heart size={12} /> Join
          </button>
        )}
        {canApprove && row.status === 'pending' && (
          <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => approveMutation.mutate(row.id)} disabled={approveMutation.isPending}>
            <CheckCircle size={12} /> Approve
          </button>
        )}
      </div>
    )}
  ], [canApprove, joinMutation, approveMutation])

  if (isLoading) return <PageLoader />

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
        <div>
          <h1 className="page-title">Social & Community</h1>
          <p className="page-subtitle">CSR activities, training programs, and diversity metrics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Create CSR Activity
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active CSR Programs</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--primary)', marginTop: 4 }}>{csr.filter(a => a.status === 'active').length}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Currently running programs</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Total Participants</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>{totalParticipants}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Employees engaged in CSR</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Approvals</div>
          <div style={{ fontSize: 24, fontWeight: 600, color: pendingCount > 0 ? 'var(--warning)' : 'var(--text-primary)', marginTop: 4 }}>{pendingCount}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Awaiting manager review</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 8 }}>CSR Directory</div>
          <DataTable columns={columns} data={csr} rowsPerPage={8} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar"><span className="toolbar-title">Training Programs</span></div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {training.map(t => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{t.title}</span>
                    <span style={{ fontSize: 12, color: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : 'var(--warning)' }}>
                      {parseFloat(t.completion_rate).toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
                    <div className="progress-fill" style={{ width: `${t.completion_rate}%`, background: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : 'var(--warning)', borderRadius: 3 }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{t.duration_hours}h · {t.category}</div>
                </div>
              ))}
              {training.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>No programs</div>}
            </div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar"><span className="toolbar-title">Diversity Overview</span></div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {diversity.map(d => (
                <div key={d.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{d.department}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{parseFloat(d.gender_ratio || 0).toFixed(0)}% female</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6, borderRadius: 3 }}>
                    <div className="progress-fill" style={{ width: `${d.gender_ratio}%`, background: 'var(--surface-4)', borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-title">Create CSR Activity</div>
            <Form onSubmit={handleSubmit}>
              <FormGroup label="Title" required>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </FormGroup>
              <FormGroup label="Description">
                <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </FormGroup>
              <FormGroup label="Category">
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Environment, Health, Education..." />
              </FormGroup>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormGroup label="Start Date">
                  <Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
                </FormGroup>
                <FormGroup label="End Date">
                  <Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
                </FormGroup>
              </div>
              <FormActions>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <SubmitButton isPending={createMutation.isPending}>Create Activity</SubmitButton>
              </FormActions>
            </Form>
          </div>
        </div>
      )}
    </div>
  )
}
