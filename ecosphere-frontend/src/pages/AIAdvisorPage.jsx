import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Brain, AlertCircle, CheckCircle2, TrendingUp, Star, ChevronRight } from 'lucide-react'
import { aiService } from '../services/ai.service'
import Spinner from '../components/ui/Spinner'

const PRIORITY_CONFIG = {
  Critical: { color: '#ef4444', bg: '#450a0a' },
  High:     { color: '#f59e0b', bg: '#451a03' },
  Medium:   { color: '#3b82f6', bg: '#0c1a3a' },
  Low:      { color: '#64748b', bg: 'var(--surface-3)' },
}

const RATING_CONFIG = {
  Excellent: { color: '#10b981', emoji: '🌟' },
  Good:      { color: '#3b82f6', emoji: '✅' },
  Moderate:  { color: '#f59e0b', emoji: '⚠️' },
  Poor:      { color: '#ef4444', emoji: '❌' },
  Critical:  { color: '#dc2626', emoji: '🚨' },
}

export default function AIAdvisorPage() {
  const [result, setResult] = useState(null)
  const { mutate, isPending, error } = useMutation({
    mutationFn: aiService.runAdvisor,
    onSuccess: (res) => setResult(res.data.data),
  })

  const rating = result?.analysis?.overallRating
  const ratingCfg = RATING_CONFIG[rating] || RATING_CONFIG.Moderate

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">AI ESG Advisor</h1>
          <p className="page-subtitle">Intelligent analysis of your organisation's ESG performance</p>
        </div>
        <button id="run-advisor-btn" className="btn btn-primary btn-lg" onClick={() => mutate()} disabled={isPending}>
          {isPending ? <><Spinner size={16} /> Analysing...</> : <><Brain size={18} /> Run AI Analysis</>}
        </button>
      </div>

      {!result && !isPending && (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Brain size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 22, marginBottom: 12 }}>Your ESG Intelligence Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.7 }}>
            The AI Advisor analyses your live ESG data — carbon emissions, CSR participation, compliance status, and governance metrics — to deliver actionable, prioritised recommendations.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              ['Detect ESG Weaknesses', 'Identifies gaps in Environmental, Social & Governance data'],
              ['Prioritised Recommendations', 'Actions ranked by urgency and business impact'],
              ['Management Insights', 'Strategic intelligence for executive decision-making'],
            ].map(([title, desc]) => (
              <div key={title} style={{ width: 200, textAlign: 'left', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
          {error && (
            <div style={{ marginTop: 24, color: '#ef4444', fontSize: 13 }}>
              Analysis failed: {error.response?.data?.message || 'Please check if the backend is running and OpenAI key is set.'}
            </div>
          )}
        </div>
      )}

      {isPending && (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(16,185,129,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'pulse 2s infinite' }}>
            <Brain size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Analysing your ESG data...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            The AI is reviewing carbon emissions, CSR activities, compliance issues, and governance metrics.
          </p>
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Summary + Rating */}
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '24px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Brain size={22} color="var(--primary)" />
                <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 17 }}>Executive Summary</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: `1px solid ${ratingCfg.color}`, borderRadius: 8, padding: '6px 14px' }}>
                <span>{ratingCfg.emoji}</span>
                <span style={{ fontWeight: 700, color: ratingCfg.color, fontSize: 14 }}>{rating}</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{result.analysis.summary}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Strengths */}
            {result.analysis.strengths?.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <CheckCircle2 size={18} color="var(--primary)" />
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 600 }}>Strengths</h4>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {result.analysis.strengths.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      <ChevronRight size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Problems */}
            {result.analysis.problems?.length > 0 && (
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <AlertCircle size={18} color="#f59e0b" />
                  <h4 style={{ fontFamily: 'Poppins', fontWeight: 600 }}>Issues Identified</h4>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {result.analysis.problems.map((p, i) => (
                    <div key={i} style={{ borderLeft: '3px solid #f59e0b', paddingLeft: 12 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, marginRight: 6 }}>[{p.area}]</span>
                        {p.issue}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.analysis.recommendations?.length > 0 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <TrendingUp size={18} color="var(--primary)" />
                <h4 style={{ fontFamily: 'Poppins', fontWeight: 600 }}>Prioritised Recommendations</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {result.analysis.recommendations.map((r, i) => {
                  const pc = PRIORITY_CONFIG[r.priority] || PRIORITY_CONFIG.Low
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, padding: '16px', background: 'var(--surface-3)', borderRadius: 10, borderLeft: `3px solid ${pc.color}` }}>
                      <div style={{ background: pc.bg, color: pc.color, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, flexShrink: 0, height: 'fit-content', marginTop: 2 }}>
                        {r.priority}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', marginRight: 8 }}>[{r.area}]</span>
                          {r.action}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>{r.detail}</div>
                        <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}>Expected: {r.expectedImpact}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Management Insight */}
          {result.analysis.managementInsight && (
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '20px 24px', display: 'flex', gap: 14 }}>
              <Star size={20} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 6 }}>Management Insight</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{result.analysis.managementInsight}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
