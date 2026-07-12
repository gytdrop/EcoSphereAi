import React from 'react'
import Spinner from './Spinner'

export const Form = ({ onSubmit, children, className, ...props }) => (
  <form 
    onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} 
    className={className} 
    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    {...props}
  >
    {children}
  </form>
)

export const FormGroup = ({ label, error, children, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    {label && (
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
        {label} {required && <span style={{ color: 'var(--danger)' }}>*</span>}
      </label>
    )}
    {children}
    {error && <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '2px' }}>{error}</span>}
  </div>
)

export const Input = React.forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={className}
    style={{
      padding: '8px 12px',
      fontSize: '13px',
      border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      outline: 'none',
      transition: 'border-color 0.2s',
      width: '100%',
      ...props.style
    }}
    onFocus={(e) => { if (!error) e.target.style.borderColor = 'var(--primary-light)' }}
    onBlur={(e) => { if (!error) e.target.style.borderColor = 'var(--border)' }}
    {...props}
  />
))

export const Select = React.forwardRef(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={className}
    style={{
      padding: '8px 12px',
      fontSize: '13px',
      border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface)',
      color: 'var(--text-primary)',
      outline: 'none',
      width: '100%',
      ...props.style
    }}
    {...props}
  >
    {children}
  </select>
))

export const FormActions = ({ children }) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
    {children}
  </div>
)

export const SubmitButton = ({ isPending, children, ...props }) => (
  <button 
    type="submit" 
    className="btn btn-primary" 
    disabled={isPending} 
    {...props}
  >
    {isPending ? <><Spinner size={14} /> Processing...</> : children}
  </button>
)
