export default function Spinner({ size = 20 }) {
  return (
    <div style={{ width: size, height: size, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  )
}

export function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
      <Spinner size={24} />
      <span>Loading...</span>
    </div>
  )
}
