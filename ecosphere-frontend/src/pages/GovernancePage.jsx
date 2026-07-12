import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { governanceService } from '../services/governance.service'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'
import Spinner from '../components/ui/Spinner'
import { useState } from 'react'

const SEVERITY_CONFIG = {
  critical: { color: '#FCA5A5', bg: 'rgba(239,68,68,0.10)' },
  high:     { color: '#FCD34D', bg: 'rgba(245,158,11,0.10)' },
  medium:   { color: '#9CA3AF', bg: 'rgba(107,114,128,0.10)' },
  low:      { color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
}

const STATUS_CONFIG = {
  open:        { color: 'var(--warning)', label: 'Open' },
  in_progress: { color: '#9CA3AF',        label: 'In Progress' },
  resolved:    { color: 'var(--primary)', label: 'Resolved' },
  overdue:     { color: 'var(--danger)',  label: 'Overdue' },
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

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <div className="kpi-card" style={{ borderLeft: openIssues > 0 ? '2px solid var(--danger)' : '2px solid var(--primary)' }}>
          <div className="kpi-label">Open Issues</div>
          <div className="kpi-value" style={{ color: openIssues > 0 ? 'var(--danger)' : 'var(--primary)' }}>{openIssues}</div>
          <div className="kpi-sub">Require resolution</div>
        </div>
        <div className="kpi-card" style={{ borderLeft: overdueIssues > 0 ? '2px solid var(--danger)' : '2px solid var(--border)' }}>
          <div className="kpi-label">Overdue Issues</div>
          <div className="kpi-value" style={{ color: overdueIssues > 0 ? 'var(--danger)' : 'var(--primary)' }}>{overdueIssues}</div>
          <div className="kpi-sub">Past due date</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active Policies</div>
          <div className="kpi-value">{policies?.length || 0}</div>
          <div className="kpi-sub">Policies in force</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">My Acknowledgements</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{acknowledgedPolicies}/{policies?.length || 0}</div>
          <div className="kpi-sub">Policies acknowledged</div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button
            key={t}
            className={`tab-btn ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === 'compliance' ? `Compliance Queue${openIssues > 0 ? ` (${openIssues})` : ''}` : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Compliance Tab */}
      {activeTab === 'compliance' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">Compliance Issues</span>
            {overdueIssues > 0 && (
              <span className="badge badge-red"><AlertTriangle size={10} /> {overdueIssues} overdue</span>
            )}
          </div>
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
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12, maxWidth: 260 }}>{issue.title}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{issue.description?.substring(0, 70)}...</div>
                      </td>
                      <td>
                        <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: sev.bg, color: sev.color, textTransform: 'capitalize' }}>
                          {issue.severity}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{issue.owner_name || '—'}</td>
                      <td style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 12 }}>
                        {isOverdue && <Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />}
                        {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 500, color: stat.color }}>{stat.label}</span>
                      </td>
                      <td>
                        {issue.status !== 'resolved' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => updateMutation.mutate({ id: issue.id, data: { status: issue.status === 'open' ? 'in_progress' : 'resolved' } })}
                            disabled={updateMutation.isPending}
                          >
                            {issue.status === 'open' ? 'Start' : 'Resolve'}
                          </button>
                        )}
                        {issue.status === 'resolved' && <span style={{ fontSize: 11, color: 'var(--primary)' }}>✓ Done</span>}
                      </td>
                    </tr>
                  )
                })}
                {(!compliance || compliance.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No compliance issues</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">Active Policies</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{acknowledgedPolicies}/{policies?.length || 0} acknowledged</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Policy Title</th>
                  <th>Category</th>
                  <th>Version</th>
                  <th>Effective Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {policies?.map(policy => (
                  <tr key={policy.id}>
                    <td>
                      <CheckCircle size={14} color={policy.acknowledged_by_me ? 'var(--primary)' : 'var(--surface-4)'} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{policy.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{policy.content?.substring(0, 60)}...</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{policy.category}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>v{policy.version}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                      {policy.effective_date ? new Date(policy.effective_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      {!policy.acknowledged_by_me ? (
                        <button className="btn btn-primary btn-sm" onClick={() => ackMutation.mutate(policy.id)} disabled={ackMutation.isPending}>
                          Acknowledge
                        </button>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--primary)' }}>Acknowledged</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audits Tab */}
      {activeTab === 'audits' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">Audit Log</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Audit Title</th>
                  <th>Auditor</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Risk Level</th>
                  <th>Findings</th>
                </tr>
              </thead>
              <tbody>
                {audits?.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{a.title}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.auditor}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.audit_date ? new Date(a.audit_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 500, color: a.status === 'completed' ? 'var(--primary)' : 'var(--warning)', textTransform: 'capitalize' }}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${a.risk_level === 'low' ? 'green' : a.risk_level === 'medium' ? 'yellow' : 'red'}`} style={{ textTransform: 'capitalize' }}>
                        {a.risk_level}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220, color: 'var(--text-muted)', fontSize: 11 }}>{a.findings?.substring(0, 80) || '—'}</td>
                  </tr>
                ))}
                {(!audits || audits.length === 0) && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No audit records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
