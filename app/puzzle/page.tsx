'use client'

import Link from 'next/link'
import { useUserStore } from '@/lib/store/userStore'
import { PUZZLES_BY_LEVEL } from '@/lib/puzzles/data'
import { PuzzleLevel } from '@/lib/puzzles/types'
import { useState } from 'react'

const LEVEL_TABS: { key: PuzzleLevel; label: string; color: string }[] = [
  { key: 'beginner', label: '입문', color: '#f4e3ce' },
  { key: 'elementary', label: '초급', color: '#e8e2d6' },
  { key: 'intermediate', label: '중급', color: '#eae8de' },
]

export default function PuzzlePage() {
  const { completedPuzzles } = useUserStore()
  const [activeLevel, setActiveLevel] = useState<PuzzleLevel>('beginner')
  const puzzles = PUZZLES_BY_LEVEL[activeLevel]

  const totalSolved = completedPuzzles.length
  const totalPuzzles = Object.values(PUZZLES_BY_LEVEL).flat().length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffcf7' }}>
      {/* 헤더 */}
      <header className="lg:hidden sticky top-0 z-40 backdrop-blur-md px-5 py-3 border-b" style={{ backgroundColor: 'rgba(255,252,247,0.9)', borderColor: '#eae8de' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="font-headline font-bold text-lg">사활 퍼즐</h1>
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#6f6252' }}>
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>extension</span>
            {totalSolved} / {totalPuzzles}
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* 상단 타이틀 (데스크톱) */}
        <div className="hidden lg:block space-y-1">
          <h1 className="font-headline font-extrabold text-3xl">사활 퍼즐</h1>
          <p className="text-sm" style={{ color: '#65655c' }}>
            풀은 문제: {totalSolved} / {totalPuzzles}
          </p>
        </div>

        {/* 전체 진행 바 */}
        <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: '#f6f4ec' }}>
          <div className="flex justify-between text-sm">
            <span className="font-bold">전체 진행도</span>
            <span className="font-bold" style={{ color: '#6f6252' }}>
              {totalPuzzles > 0 ? Math.round((totalSolved / totalPuzzles) * 100) : 0}%
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#eae8de' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalPuzzles > 0 ? (totalSolved / totalPuzzles) * 100 : 0}%`,
                backgroundColor: '#6f6252',
              }}
            />
          </div>
        </div>

        {/* 레벨 탭 */}
        <div className="flex gap-2">
          {LEVEL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveLevel(tab.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: activeLevel === tab.key ? '#383831' : tab.color,
                color: activeLevel === tab.key ? '#fffcf7' : '#383831',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 문제 목록 */}
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
          {puzzles.map((puzzle, index) => {
            const isSolved = completedPuzzles.includes(puzzle.id)
            return (
              <Link
                key={puzzle.id}
                href={`/puzzle/${puzzle.id}`}
                className="flex items-center gap-4 p-4 rounded-2xl border transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: isSolved ? '#f0eee5' : '#ffffff',
                  borderColor: isSolved ? '#babab0' : '#eae8de',
                }}
              >
                {/* 번호/완료 뱃지 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                  style={{
                    backgroundColor: isSolved ? '#6f6252' : '#f4e3ce',
                    color: isSolved ? '#ffffff' : '#5d5242',
                  }}
                >
                  {isSolved ? (
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}
                    >
                      {puzzle.objectiveLabel}
                    </span>
                  </div>
                  <p className="font-bold text-sm">{puzzle.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#65655c' }}>
                    {puzzle.description}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: '#6f6252' }}>+{puzzle.xpReward} XP</span>
                  <span className="material-symbols-outlined text-sm" style={{ color: '#babab0' }}>chevron_right</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
