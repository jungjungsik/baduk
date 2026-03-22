import Link from 'next/link'

export default function PlayPage() {
  return (
    <div className="min-h-screen bg-surface pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3 max-w-lg lg:max-w-4xl mx-auto">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-lg">대국</h1>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-2xl mx-auto px-5 py-8">
        <div>
          <h2 className="font-headline font-extrabold text-2xl mb-1">게임 선택</h2>
          <p className="text-on-surface-variant text-sm mb-6">어떤 게임을 두실 건가요?</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/play/baduk" className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.97]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#f4e3ce' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#383831' }}>grid_4x4</span>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-sm">바둑</p>
              <p className="text-xs text-on-surface-variant mt-0.5">집과 돌의 전략 게임</p>
            </div>
          </Link>

          <Link href="/play/omok" className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.97]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#e8e2d6' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#383831' }}>apps</span>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-sm">오목</p>
              <p className="text-xs text-on-surface-variant mt-0.5">5목을 먼저 만들면 승리</p>
            </div>
          </Link>

          <Link href="/play/atari" className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.97]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#fef3c7' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#383831' }}>target</span>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-sm">아타리 바둑</p>
              <p className="text-xs text-on-surface-variant mt-0.5">첫 따냄이 승리</p>
            </div>
          </Link>

          <Link href="/play/reversi" className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-outline-variant/30 bg-surface-container-low hover:border-outline-variant hover:bg-surface-container transition-all active:scale-[0.97]">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#1d6b31' }}>cached</span>
            </div>
            <div className="text-center">
              <p className="font-headline font-bold text-sm">리버시</p>
              <p className="text-xs text-on-surface-variant mt-0.5">돌을 뒤집어 더 많이 차지</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
