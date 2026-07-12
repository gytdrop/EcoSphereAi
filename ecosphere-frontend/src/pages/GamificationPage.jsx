import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trophy, Zap, Gift, CheckCircle, Play, Lock } from 'lucide-react'
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

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 14 }}>
        <div className="kpi-card" style={{ borderLeft: '2px solid var(--primary)' }}>
          <div className="kpi-label">Your XP Balance</div>
          <div className="kpi-value" style={{ color: 'var(--primary)' }}>{myXP}</div>
          <div className="kpi-sub">Experience points earned</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Leaderboard Rank</div>
          <div className="kpi-value" style={{ color: myRank === 1 ? '#FCD34D' : 'var(--text-primary)' }}>#{myRank || '—'}</div>
          <div className="kpi-sub">Global ranking</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Badges Earned</div>
          <div className="kpi-value">{earnedBadges}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)' }}>/{badgesData?.length || 0}</span></div>
          <div className="kpi-sub">Total achievement badges</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Available Challenges</div>
          <div className="kpi-value">{challenges?.filter(c => !c.my_status).length || 0}</div>
          <div className="kpi-sub">Ready to join</div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="tab-bar">
        {tabs.map(t => (
          <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Challenges Table */}
      {activeTab === 'challenges' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">ESG Challenges</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{challenges?.filter(c => c.my_status === 'in_progress').length || 0} in progress</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Challenge</th>
                  <th>XP Reward</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {challenges?.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{c.description?.substring(0, 70)}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 500, color: 'var(--primary)', fontSize: 12 }}>+{c.xp} XP</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {!c.my_status && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Not Joined</span>}
                      {c.my_status === 'in_progress' && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--warning)' }}>In Progress</span>}
                      {c.my_status === 'completed' && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--primary)' }}>Completed</span>}
                    </td>
                    <td>
                      {!c.my_status && (
                        <button className="btn btn-primary btn-sm" onClick={() => joinMutation.mutate(c.id)} disabled={joinMutation.isPending}>
                          <Play size={11} /> Join
                        </button>
                      )}
                      {c.my_status === 'in_progress' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => completeMutation.mutate(c.id)} disabled={completeMutation.isPending}>
                          <CheckCircle size={11} /> Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {(!challenges || challenges.length === 0) && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No challenges available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {activeTab === 'leaderboard' && (
        <div className="card" style={{ padding: 0 }}>
          <div className="toolbar">
            <span className="toolbar-title">XP Leaderboard</span>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Employee</th>
                  <th>Department</th>
                  <th style={{ textAlign: 'right' }}>XP</th>
                  <th style={{ textAlign: 'center' }}>Badges</th>
                  <th style={{ textAlign: 'center' }}>Activities</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard?.map((u, i) => (
                  <tr key={u.id} style={{ background: u.id === user?.id ? 'rgba(34,197,94,0.05)' : undefined }}>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, borderRadius: 4, fontSize: 10, fontWeight: 500,
                        background: i === 0 ? 'rgba(245,158,11,0.15)' : i === 1 ? 'rgba(156,163,175,0.15)' : 'var(--surface-3)',
                        color: i < 2 ? (i === 0 ? '#FCD34D' : '#9CA3AF') : 'var(--text-muted)',
                      }}>{i + 1}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: u.id === user?.id ? 500 : 500, color: u.id === user?.id ? 'var(--primary)' : 'var(--text-primary)', fontSize: 12 }}>
                        {u.name} {u.id === user?.id && <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--primary)' }}>(You)</span>}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{u.department}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--primary)', fontSize: 13 }}>{u.xp}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{u.badge_count}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{u.challenges_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Badges Grid */}
      {activeTab === 'badges' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
            {badgesData?.map(b => (
              <div key={b.id} className="card" style={{
                opacity: b.earned ? 1 : 0.5,
                borderLeft: b.earned ? '2px solid var(--primary)' : '2px solid var(--border)',
                padding: '12px 14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  {b.earned
                    ? <Trophy size={14} color="var(--primary)" />
                    : <Lock size={13} color="var(--text-muted)" />
                  }
                  <div style={{ fontWeight: 500, fontSize: 12, color: b.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}>{b.name}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 4 }}>{b.description}</div>
                {b.xp_threshold && <div style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 500 }}>Requires {b.xp_threshold} XP</div>}
                {b.earned && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Earned {new Date(b.earned_at).toLocaleDateString()}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards */}
      {activeTab === 'rewards' && (
        <div>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={14} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary)' }}>XP Balance: {rewardsData?.userXP || 0} points</span>
          </div>
          <div className="card" style={{ padding: 0 }}>
            <div className="toolbar">
              <span className="toolbar-title">Available Rewards</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Reward</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'center' }}>XP Required</th>
                    <th style={{ textAlign: 'center' }}>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rewardsData?.data?.map(r => {
                    const canRedeem = (rewardsData?.userXP || 0) >= r.points_required
                    return (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 12 }}>{r.title}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 11, maxWidth: 200 }}>{r.description}</td>
                        <td style={{ textAlign: 'center', fontWeight: 500, color: canRedeem ? 'var(--primary)' : 'var(--text-muted)', fontSize: 12 }}>{r.points_required}</td>
                        <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{r.stock}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${canRedeem ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => redeemMutation.mutate(r.id)}
                            disabled={!canRedeem || redeemMutation.isPending}
                          >
                            <Gift size={11} />
                            {canRedeem ? 'Redeem' : `${r.points_required - (rewardsData?.userXP || 0)} more XP`}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {(!rewardsData?.data || rewardsData.data.length === 0) && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>No rewards available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
