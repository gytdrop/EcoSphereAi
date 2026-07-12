import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trophy, Zap, Award, Gift, CheckCircle, Play } from 'lucide-react'
import { gamificationService } from '../services/gamification.service'
import { useAuthStore } from '../store/authStore'
import { PageLoader } from '../components/ui/Spinner'

export default function GamificationPage() {
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('challenges')

  const { data: challenges, isLoading } = useQuery({ queryKey: ['challenges'], queryFn: () => gamificationService.getChallenges().then(r => r.data.data) })
  const { data: leaderboard } = useQuery({ queryKey: ['leaderboard'], queryFn: () => gamificationService.getLeaderboard().then(r => r.data.data) })
  const { data: badgesData } = useQuery({ queryKey: ['badges'], queryFn: () => gamificationService.getBadges().then(r => r.data.data) })
  const { data: rewardsData } = useQuery({ queryKey: ['rewards'], queryFn: () => gamificationService.getRewards().then(r => r.data) })

  const joinMutation = useMutation({ mutationFn: gamificationService.joinChallenge, onSuccess: () => qc.invalidateQueries(['challenges']) })
  const completeMutation = useMutation({ mutationFn: gamificationService.completeChallenge, onSuccess: () => { qc.invalidateQueries(['challenges']); qc.invalidateQueries(['leaderboard']); qc.invalidateQueries(['badges']) } })
  const redeemMutation = useMutation({ mutationFn: gamificationService.redeemReward, onSuccess: () => qc.invalidateQueries(['rewards']) })

  if (isLoading) return <PageLoader />

  const myRank = leaderboard?.findIndex(u => u.id === user?.id) + 1
  const myXP = user?.xp || 0
  const earnedBadges = badgesData?.filter(b => b.earned).length || 0

  const tabs = ['challenges', 'leaderboard', 'badges', 'rewards']

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gamification</h1>
          <p className="page-subtitle">Earn XP, unlock badges, and redeem rewards for sustainability actions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ background: 'rgba(16,185,129,0.05)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="stat-label">Your XP</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>{myXP}</div>
          <div className="stat-sub">Experience points earned</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Leaderboard Rank</div>
          <div className="stat-value" style={{ color: '#f59e0b' }}>#{myRank || '—'}</div>
          <div className="stat-sub">Global ranking</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Badges Earned</div>
          <div className="stat-value" style={{ color: '#8b5cf6' }}>{earnedBadges}</div>
          <div className="stat-sub">of {badgesData?.length || 0} total badges</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Challenges</div>
          <div className="stat-value" style={{ color: '#3b82f6' }}>{challenges?.filter(c => !c.my_status).length || 0}</div>
          <div className="stat-sub">Available to join</div>
        </div>
      </div>

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

      {activeTab === 'challenges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {challenges?.map(c => (
            <div key={c.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14 }}>{c.title}</div>
                <div style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--primary)', borderRadius: 6, padding: '2px 10px', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>+{c.xp} XP</div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 14 }}>{c.description}</p>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
                Deadline: {c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!c.my_status && (
                  <button className="btn btn-primary btn-sm" onClick={() => joinMutation.mutate(c.id)} disabled={joinMutation.isPending}>
                    <Play size={12} /> Join Challenge
                  </button>
                )}
                {c.my_status === 'in_progress' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => completeMutation.mutate(c.id)} disabled={completeMutation.isPending}>
                    <CheckCircle size={12} /> Mark Complete
                  </button>
                )}
                {c.my_status === 'completed' && (
                  <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>Completed</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontFamily: 'Poppins', fontWeight: 600 }}>XP Leaderboard</div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Employee</th><th>Department</th><th>XP</th><th>Badges</th><th>Challenges</th></tr>
              </thead>
              <tbody>
                {leaderboard?.map((u, i) => (
                  <tr key={u.id} style={{ background: u.id === user?.id ? 'rgba(16,185,129,0.06)' : undefined }}>
                    <td>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#c2882a' : 'var(--surface-3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 12, color: i < 3 ? 'white' : 'var(--text-muted)',
                      }}>{i + 1}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: u.id === user?.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {u.name} {u.id === user?.id && <span style={{ fontSize: 11 }}>(You)</span>}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.department}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{u.xp}</td>
                    <td>{u.badge_count}</td>
                    <td>{u.challenges_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {badgesData?.map(b => (
            <div key={b.id} className="card" style={{
              textAlign: 'center',
              opacity: b.earned ? 1 : 0.45,
              borderColor: b.earned ? 'rgba(16,185,129,0.3)' : 'var(--border)',
              background: b.earned ? 'rgba(16,185,129,0.05)' : 'var(--surface-2)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>
                {b.earned ? '🏅' : '🔒'}
              </div>
              <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 6 }}>{b.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{b.description}</div>
              {b.xp_threshold && <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 8, fontWeight: 600 }}>Requires {b.xp_threshold} XP</div>}
              {b.earned && <div style={{ fontSize: 11, color: 'var(--primary)', marginTop: 6 }}>Earned {new Date(b.earned_at).toLocaleDateString()}</div>}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'rewards' && (
        <div>
          <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="var(--primary)" />
            <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Your XP Balance: {rewardsData?.userXP || 0} points</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {rewardsData?.data?.map(r => {
              const canRedeem = (rewardsData?.userXP || 0) >= r.points_required
              return (
                <div key={r.id} className="card">
                  <div style={{ fontFamily: 'Poppins', fontWeight: 600, marginBottom: 6 }}>{r.title}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.4 }}>{r.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 18 }}>{r.points_required} XP</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.stock} left</div>
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: 12 }}
                    onClick={() => redeemMutation.mutate(r.id)}
                    disabled={!canRedeem || redeemMutation.isPending}
                  >
                    <Gift size={12} /> {canRedeem ? 'Redeem' : `Need ${r.points_required - rewardsData?.userXP} more XP`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

