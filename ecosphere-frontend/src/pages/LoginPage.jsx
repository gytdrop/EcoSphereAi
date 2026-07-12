import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Eye, EyeOff, Leaf } from 'lucide-react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@ecosphere.ai')
  const [password, setPassword] = useState('password123')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authService.login(email, password)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-10%',
        width: 500, height: 500,
        background: 'rgba(16,185,129,0.07)',
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 400, height: 400,
        background: 'rgba(16,185,129,0.05)',
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />

      <div style={{ display: 'flex', width: '100%', maxWidth: 900, gap: 0, borderRadius: 20, overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}>
        {/* Left panel */}
        <div style={{
          flex: 1, background: 'rgba(16,185,129,0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(16,185,129,0.2)',
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
              <div style={{ width: 44, height: 44, background: 'var(--primary)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sprout size={24} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: 20, color: 'white' }}>EcoSphere AI</div>
                <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.08em' }}>INTELLIGENT ESG PLATFORM</div>
              </div>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 16 }}>
              Transforming ESG<br />Reporting into<br /><span style={{ color: 'var(--primary-light)' }}>Intelligent Decisions</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7 }}>
              Enterprise-grade ESG Management with AI-powered advisory, predictive scoring, and compliance automation.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['AI ESG Advisor', 'Intelligent sustainability recommendations'],
              ['Smart Score Simulator', 'Predict impact before you act'],
              ['Real-time Compliance', 'Never miss a deadline again'],
            ].map(([title, sub]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Leaf size={14} color="var(--primary)" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — login form */}
        <div style={{
          width: 400,
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          padding: '48px 40px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Sign In</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 32 }}>
            Access your ESG management dashboard
          </p>

          {error && (
            <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '12px 16px', borderRadius: 8, fontSize: 13, marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
              {loading ? <Spinner size={16} /> : 'Sign In to EcoSphere'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '16px', background: 'var(--surface-3)', borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 6 }}>DEMO CREDENTIALS</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>admin@ecosphere.ai / password123</div>
          </div>
        </div>
      </div>
    </div>
  )
}
