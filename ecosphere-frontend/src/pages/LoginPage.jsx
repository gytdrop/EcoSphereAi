import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, Eye, EyeOff } from 'lucide-react'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../store/authStore'
import Spinner from '../components/ui/Spinner'
import WebGLBackground from '../components/ui/WebGLBackground'
import MagneticButton from '../components/ui/MagneticButton'
import { gsap } from 'gsap'

export default function LoginPage() {
  const [email, setEmail] = useState('admin@eco.com')
  const [password, setPassword] = useState('admin123')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const formRef = useRef(null)
  const brandRef = useRef(null)

  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(brandRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    )

    tl.fromTo(formRef.current.children,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
      "-=0.4"
    )
  }, [])

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
      display: 'flex',
      alignItems: 'stretch',
      position: 'relative',
    }}>
      {/* Background WebGL Component */}
      <WebGLBackground />

      {/* Left panel - Glassmorphism brand */}
      <div style={{
        flex: 1,
        padding: '48px 52px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'none'
      }}>
        <div ref={brandRef}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{ 
              width: 40, height: 40, 
              background: 'rgba(0,0,0,0.1)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 12, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(0,0,0,0.2)'
            }}>
              <Sprout size={20} color="#111827" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>ECOSPHERE</div>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Enterprise Studio</div>
            </div>
          </div>

          <h1 style={{ 
            fontSize: 56, 
            fontWeight: 400, 
            color: 'var(--text-primary)', 
            lineHeight: 1.1, 
            marginBottom: 24,
            letterSpacing: '-0.03em'
          }}>
            Shaping the<br />sustainable<br />future.
          </h1>
          <p style={{ 
            color: 'rgba(0,0,0,0.7)', 
            fontSize: 16, 
            lineHeight: 1.6, 
            maxWidth: 340,
            fontWeight: 300
          }}>
            The premier AI-driven ESG advisory and management platform. Build, track, and lead environmental governance.
          </p>
        </div>

        <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Version 2.0 · Enterprise Edition
        </div>
      </div>

      {/* Right login form - Premium card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 40px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: 400,
          background: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '40px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
        }}>
          <div ref={formRef} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 500, marginBottom: 8, color: 'var(--text-primary)' }}>Access Portal</h2>
              <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: 14 }}>
                Enter your credentials to continue
              </p>
            </div>

            {error && (
              <div style={{ 
                background: 'rgba(248,113,113,0.1)', 
                border: '1px solid rgba(248,113,113,0.2)', 
                color: '#F87171',
                padding: '12px 16px',
                borderRadius: 8,
                fontSize: 13
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={{
                    background: 'rgba(0,0,0,0.05)',
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    color: '#111827',
                    padding: '12px 16px',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.3)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    style={{
                      width: '100%',
                      background: 'rgba(0,0,0,0.05)',
                      border: '1px solid var(--border)',
                      borderRadius: 12,
                      color: '#111827',
                      padding: '12px 48px 12px 16px',
                      fontSize: 14,
                      outline: 'none',
                      transition: 'all 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.3)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(0,0,0,0.1)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.5)',
                      display: 'flex', alignItems: 'center',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#111827'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(0,0,0,0.5)'}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <MagneticButton
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{ 
                  marginTop: 12, 
                  padding: '14px', 
                  fontSize: 14,
                  background: '#111827',
                  color: '#000000',
                  borderRadius: 12,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                {loading ? <Spinner size={16} /> : 'Enter Portal'}
              </MagneticButton>
            </form>

            <div style={{ marginTop: 8, textAlign: 'center', fontSize: 12, color: 'rgba(0,0,0,0.4)' }}>
              Demo access: admin@eco.com / admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
