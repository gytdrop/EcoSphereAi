import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Heart, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { socialService } from '../services/social.service'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'
import { useState } from 'react'

const STATUS_COLORS = { pending: '#64748b', approved: '#3b82f6', active: '#10b981', completed: '#8b5cf6', cancelled: '#ef4444' }
const DEPT_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']

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

  const diversityChartData = diversityData?.map(d => ({
    name: d.department,
    female: d.female_count,
    male: d.total_employees - d.female_count,
  })) || []

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Social Module</h1>
          <p className="page-subtitle">CSR activities, training programs, and diversity metrics</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create CSR Activity
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Active CSR Activities</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{csrData?.filter(a => a.status === 'active').length || 0}</div>
          <div className="stat-sub">Currently running programs</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Participants</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{totalParticipants}</div>
          <div className="stat-sub">Employees engaged in CSR</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Approvals</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>{csrData?.filter(a => a.status === 'pending').length || 0}</div>
          <div className="stat-sub">Awaiting manager review</div>
        </div>
      </div>

      {/* CSR Activity Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {csrData?.map((activity) => (
          <div key={activity.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{activity.title}</div>
              <span className="badge" style={{ background: STATUS_COLORS[activity.status] + '22', color: STATUS_COLORS[activity.status], marginLeft: 8, flexShrink: 0 }}>
                {activity.status}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>{activity.description}</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                <Users size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                {activity.participant_count} participants
              </span>
              <span style={{ fontSize: 11, color: 'var(--primary)' }}>+{activity.xp_reward} XP</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['approved', 'active'].includes(activity.status) && (
                <button className="btn btn-primary btn-sm" onClick={() => joinMutation.mutate(activity.id)} disabled={joinMutation.isPending}>
                  <Heart size={12} /> Join
                </button>
              )}
              {canApprove && activity.status === 'pending' && (
                <button className="btn btn-ghost btn-sm" onClick={() => approveMutation.mutate(activity.id)}>
                  <CheckCircle size={12} /> Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Training + Diversity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Training Programs</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trainingData?.map(t => (
              <div key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                  <span style={{ fontSize: 12, color: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : '#f59e0b' }}>
                    {parseFloat(t.completion_rate).toFixed(0)}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${t.completion_rate}%`, background: parseFloat(t.completion_rate) >= 80 ? 'var(--primary)' : '#f59e0b' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{t.duration_hours}h · {t.category}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Diversity Overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {diversityData?.map(d => (
              <div key={d.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{d.department}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{parseFloat(d.gender_ratio || 0).toFixed(0)}% female</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${d.gender_ratio}%`, background: '#3b82f6' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, marginBottom: 20 }}>Create CSR Activity</h3>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label className="form-label">Description</label><input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Category</label><input className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Environment, Health, Education..." /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>{createMutation.isPending ? <Spinner size={16} /> : 'Create Activity'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
