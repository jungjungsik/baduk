'use client'

import { useUserStore } from '@/lib/store/userStore'

export default function ProfilePage() {
  const { nickname, xp, streak, totalGamesPlayed, totalGamesWon, totalPuzzlesSolved } = useUserStore()

  const stats = [
    { label: '총 대국', value: totalGamesPlayed, icon: 'grid_4x4' },
    { label: '승률', value: totalGamesPlayed > 0 ? `${Math.round((totalGamesWon / totalGamesPlayed) * 100)}%` : '-', icon: 'emoji_events' },
    { label: '풀은 퍼즐', value: totalPuzzlesSolved, icon: 'extension' },
    { label: '연속 학습', value: `${streak}일`, icon: 'local_fire_department' },
  ]

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="max-w-lg mx-auto">
          <h1 className="font-headline font-bold text-lg">프로필</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-6">
        <div className="flex items-center gap-4 p-5 bg-surface-container-low rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-secondary-container">person</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl">{nickname}</h2>
            <p className="text-on-surface-variant text-sm">{xp.toLocaleString()} XP 보유</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-surface-container-low rounded-2xl p-4 space-y-2">
              <span className="material-symbols-outlined text-tertiary text-xl">{stat.icon}</span>
              <p className="font-headline font-bold text-2xl">{stat.value}</p>
              <p className="text-on-surface-variant text-xs">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
