import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, AlertTriangle, Plus, Clock } from 'lucide-react'
import { governanceService } from '../services/governance.service'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'
import { useState } from 'react'

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: '#450a0a' },
  high:     { color: '#f59e0b', bg: '#451a03' },
  medium:   { color: '#3b82f6', bg: '#0c1a3a' },
  low:      { color: '#64748b', bg: 'var(--surface-3)' },
}

const STATUS_CONFIG = {
  open:        { color: '#f59e0b', label: 'Open' },
  in_progress: { color: '#3b82f6', label: 'In Progress' },
  resolved:    { color: '#10b981', label: 'Resolved' },
  overdue:     { color: '#ef4444', label: 'Overdue' },
}

export default function GovernancePage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('compliance')

  const { data: policies, isLoading: polLoading } = useQuery({ queryKey: ['gov-policies'], queryFn: () => governanceService.getPolicies().then(r => r.data.data) })
  const { data: compliance, isLoading: compLoading } = useQuery({ queryKey: ['gov-compliance'], queryFn: () => governanceService.getCompliance().then(r => r.data.data) })
  const { data: audits } = useQuery({ queryKey: ['gov-audits'], queryFn: () => governanceService.getAudits().then(r => r.data.data) })

  const ackMutation = useMutation({ mutationFn: governanceService.acknowledgePolicy, onSuccess: () => qc.invalidateQueries(['gov-policies']) })
  const updateMutation = useMutation({ mutationFn: ({ id, data }) => governanceService.updateCompliance(id, data), onSuccess: () => qc.invalidateQueries(['gov-compliance']) })

  if (polLoading || compLoading) return <PageLoader />

  const openIssues = compliance?.filter(c => c.status !== 'resolved').length || 0
  const overdueIssues = compliance?.filter(c => c.status === 'overdue').length || 0
  const acknowledgedPolicies = policies?.filter(p => p.acknowledged_by_me).length || 0

  const tabs = ['compliance', 'policies', 'audits']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Governance Module</h1>
          <p className="page-subtitle">Policies, compliance issues, and audit management</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Open Issues</div>
          <div className="stat-value" style={{ color: openIssues > 0 ? '#ef4444' : 'var(--primary)' }}>{openIssues}</div>
          <div className="stat-sub">Require resolution</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue Issues</div>
          <div className="stat-value" style={{ color: overdueIssues > 0 ? '#ef4444' : 'var(--primary)' }}>{overdueIssues}</div>
          <div className="stat-sub">Past due date</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Policies</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{policies?.length || 0}</div>
          <div className="stat-sub">Policies in force</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">My Policy Acknowledgements</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{acknowledgedPolicies}/{policies?.length || 0}</div>
          <div className="stat-sub">Policies acknowledged</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'var(--surface-2)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'Inter', fontWeight: 500, fontSize: 13, textTransform: 'capitalize',
            background: activeTab === t ? 'var(--primary)' : 'transparent',
            color: activeTab === t ? 'white' : 'var(--text-muted)',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {activeTab === 'compliance' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins', fontWeight: 600 }}>Compliance Issues</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Owner</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {compliance?.map(issue => {
                  const sev = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.low
                  const stat = STATUS_CONFIG[issue.status] || STATUS_CONFIG.open
                  const isOverdue = issue.status === 'overdue'
                  return (
                    <tr key={issue.id} style={{ background: isOverdue ? 'rgba(239,68,68,0.04)' : undefined }}>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: 260 }}>{issue.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{issue.description?.substring(0, 60)}...</div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: sev.bg, color: sev.color }}>{issue.severity}</span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{issue.owner_name || '—'}</td>
                      <td style={{ color: isOverdue ? '#ef4444' : 'var(--text-secondary)', fontSize: 13 }}>
                        {isOverdue && <Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                        {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: 12, fontWeight: 600, color: stat.color }}>{stat.label}</span>
                      </td>
                      <td>
                        {issue.status !== 'resolved' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => updateMutation.mutate({ id: issue.id, data: { status: issue.status === 'open' ? 'in_progress' : 'resolved' } })}>
                            {issue.status === 'open' ? 'Start' : 'Resolve'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {policies?.map(policy => (
            <div key={policy.id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: policy.acknowledged_by_me ? 'rgba(16,185,129,0.15)' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle size={18} color={policy.acknowledged_by_me ? 'var(--primary)' : 'var(--text-muted)'} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{policy.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  Category: {policy.category} · Version {policy.version} · Effective {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{policy.content?.substring(0, 150)}...</p>
              </div>
              {!policy.acknowledged_by_me && (
                <button className="btn btn-primary btn-sm" onClick={() => ackMutation.mutate(policy.id)} disabled={ackMutation.isPending}>
                  Acknowledge
                </button>
              )}
              {policy.acknowledged_by_me && <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Acknowledged</span>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'audits' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins', fontWeight: 600 }}>Audit Log</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Audit Title</th><th>Auditor</th><th>Date</th><th>Status</th><th>Risk Level</th><th>Findings</th></tr>
              </thead>
              <tbody>
                {audits?.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.auditor}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.audit_date ? new Date(a.audit_date).toLocaleDateString() : '—'}</td>
                    <td><span style={{ fontSize: 12, fontWeight: 600, color: a.status === 'completed' ? 'var(--primary)' : '#f59e0b', textTransform: 'capitalize' }}>{a.status}</span></td>
                    <td><span className={`badge badge-${a.risk_level === 'low' ? 'green' : a.risk_level === 'medium' ? 'yellow' : 'red'}`}>{a.risk_level}</span></td>
                    <td style={{ maxWidth: 200, color: 'var(--text-muted)', fontSize: 12 }}>{a.findings?.substring(0, 80) || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
