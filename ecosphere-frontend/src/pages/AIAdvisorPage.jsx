import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Brain, Download, ChevronRight, FileText, BarChart2, AlertCircle } from 'lucide-react'
import { aiService } from '../services/ai.service'
import Spinner from '../components/ui/Spinner'

export default function AIAdvisorPage() {
  const [result, setResult] = useState(null)
  const { mutate, isPending, error } = useMutation({
    mutationFn: aiService.runAdvisor,
    onSuccess: (res) => setResult(res.data.data),
  })

  const rating = result?.analysis?.overallRating || 'Moderate'

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive ESG Report</h1>
          <p className="page-subtitle">AI-generated comprehensive analysis of organisational sustainability</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" disabled={!result}>
            <Download size={14} /> Download PDF
          </button>
          <button id="run-advisor-btn" className="btn btn-primary" onClick={() => mutate()} disabled={isPending}>
            {isPending ? <><Spinner size={14} /> Generating...</> : <><Brain size={14} /> Generate Report</>}
          </button>
        </div>
      </div>

      {!result && !isPending && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', alignItems: 'center' }}>
          <FileText size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>No Report Generated</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: 400, marginBottom: 20 }}>
            Click "Generate Report" to run a comprehensive analysis of current carbon emissions, CSR activities, compliance status, and governance metrics.
          </p>
          {error && (
            <div className="alert alert-danger" style={{ maxWidth: 400 }}>
              Analysis failed: {error.response?.data?.message || 'Please check if the backend is running.'}
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div className="card" style={{ textAlign: 'center', padding: '80px 20px', alignItems: 'center' }}>
          <Spinner size={32} />
          <p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Compiling executive report...</p>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 16 }}>
            {/* Executive Summary */}
            <div className="card">
              <div className="section-title">Executive Summary</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: 13 }}>
                {result.analysis.summary}
              </p>
            </div>

            {/* Risk / Rating */}
            <div className="card">
              <div className="section-title">Overall Assessment</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Rating</div>
                <div style={{ fontSize: 24, color: 'var(--primary)', fontWeight: 500 }}>{rating}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Key Findings (Strengths & Problems merged) */}
            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart2 size={16} /> Key Findings
              </div>
              
              {result.analysis.strengths?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Positive Indicators</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.analysis.strengths.map((s, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <ChevronRight size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.analysis.problems?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Areas of Concern</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.analysis.problems.map((p, i) => (
                      <div key={i} style={{ borderLeft: '2px solid var(--warning)', paddingLeft: 10 }}>
                        <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--text-primary)', marginBottom: 2 }}>
                          {p.area}: {p.issue}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="card">
              <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> Priority Actions
              </div>
              
              {result.analysis.recommendations?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.analysis.recommendations.map((r, i) => (
                    <div key={i} style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontWeight: 500, fontSize: 12, color: 'var(--text-primary)' }}>{r.action}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{r.priority} Priority</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{r.detail}</div>
                      <div style={{ fontSize: 11, color: 'var(--primary)' }}>Impact: {r.expectedImpact}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recommendations available.</div>
              )}
            </div>
          </div>

          {/* Department Insights / Management Insight */}
          {result.analysis.managementInsight && (
            <div className="card">
              <div className="section-title">Department Insights</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {result.analysis.managementInsight}
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
