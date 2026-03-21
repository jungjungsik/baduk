'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', icon: 'home', label: '홈' },
  { href: '/study', icon: 'auto_stories', label: '스터디' },
  { href: '/puzzle', icon: 'extension', label: '퍼즐' },
  { href: '/play', icon: 'grid_4x4', label: '대국' },
  { href: '/profile', icon: 'person', label: '프로필' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* 모바일: 하단 고정 네비게이션 */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 backdrop-blur-xl rounded-t-3xl shadow-[0_-4px_24px_rgba(56,56,49,0.06)]" style={{ backgroundColor: 'rgba(255,252,247,0.85)' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all duration-200 gap-0.5"
              style={{
                backgroundColor: isActive ? '#f4e3ce' : 'transparent',
                color: isActive ? '#383831' : '#65655c',
              }}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium uppercase tracking-widest font-label">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* 데스크톱: 왼쪽 사이드바 */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 z-50 border-r py-8 px-4 gap-2" style={{ backgroundColor: '#fffcf7', borderColor: '#eae8de' }}>
        {/* 로고 */}
        <div className="flex items-center gap-3 px-4 mb-8">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#383831' }}>
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fffcf7' }} />
          </div>
          <span className="font-headline font-black text-xl tracking-tight" style={{ color: '#383831' }}>흑백</span>
        </div>

        {/* 네비게이션 아이템 */}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-label font-semibold text-sm"
              style={{
                backgroundColor: isActive ? '#f4e3ce' : 'transparent',
                color: isActive ? '#383831' : '#65655c',
              }}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {/* 하단 프로필 */}
        <div className="mt-auto px-4 py-3 rounded-2xl flex items-center gap-3" style={{ backgroundColor: '#f6f4ec' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8e2d6' }}>
            <span className="material-symbols-outlined text-lg" style={{ color: '#555248' }}>person</span>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: '#383831' }}>바둑 입문자</p>
            <p className="text-xs" style={{ color: '#65655c' }}>450 XP</p>
          </div>
        </div>
      </aside>
    </>
  )
}
