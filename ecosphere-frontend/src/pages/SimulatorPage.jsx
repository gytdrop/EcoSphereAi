import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { FlaskConical, TrendingUp, Leaf, Users, Shield, ArrowRight } from 'lucide-react'
import { aiService } from '../services/ai.service'
import Spinner from '../components/ui/Spinner'

const NumberInput = ({ label, name, value, onChange, unit }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
    <label className="form-label" style={{ flex: 1 }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 100 }}>
      <input 
        type="number" 
        className="form-input" 
        value={value} 
        onChange={(e) => onChange(name, Number(e.target.value))} 
        style={{ padding: '4px 8px', textAlign: 'right' }} 
        min={0}
      />
      <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 24 }}>{unit}</span>
    </div>
  </div>
)

const ScoreDeltaCompact = ({ label, current, predicted, color, icon: Icon }) => {
  const delta = predicted - current
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={14} color={color} />
        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{current}</span>
        <ArrowRight size={12} color="var(--text-muted)" />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{predicted}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: delta >= 0 ? 'var(--primary)' : 'var(--danger)', width: 40, textAlign: 'right' }}>
          {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
        </span>
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

  const handleChange = (name, value) => setInputs((prev) => ({ ...prev, [name]: value }))

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">ESG Score Simulator</h1>
          <p className="page-subtitle">Predict score changes by modelling sustainability initiatives</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 16, alignItems: 'start' }}>
        
        {/* Left Panel: Inputs */}
        <div className="card" style={{ gap: 16 }}>
          <div className="section-title">Simulation Parameters</div>
          
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>Environmental Actions</div>
            <NumberInput label="Trees to Plant" name="treesPlanted" value={inputs.treesPlanted} onChange={handleChange} unit="trees" />
            <NumberInput label="Carbon Reduction" name="carbonReductionPercent" value={inputs.carbonReductionPercent} onChange={handleChange} unit="%" />
            <NumberInput label="Renewable Energy" name="renewableEnergyPercent" value={inputs.renewableEnergyPercent} onChange={handleChange} unit="%" />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>Social Actions</div>
            <NumberInput label="New CSR Activities" name="csrActivitiesAdded" value={inputs.csrActivitiesAdded} onChange={handleChange} unit="qty" />
            <NumberInput label="Training Completion" name="employeeTrainingPercent" value={inputs.employeeTrainingPercent} onChange={handleChange} unit="%" />
            <NumberInput label="Volunteer Hours" name="volunteerHours" value={inputs.volunteerHours} onChange={handleChange} unit="hrs" />
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8, paddingBottom: 4, borderBottom: '1px solid var(--border)' }}>Governance Actions</div>
            <NumberInput label="Resolve Compliance" name="complianceIssuesResolved" value={inputs.complianceIssuesResolved} onChange={handleChange} unit="qty" />
            <NumberInput label="Policy Acknowledgements" name="policiesAcknowledged" value={inputs.policiesAcknowledged} onChange={handleChange} unit="qty" />
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setInputs(DEFAULT_INPUTS); setResult(null) }} style={{ flex: 1 }}>Reset</button>
            <button className="btn btn-primary" onClick={() => mutate()} disabled={isPending} style={{ flex: 2 }}>
              {isPending ? <Spinner size={14} /> : 'Run Simulation'}
            </button>
          </div>
        </div>

        {/* Right Panel: Results */}
        <div className="card" style={{ minHeight: 400 }}>
          <div className="section-title">Simulation Results</div>
          
          {!result && !isPending && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <FlaskConical size={32} style={{ margin: '0 auto 12px' }} />
              <p>Configure parameters on the left and run the simulation to see projected ESG score impacts.</p>
            </div>
          )}

          {isPending && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Spinner size={24} />
              <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Calculating projections...</p>
            </div>
          )}

          {result && (
            <div>
              {/* Scores List */}
              <div style={{ marginBottom: 20 }}>
                <ScoreDeltaCompact label="Overall ESG Score" current={result.current.overall} predicted={result.predicted.overall} color="var(--primary)" icon={TrendingUp} />
                <ScoreDeltaCompact label="Environmental Score" current={result.current.environmental} predicted={result.predicted.environmental} color="var(--primary)" icon={Leaf} />
                <ScoreDeltaCompact label="Social Score" current={result.current.social} predicted={result.predicted.social} color="var(--text-primary)" icon={Users} />
                <ScoreDeltaCompact label="Governance Score" current={result.current.governance} predicted={result.predicted.governance} color="var(--text-primary)" icon={Shield} />
              </div>

              {/* Analysis */}
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Impact Analysis</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                {result.analysis.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  ['Environmental', result.analysis.environmentalAnalysis],
                  ['Social', result.analysis.socialAnalysis],
                  ['Governance', result.analysis.governanceAnalysis]
                ].map(([title, text], i) => (
                  <div key={i} style={{ borderLeft: '2px solid var(--border-strong)', paddingLeft: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{title} Impact</div>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{text}</div>
                  </div>
                ))}
              </div>

              {result.analysis.keyInsight && (
                <div style={{ marginTop: 20, padding: 12, background: 'var(--surface-3)', borderRadius: 6, border: '1px solid var(--border-strong)' }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Key Recommendation</div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{result.analysis.keyInsight}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
