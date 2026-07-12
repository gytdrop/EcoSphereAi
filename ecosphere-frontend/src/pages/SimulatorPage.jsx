import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FlaskConical, ArrowRight, TrendingUp, Leaf, Users, Shield } from 'lucide-react'
import { aiService } from '../services/ai.service'
import Spinner from '../components/ui/Spinner'

const SliderInput = ({ label, name, value, onChange, max, unit, description }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <label className="form-label">{label}</label>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>{value} {unit}</span>
    </div>
    <input type="range" min={0} max={max} value={value} onChange={(e) => onChange(name, Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--primary)' }} />
    {description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{description}</div>}
  </div>
)

const ScoreDelta = ({ label, current, predicted, color, icon: Icon }) => {
  const delta = predicted - current
  return (
    <div className="card" style={{ textAlign: 'center', borderColor: delta > 0 ? 'rgba(16,185,129,0.3)' : 'var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
        <Icon size={16} color={color} />
        <span className="stat-label">{label}</span>
      </div>
      <div style={{ display: 'flex', align: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-muted)' }}>{current}</span>
        <ArrowRight size={18} color="var(--text-muted)" style={{ marginTop: 4 }} />
        <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Poppins' }}>{predicted}</span>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: delta > 0 ? 'var(--primary)' : '#ef4444' }}>
        {delta >= 0 ? '+' : ''}{delta.toFixed(1)} points
      </div>
    </div>
  )
}

const DEFAULT_INPUTS = {
  treesPlanted: 0,
  carbonReductionPercent: 0,
  renewableEnergyPercent: 0,
  csrActivitiesAdded: 0,
  employeeTrainingPercent: 0,
  volunteerHours: 0,
  complianceIssuesResolved: 0,
  policiesAcknowledged: 0,
}

export default function SimulatorPage() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS)
  const [result, setResult] = useState(null)

  const { mutate, isPending } = useMutation({
    mutationFn: () => aiService.runSimulator(inputs),
    onSuccess: (res) => setResult(res.data.data),
  })

  const handleSlider = (name, value) => setInputs((prev) => ({ ...prev, [name]: value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ESG Score Simulator</h1>
          <p className="page-subtitle">Predict your ESG score before implementing changes</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Input Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Leaf size={16} color="var(--primary)" /> Environmental Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SliderInput label="Trees to Plant" name="treesPlanted" value={inputs.treesPlanted} onChange={handleSlider} max={1000} unit="trees" description="Carbon offset via reforestation" />
              <SliderInput label="Carbon Reduction Target" name="carbonReductionPercent" value={inputs.carbonReductionPercent} onChange={handleSlider} max={100} unit="%" description="Planned CO₂ reduction vs current" />
              <SliderInput label="Renewable Energy Increase" name="renewableEnergyPercent" value={inputs.renewableEnergyPercent} onChange={handleSlider} max={100} unit="%" description="Switch to renewable sources" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={16} color="#3b82f6" /> Social Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SliderInput label="New CSR Activities" name="csrActivitiesAdded" value={inputs.csrActivitiesAdded} onChange={handleSlider} max={20} unit="activities" />
              <SliderInput label="Training Completion Target" name="employeeTrainingPercent" value={inputs.employeeTrainingPercent} onChange={handleSlider} max={100} unit="%" description="Planned training completion rate" />
              <SliderInput label="Volunteer Hours Committed" name="volunteerHours" value={inputs.volunteerHours} onChange={handleSlider} max={1000} unit="hrs" />
            </div>
          </div>

          <div className="card">
            <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color="#8b5cf6" /> Governance Actions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SliderInput label="Compliance Issues to Resolve" name="complianceIssuesResolved" value={inputs.complianceIssuesResolved} onChange={handleSlider} max={20} unit="issues" description="High impact on governance score" />
              <SliderInput label="Policy Acknowledgements" name="policiesAcknowledged" value={inputs.policiesAcknowledged} onChange={handleSlider} max={50} unit="employees" />
            </div>
          </div>

          <button id="run-simulator-btn" className="btn btn-primary btn-lg" onClick={() => mutate()} disabled={isPending} style={{ width: '100%' }}>
            {isPending ? <><Spinner size={16} /> Simulating...</> : <><FlaskConical size={18} /> Run Simulation</>}
          </button>
          <button className="btn btn-ghost" onClick={() => { setInputs(DEFAULT_INPUTS); setResult(null) }} style={{ width: '100%' }}>
            Reset All
          </button>
        </div>

        {/* Results Panel */}
        <div>
          {!result && !isPending && (
            <div style={{ textAlign: 'center', padding: '60px 40px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <FlaskConical size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 10, color: 'var(--text-secondary)' }}>Configure & Simulate</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.7 }}>
                Adjust the sliders to define your planned sustainability actions, then run the simulation to predict how your ESG scores will change.
              </p>
            </div>
          )}

          {isPending && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 16 }}>
              <Spinner size={40} />
              <p style={{ color: 'var(--text-muted)', marginTop: 20, fontSize: 14 }}>Running simulation...</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Score comparison grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <ScoreDelta label="Overall ESG" current={result.current.overall} predicted={result.predicted.overall} color="var(--primary)" icon={TrendingUp} />
                <ScoreDelta label="Environmental" current={result.current.environmental} predicted={result.predicted.environmental} color="var(--primary)" icon={Leaf} />
                <ScoreDelta label="Social" current={result.current.social} predicted={result.predicted.social} color="#3b82f6" icon={Users} />
                <ScoreDelta label="Governance" current={result.current.governance} predicted={result.predicted.governance} color="#8b5cf6" icon={Shield} />
              </div>

              {/* AI Analysis */}
              <div className="card" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 16 }}>Simulation Analysis</div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>{result.analysis.summary}</p>
                {[
                  ['Environmental Impact', result.analysis.environmentalAnalysis, 'var(--primary)'],
                  ['Social Impact', result.analysis.socialAnalysis, '#3b82f6'],
                  ['Governance Impact', result.analysis.governanceAnalysis, '#8b5cf6'],
                ].map(([title, text, color]) => (
                  <div key={title} style={{ borderLeft: `3px solid ${color}`, paddingLeft: 14, marginBottom: 14 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color, marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</div>
                  </div>
                ))}
              </div>

              {result.analysis.keyInsight && (
                <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'Poppins', fontWeight: 600, color: '#8b5cf6', marginBottom: 8 }}>Highest Impact Action</div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{result.analysis.keyInsight}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
