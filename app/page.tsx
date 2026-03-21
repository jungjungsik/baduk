'use client'

import Link from 'next/link'
import StreakCard from '@/components/ui/StreakCard'
import { useUserStore } from '@/lib/store/userStore'

const LEARNING_PATHS = [
  {
    id: 'basics',
    title: '기초',
    description: '돌 놓기부터 게임 종료까지',
    icon: 'grid_4x4',
    bgColor: 'bg-surface-container-highest',
    iconColor: 'text-primary',
    progress: 64,
    lessonCount: 24,
    href: '/study?category=basics',
    large: true,
  },
  {
    id: 'joseki',
    title: '정석',
    description: '코너 포석의 이론',
    icon: 'psychology',
    bgColor: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
    lessonCount: 40,
    href: '/study?category=joseki',
    large: false,
  },
  {
    id: 'tsumego',
    title: '사활',
    description: '매일 퍼즐',
    icon: 'extension',
    bgColor: 'bg-tertiary-container',
    iconColor: 'text-on-tertiary-container',
    lessonCount: 100,
    href: '/puzzle',
    large: false,
  },
]

const RECENT_RECORDS = [
  {
    boardSize: '9×9',
    opponent: 'AI (레벨 3)',
    result: '4.5점 승',
    isDark: true,
  },
  {
    boardSize: '13×13',
    opponent: '포석 이론',
    result: '진행 중',
    isDark: false,
  },
]

export default function HomePage() {
  const { streak, xp } = useUserStore()

  return (
    <div className="min-h-screen bg-surface">
      {/* 헤더 */}
      <header className="lg:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-on-surface flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-surface" />
            </div>
            <span className="font-headline font-black text-lg tracking-tight">흑백</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary-container overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-on-secondary-container text-xl">person</span>
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-4xl mx-auto px-5 space-y-8 pb-8 pt-6 lg:pt-10">
        {/* 피처드 카드 */}
        <section className="-mx-2">
          <div className="relative rounded-[2rem] overflow-hidden min-h-[300px] lg:min-h-[380px] wood-texture flex flex-col justify-end p-7 shadow-lg">
            {/* 장식용 돌 */}
            <div className="absolute top-6 right-6" style={{ width: '80px', height: '80px' }}>
              {/* 흑돌 (뒤) */}
              <div
                className="absolute rounded-full shadow-xl"
                style={{
                  width: '52px',
                  height: '52px',
                  background: 'radial-gradient(circle at 35% 35%, #555, #111)',
                  top: 0,
                  right: 0,
                }}
              />
              {/* 백돌 (앞, 겹침) */}
              <div
                className="absolute rounded-full shadow-lg"
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'radial-gradient(circle at 35% 35%, #fff, #d8d8d8)',
                  border: '1px solid rgba(0,0,0,0.08)',
                  top: '28px',
                  right: '28px',
                }}
              />
            </div>

            {/* 오버레이 그라디언트 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <div className="relative space-y-3 max-w-[75%]">
              <span className="inline-block px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-bold tracking-widest uppercase">
                추천 레슨
              </span>
              <h2 className="font-headline font-extrabold text-2xl leading-tight text-on-surface">
                첫 번째 형태<br />배우기
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                호구(虎口)를 마스터하고 영역을 확보하세요.
              </p>
              <Link
                href="/study"
                className="inline-flex items-center gap-2 font-headline font-bold px-5 py-2.5 rounded-xl text-sm mt-2 active:scale-95 transition-all shadow-md"
                style={{ backgroundColor: '#383831', color: '#fffcf7' }}
              >
                학습 시작
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 스트릭 카드 */}
        <section>
          <StreakCard streak={streak} xp={xp} />
        </section>

        {/* 큐레이티드 경로 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-extrabold text-xl tracking-tight">학습 경로</h3>
            <Link href="/study" className="text-secondary text-xs font-bold font-label border-b border-secondary/30 pb-0.5">
              전체 보기
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 기초 - 큰 카드 */}
            <Link
              href={LEARNING_PATHS[0].href}
              className={`${LEARNING_PATHS[0].bgColor} rounded-3xl p-5 flex flex-col justify-between min-h-[200px] row-span-2 lg:row-span-1 lg:min-h-[240px] active:scale-[0.98] transition-transform`}
            >
              <div className="w-11 h-11 bg-surface-bright rounded-2xl flex items-center justify-center shadow-sm">
                <span className={`material-symbols-outlined ${LEARNING_PATHS[0].iconColor}`}>
                  {LEARNING_PATHS[0].icon}
                </span>
              </div>
              <div className="space-y-2">
                <h4 className="font-headline font-bold text-lg">{LEARNING_PATHS[0].title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{LEARNING_PATHS[0].description}</p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-outline-variant/30 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${LEARNING_PATHS[0].progress}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant">{LEARNING_PATHS[0].progress}%</span>
                </div>
              </div>
            </Link>

            {/* 정석 */}
            <Link
              href={LEARNING_PATHS[1].href}
              className={`${LEARNING_PATHS[1].bgColor} rounded-3xl p-5 flex flex-col justify-between active:scale-[0.98] transition-transform`}
            >
              <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined ${LEARNING_PATHS[1].iconColor}`}>
                  {LEARNING_PATHS[1].icon}
                </span>
                <span className="text-[10px] font-bold text-on-secondary-container/60">
                  {LEARNING_PATHS[1].lessonCount}+ 레슨
                </span>
              </div>
              <h4 className="font-headline font-bold text-lg mt-4">{LEARNING_PATHS[1].title}</h4>
            </Link>

            {/* 사활 */}
            <Link
              href={LEARNING_PATHS[2].href}
              className={`${LEARNING_PATHS[2].bgColor} rounded-3xl p-5 flex flex-col justify-between active:scale-[0.98] transition-transform`}
            >
              <div className="flex justify-between items-start">
                <span className={`material-symbols-outlined ${LEARNING_PATHS[2].iconColor}`}>
                  {LEARNING_PATHS[2].icon}
                </span>
                <span className="text-[10px] font-bold text-on-tertiary-container/60">매일 퀴즈</span>
              </div>
              <h4 className="font-headline font-bold text-lg mt-4">{LEARNING_PATHS[2].title}</h4>
            </Link>
          </div>
        </section>

        {/* 최근 기록 */}
        <section className="space-y-4">
          <h3 className="font-headline font-extrabold text-xl tracking-tight">최근 기록</h3>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
            {RECENT_RECORDS.map((record, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-60 lg:w-auto lg:flex-shrink bg-surface-container rounded-2xl p-4 flex gap-3 items-center"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                    record.isDark
                      ? 'bg-on-surface text-surface'
                      : 'bg-surface-container-highest text-on-surface border border-outline-variant/20'
                  }`}
                >
                  {record.boardSize}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{record.opponent}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{record.result}</p>
                </div>
              </div>
            ))}
            <Link
              href="/play"
              className="flex-shrink-0 w-48 lg:w-auto lg:flex-shrink bg-surface-container-high rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant/40"
            >
              <span className="material-symbols-outlined text-on-surface-variant">add</span>
              <span className="text-xs font-semibold text-on-surface-variant">새 대국</span>
            </Link>
          </div>
        </section>
      </div>

      {/* FAB */}
      <Link
        href="/play"
        className="lg:hidden fixed right-5 bottom-28 w-14 h-14 bg-on-surface text-surface rounded-2xl shadow-xl flex items-center justify-center z-40 active:scale-90 transition-transform"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  )
}
