import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Heart, CheckCircle } from 'lucide-react'
import { socialService } from '../services/social.service'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'
import { useState } from 'react'

const STATUS_BADGE = {
  pending:   { bg: 'rgba(107,114,128,0.12)',  color: '#9CA3AF',  label: 'Pending' },
  approved:  { bg: 'rgba(34,197,94,0.10)',    color: '#4ADE80',  label: 'Approved' },
  active:    { bg: 'rgba(34,197,94,0.10)',    color: '#22C55E',  label: 'Active' },
  completed: { bg: 'rgba(107,114,128,0.10)',  color: '#9CA3AF',  label: 'Completed' },
  cancelled: { bg: 'rgba(239,68,68,0.10)',    color: '#FCA5A5',  label: 'Cancelled' },
}

export default function SocialPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: '', start_date: '', end_date: '', target_participants: 20, xp_reward: 100 })

  const { data: csrData, isLoading } = useQuery({ queryKey: ['social-csr'], queryFn: () => socialService.getCSR().then(r => r.data.data) })
  const { data: trainingData } = useQuery({ queryKey: ['social-training'], queryFn: () => socialService.getTraining().then(r => r.data.data) })
  const { data: diversityData } = useQuery({ queryKey: ['social-diversity'], queryFn: () => socialService.getDiversity().then(r => r.data.data) })

  const joinMutation = useMutation({ mutationFn: socialService.joinCSR, onSuccess: () => qc.invalidateQueries(['social-csr']) })
  const approveMutation = useMutation({ mutationFn: socialService.approveCSR, onSuccess: () => qc.invalidateQueries(['social-csr']) })
  const createMutation = useMutation({ mutationFn: socialService.createCSR, onSuccess: () => { qc.invalidateQueries(['social-csr']); setShowModal(false) } })

  if (isLoading) return <PageLoader />

  const canApprove = ['admin', 'sustainability_manager'].includes(user?.role)
  const totalParticipants = csrData?.reduce((s, a) => s + parseInt(a.participant_count || 0), 0) || 0
  const pendingCount = csrData?.filter(a => a.status === 'pending').length || 0

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Social Module</h1>
          <p className="page-subtitle">CSR activities, training programs, and diversity metrics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Create CSR Activity
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
        <div className="kpi-card">
          <div className="kpi-label">Active CSR Activities</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{csrData?.filter(a => a.status === 'active').length || 0}</div>
          <div className="kpi-sub">Currently running programs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Participants</div>
          <div className="kpi-value">{totalParticipants}</div>
          <div className="kpi-sub">Employees engaged in CSR</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pending Approvals</div>
          <div className="kpi-value" style={{ color: pendingCount > 0 ? 'var(--warning)' : 'var(--text-primary)' }}>{pendingCount}</div>
          <div className="kpi-sub">Awaiting manager review</div>
        </div>
      </div>

      {/* Main area: CSR table + side panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, alignItems: 'start' }}>

        {/* CSR Activities Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">CSR Activities</span>
            {pendingCount > 0 && (
              <span className="badge badge-yellow">{pendingCount} pending approval</span>
            )}
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Participants</th>
                  <th>XP Reward</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {csrData?.map(activity => {
                  const statusCfg = STATUS_BADGE[activity.status] || STATUS_BADGE.pending
                  return (
                    <tr key={activity.id} style={{ background: activity.status === 'pending' ? 'rgba(245,158,11,0.03)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{activity.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{activity.description?.substring(0, 60)}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{activity.category || '—'}</td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: statusCfg.bg, color: statusCfg.color }}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Users size={11} color="var(--text-muted)" />
                          {activity.participant_count}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--primary)', fontSize: 12 }}>+{activity.xp_reward} XP</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {['approved', 'active'].includes(activity.status) && (
                            <button className="btn btn-primary btn-sm" onClick={() => joinMutation.mutate(activity.id)} disabled={joinMutation.isPending}>
                              <Heart size={11} /> Join
                            </button>
                          )}
                          {canApprove && activity.status === 'pending' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => approveMutation.mutate(activity.id)}>
                              <CheckCircle size={11} /> Approve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {(!csrData || csrData.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No CSR activities found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Training Programs */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Training Programs</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {trainingData?.map(t => (
                <div key={t.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', flex: 1 }}>{t.title}</span>
                    <span style={{ fontSize: 11, color: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : 'var(--warning)', marginLeft: 8 }}>
                      {parseFloat(t.completion_rate).toFixed(0)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${t.completion_rate}%`, background: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : 'var(--warning)' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{t.duration_hours}h · {t.category}</div>
                </div>
              ))}
              {(!trainingData || trainingData.length === 0) && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '8px 0' }}>No programs</div>
              )}
            </div>
          </div>

          {/* Diversity */}
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Diversity Overview</span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {diversityData?.map(d => (
                <div key={d.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{d.department}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{parseFloat(d.gender_ratio || 0).toFixed(0)}% female</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${d.gender_ratio}%`, background: 'var(--surface-4)' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create CSR Activity</div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Environment, Health, Education..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Spinner size={14} /> : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
