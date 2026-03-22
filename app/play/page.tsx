import Link from 'next/link'

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3 max-w-lg lg:max-w-4xl mx-auto">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-lg">대국</h1>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-2xl mx-auto px-5 py-8 space-y-4">
        <div>
          <h2 className="font-headline font-extrabold text-2xl mb-1">게임 선택</h2>
          <p className="text-on-surface-variant text-sm mb-6">어떤 게임을 두실 건가요?</p>
        </div>

        <Link href="/play/baduk" className="flex items-center gap-5 p-6 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.98]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#f4e3ce' }}>
            <span className="material-symbols-outlined text-3xl" style={{ color: '#383831' }}>grid_4x4</span>
          </div>
          <div className="flex-1">
            <p className="font-headline font-bold text-lg">바둑</p>
            <p className="text-sm text-on-surface-variant">집과 돌로 승패를 겨루는 전략 보드게임</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </Link>

        <Link href="/play/omok" className="flex items-center gap-5 p-6 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.98]">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#e8e2d6' }}>
            <span className="material-symbols-outlined text-3xl" style={{ color: '#383831' }}>apps</span>
          </div>
          <div className="flex-1">
            <p className="font-headline font-bold text-lg">오목</p>
            <p className="text-sm text-on-surface-variant">가로·세로·대각선으로 5목을 먼저 만들면 승리</p>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </Link>
      </div>
    </div>
  )
}
