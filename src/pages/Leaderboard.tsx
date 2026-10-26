import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy, Medal, Award, Star, Upload, Crown, TrendingUp,
  ChevronUp, Filter
} from 'lucide-react'
import { MOCK_REWARDS } from '@/data/mockData'
import { getInitials } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { getLiveLeaderboard, deductCredits } from '@/lib/dataStore'
import type { FilterPeriod, LeaderboardEntry } from '@/types'
import toast from 'react-hot-toast'

const BADGE_COLORS: Record<string, string> = {
  '🏆 Top Contributor': 'bg-amber-50 text-amber-700 border-amber-200',
  '⭐ Star Contributor': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  '🎖 Rising Star': 'bg-violet-50 text-violet-700 border-violet-200',
  '📚 Scholar': 'bg-teal-50 text-teal-700 border-teal-200',
  '📝 Contributor': 'bg-slate-50 text-slate-600 border-slate-200',
  '🌱 Newcomer': 'bg-green-50 text-green-700 border-green-200',
}

const AVATAR_COLORS = [
  'bg-amber-500', 'bg-indigo-500', 'bg-violet-500',
  'bg-teal-500', 'bg-pink-500', 'bg-blue-500',
]

function PodiumCard({ entry, size = 'md' }: { entry: LeaderboardEntry; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'p-4', md: 'p-5', lg: 'p-6' }
  const rankIcons = [null, <Crown size={20} className="text-amber-500" />, <Medal size={18} className="text-slate-400" />, <Award size={18} className="text-amber-700" />]
  const rankGradients = ['', 'from-amber-50 to-amber-100 border-amber-200', 'from-slate-50 to-slate-100 border-slate-200', 'from-orange-50 to-amber-50 border-orange-200']

  return (
    <div className={`card ${sizeClasses[size]} bg-gradient-to-b ${rankGradients[entry.rank] || ''} flex flex-col items-center text-center gap-3`}>
      <div className="relative">
        <div className={`w-14 h-14 rounded-full ${AVATAR_COLORS[(entry.rank - 1) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
          {getInitials(entry.display_name)}
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center text-xs font-bold text-slate-700 border border-slate-200">
          {entry.rank}
        </div>
      </div>
      <div>
        <p className="font-bold text-slate-800 text-sm">{entry.display_name}</p>
        <p className="text-xs text-slate-500">{entry.branch}</p>
      </div>
      <div className="flex items-center gap-1 text-indigo-700 font-bold text-lg">
        <Star size={16} className="text-indigo-500" />
        {entry.sync_credits.toLocaleString()}
      </div>
      <div className="text-xs text-slate-500">{entry.approved_uploads} uploads</div>
      {rankIcons[entry.rank]}
      {entry.badge && (
        <span className={`badge border ${BADGE_COLORS[entry.badge] || 'bg-slate-50 text-slate-600'} text-[10px]`}>{entry.badge}</span>
      )}
    </div>
  )
}

export default function Leaderboard() {
  const { profile } = useAuth()
  const [period, setPeriod] = useState<FilterPeriod>('all_time')
  const [showRewards, setShowRewards] = useState(false)
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(() => getLiveLeaderboard(profile))

  useEffect(() => {
    function refresh() {
      setLeaderboardData(getLiveLeaderboard(profile))
    }
    refresh()
    window.addEventListener('syncnote:credits_changed', refresh)
    window.addEventListener('syncnote:resources_changed', refresh)
    return () => {
      window.removeEventListener('syncnote:credits_changed', refresh)
      window.removeEventListener('syncnote:resources_changed', refresh)
    }
  }, [profile])

  const top3 = leaderboardData.slice(0, 3)
  const rest = leaderboardData.slice(3)
  const currentUser = leaderboardData.find(e => e.is_current_user)

  function handleRedeem(reward: typeof MOCK_REWARDS[0]) {
    const success = deductCredits(reward.credit_cost)
    if (success) {
      toast.success(`Successfully redeemed ${reward.title}! 🎉`)
    } else {
      toast.error('Not enough SyncCredits to redeem this perk.')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <nav className="text-xs text-slate-400 mb-2 flex items-center gap-1">
          <Link to="/dashboard" className="hover:text-indigo-600">Home</Link>
          <span>/</span>
          <span className="text-slate-600">Community</span>
          <span>/</span>
          <span className="text-slate-700">Leaderboard</span>
        </nav>
        <h1 className="text-2xl font-bold text-slate-800">Academic Contributors & Community Leaderboard</h1>
        <p className="text-sm text-slate-500 mt-1">Recognizing students who share knowledge and drive learning forward.</p>
      </div>

      {/* User Status Bar */}
      <div className="rounded-xl p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
            {currentUser?.rank}
          </div>
          <div>
            <p className="text-xs text-white/70">Your Current Rank</p>
            <p className="font-bold text-lg">#{currentUser?.rank}</p>
          </div>
        </div>
        <div className="w-px h-8 bg-white/20 hidden sm:block" />
        <div className="flex items-center gap-3">
          <Star size={20} className="text-amber-300" />
          <div>
            <p className="text-xs text-white/70">SyncCredits</p>
            <p className="font-bold text-lg">{currentUser?.sync_credits.toLocaleString()}</p>
          </div>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <button onClick={() => setShowRewards(!showRewards)} className="btn bg-white text-indigo-700 hover:bg-indigo-50 btn-sm">
            <Trophy size={14} /> Rewards Store
          </button>
          <Link to="/upload" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20 btn-sm">
            <Upload size={14} /> Upload Notes <span className="text-amber-300 font-bold">+150 Pts</span>
          </Link>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {(['all_time', 'monthly'] as FilterPeriod[]).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${period === p ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300'}`}
          >
            {p === 'all_time' ? 'All Time' : 'This Month'}
          </button>
        ))}
        <button className="btn btn-secondary btn-sm ml-auto flex items-center gap-1">
          <Filter size={13} /> Filter by Branch
        </button>
      </div>

      {/* Podium */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
          <Crown size={16} className="text-amber-500" /> Top 3 Academic Champions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 2nd */}
          <PodiumCard entry={top3[1]} size="md" />
          {/* 1st – highlighted */}
          <div className="relative">
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-amber-500 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-md">#1 Champion</span>
            </div>
            <PodiumCard entry={top3[0]} size="lg" />
          </div>
          {/* 3rd */}
          <PodiumCard entry={top3[2]} size="md" />
        </div>
      </div>

      {/* Rankings Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <TrendingUp size={16} className="text-indigo-500" />
          <h2 className="font-semibold text-slate-700 text-sm">Department Rankings</h2>
          <span className="text-xs text-slate-400 ml-1">(Ranks 4–{leaderboardData.length})</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-semibold">Rank</th>
                <th className="text-left px-4 py-3 font-semibold">Student</th>
                <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">Branch</th>
                <th className="text-right px-4 py-3 font-semibold">Uploads</th>
                <th className="text-right px-4 py-3 font-semibold hidden sm:table-cell">Downloads</th>
                <th className="text-right px-4 py-3 font-semibold">Credits</th>
                <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rest.map(entry => (
                <tr
                  key={entry.user_id}
                  className={`transition-colors hover:bg-slate-50 ${entry.is_current_user ? 'bg-indigo-50/60 border-l-2 border-indigo-500' : ''}`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${entry.is_current_user ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {entry.rank}
                      </span>
                      {entry.rank <= 6 && <ChevronUp size={12} className="text-green-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[(entry.rank - 1) % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {getInitials(entry.display_name)}
                      </div>
                      <div>
                        <p className={`font-semibold text-slate-800 ${entry.is_current_user ? 'text-indigo-700' : ''}`}>
                          {entry.display_name} {entry.is_current_user && <span className="text-indigo-400 text-xs font-normal">(you)</span>}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 hidden md:table-cell text-xs">{entry.branch}</td>
                  <td className="px-4 py-3.5 text-right font-semibold text-slate-700">{entry.approved_uploads}</td>
                  <td className="px-4 py-3.5 text-right text-slate-500 hidden sm:table-cell">{entry.total_downloads.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-indigo-700">{entry.sync_credits.toLocaleString()}</td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    {entry.badge && <span className={`badge border text-[10px] ${BADGE_COLORS[entry.badge] || 'bg-slate-50 text-slate-600'}`}>{entry.badge}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rewards Store */}
      {showRewards && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> Rewards Store
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {MOCK_REWARDS.map(reward => (
              <div key={reward.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-800 text-sm">{reward.title}</h3>
                  <span className="badge bg-amber-50 text-amber-700 flex-shrink-0">{reward.credit_cost} pts</span>
                </div>
                {reward.description && <p className="text-xs text-slate-500">{reward.description}</p>}
                <button
                  type="button"
                  disabled={!currentUser || currentUser.sync_credits < reward.credit_cost}
                  onClick={() => handleRedeem(reward)}
                  className="btn btn-primary btn-sm w-full"
                >
                  {!currentUser || currentUser.sync_credits < reward.credit_cost ? 'Not enough credits' : 'Redeem'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
