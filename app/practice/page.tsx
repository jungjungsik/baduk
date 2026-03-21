'use client'

import Link from 'next/link'
import { LESSONS } from '@/lib/lessons/data'
import { useUserStore } from '@/lib/store/userStore'

export default function PracticePage() {
  const completedLessons = useUserStore((s) => s.completedLessons)

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="max-w-lg mx-auto">
          <h1 className="font-headline font-bold text-lg">연습</h1>
          <p className="text-xs text-on-surface-variant mt-0.5">단계별 레슨으로 바둑을 배워보세요</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-3">
        {LESSONS.map((lesson) => {
          const isDone = completedLessons.includes(lesson.id)
          return (
            <Link
              key={lesson.id}
              href={`/practice/${lesson.id}`}
              className="flex items-center gap-4 p-4 bg-surface-container-low rounded-2xl active:scale-[0.98] transition-transform"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: isDone ? '#d4edda' : '#f4e3ce' }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: isDone ? '#2e7d32' : '#6f6252' }}
                >
                  {isDone ? 'check_circle' : 'auto_stories'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wide">
                    {lesson.categoryLabel}
                  </span>
                  {isDone && (
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#2e7d32' }}>
                      완료
                    </span>
                  )}
                </div>
                <p className="font-bold text-sm truncate">{lesson.title}</p>
                <p className="text-xs text-on-surface-variant">
                  {lesson.duration} · +{lesson.xpReward} XP
                </p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
