'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import ReversiBoard from '@/components/board/ReversiBoard'
import { useReversiStore } from '@/lib/store/reversiStore'
import { Position } from '@/lib/go-engine/types'
import { getReversiAIMove, ReversiAIDifficulty } from '@/lib/reversi-ai/engine'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const AI_DIFFICULTIES: { value: ReversiAIDifficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: '쉬움', desc: '무작위로 착수합니다', color: '#4ade80' },
  { value: 'medium', label: '보통', desc: '코너를 노리고 많이 뒤집습니다', color: '#fbbf24' },
  { value: 'hard', label: '어려움', desc: '위치 가중치와 상대 기동성을 분석합니다', color: '#f87171' },
]

export default function ReversiPage() {
  const router = useRouter()
  const { gameState, error, startGame, makeMove, resetGame } = useReversiStore()
  const [gameMode, setGameMode] = useState<'ai' | 'two-player' | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<ReversiAIDifficulty>('easy')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiThinkingRef = useRef(false)
  const [noMovesMessage, setNoMovesMessage] = useState<string | null>(null)

  // AI move effect
  useEffect(() => {
    if (!gameState || gameMode !== 'ai') return
    if (gameState.isGameOver) return
    if (gameState.currentTurn !== 'white') return
    if (aiThinkingRef.current) return

    // AI 유효 수 없으면 (강제 패스)
    if (gameState.validMoves.length === 0) return

    aiThinkingRef.current = true
    setIsAIThinking(true)

    const delay = aiDifficulty === 'hard' ? 700 : aiDifficulty === 'medium' ? 450 : 250

    const doMove = async () => {
      await new Promise(r => setTimeout(r, delay))
      const aiPos = getReversiAIMove(gameState, aiDifficulty)
      if (aiPos) makeMove(aiPos)
      aiThinkingRef.current = false
      setIsAIThinking(false)
    }

    doMove()

    return () => {
      aiThinkingRef.current = false
      setIsAIThinking(false)
    }
  }, [gameState, gameMode, aiDifficulty, makeMove])

  // 유효 수 없음 알림 (두 사람 대국 또는 AI 강제 패스)
  useEffect(() => {
    if (!gameState || gameState.isGameOver) {
      setNoMovesMessage(null)
      return
    }
    if (gameState.validMoves.length === 0) {
      const who = gameState.currentTurn === 'black' ? '흑' : '백'
      setNoMovesMessage(`${who}은 놓을 수 있는 곳이 없어 자동으로 패스됩니다`)
      const t = setTimeout(() => setNoMovesMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [gameState])

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameMode === 'ai' && (isAIThinking || gameState?.currentTurn !== 'black')) return
    if (!gameState) return
    // 유효 수에 포함된 경우만 처리
    const isValid = gameState.validMoves.some(v => v.row === pos.row && v.col === pos.col)
    if (!isValid) return
    makeMove(pos)
  }, [makeMove, gameMode, isAIThinking, gameState])

  const handleReset = () => {
    resetGame()
    setGameMode(null)
    setIsAIThinking(false)
    aiThinkingRef.current = false
    router.push('/play')
  }

  const difficultyInfo = AI_DIFFICULTIES.find(d => d.value === aiDifficulty)

  // Setup screen
  if (!gameState) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3 max-w-lg lg:max-w-4xl mx-auto">
            <Link href="/play" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </Link>
            <h1 className="font-headline font-bold text-lg">리버시 (오델로)</h1>
          </div>
        </header>

        <div className="max-w-lg lg:max-w-2xl mx-auto px-5 py-8 space-y-8">
          {/* 게임 설명 */}
          <div className="rounded-2xl p-4 space-y-1" style={{ backgroundColor: '#e8f5e9' }}>
            <p className="font-headline font-bold text-sm" style={{ color: '#2d5a27' }}>리버시란?</p>
            <p className="text-xs leading-relaxed" style={{ color: '#3a7a35' }}>
              8×8 보드에서 <strong>상대 돌을 사이에 끼워 뒤집어</strong> 더 많은 돌을 가진 사람이 승리합니다.
              코너를 차지하면 절대 뒤집히지 않으니 코너를 노리세요!
            </p>
          </div>

          {/* Step 1: Mode */}
          <div>
            <h2 className="font-headline font-extrabold text-2xl mb-2">대국 방식 선택</h2>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('ai')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 gap-2 transition-all ${
                  gameMode === 'ai' ? 'border-primary bg-primary-container' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
                <span className="font-headline font-bold text-sm">AI 대국</span>
                <span className="text-xs text-on-surface-variant">나 (흑) vs AI (백)</span>
              </button>
              <button
                onClick={() => setGameMode('two-player')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 gap-2 transition-all ${
                  gameMode === 'two-player' ? 'border-primary bg-primary-container' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">group</span>
                <span className="font-headline font-bold text-sm">두 사람 대국</span>
                <span className="text-xs text-on-surface-variant">흑 vs 백</span>
              </button>
            </div>
          </div>

          {/* Step 2: AI difficulty */}
          {gameMode === 'ai' && (
            <div>
              <h2 className="font-headline font-extrabold text-xl mb-2">AI 난이도</h2>
              <div className="space-y-2">
                {AI_DIFFICULTIES.map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    onClick={() => setAiDifficulty(value)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      aiDifficulty === value ? 'border-primary bg-primary-container' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: color }}>
                        {label}
                      </div>
                      <div className="text-left">
                        <p className="font-headline font-bold">{label} AI</p>
                        <p className="text-xs text-on-surface-variant">{desc}</p>
                      </div>
                    </div>
                    {aiDifficulty === value && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameMode !== null && (
            <button
              onClick={() => startGame()}
              className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-bold text-base shadow-sm active:scale-[0.98] transition-transform"
            >
              대국 시작
            </button>
          )}
        </div>
      </div>
    )
  }

  // Game over screen
  if (gameState.isGameOver) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-headline font-extrabold text-3xl">
              {gameState.isDraw ? '무승부' :
                gameMode === 'ai'
                  ? gameState.winner === 'black' ? '승리!' : '패배'
                  : `${gameState.winner === 'black' ? '흑' : '백'} 승리!`}
            </h2>
            <p className="text-on-surface-variant">
              {gameState.isDraw ? '돌 수가 같습니다' :
                `${gameState.winner === 'black' ? '흑' : '백'}이 더 많은 돌을 가졌습니다`}
            </p>
          </div>

          {/* 최종 점수 */}
          <div className="bg-surface-container-high rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-on-surface" />
                <span className="font-bold">{gameMode === 'ai' ? '나 (흑)' : '흑'}</span>
              </div>
              <span className="font-headline font-bold text-2xl">{gameState.blackCount}</span>
            </div>
            <div className="h-px bg-outline-variant/30" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-surface-container-lowest border border-outline-variant/50" />
                <span className="font-bold">{gameMode === 'ai' ? 'AI (백)' : '백'}</span>
              </div>
              <span className="font-headline font-bold text-2xl">{gameState.whiteCount}</span>
            </div>
          </div>

          {/* 최종 보드 */}
          <div className="w-56 mx-auto shadow-xl">
            <ReversiBoard board={gameState.board} validMoves={[]} lastMove={gameState.lastMove} disabled />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => startGame()} className="py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold active:scale-95 transition-transform">
              재대국
            </button>
            <button onClick={() => { resetGame(); router.push('/play') }} className="py-4 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform">
              홈으로
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active game screen
  const boardDisabled = gameMode === 'ai' && (isAIThinking || gameState.currentTurn !== 'black')

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="flex items-center justify-between max-w-lg lg:max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={handleReset} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-lg">리버시</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 실시간 점수 */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full bg-on-surface" />
                <span className="font-bold">{gameState.blackCount}</span>
              </div>
              <span className="text-on-surface-variant">vs</span>
              <div className="flex items-center gap-1">
                <span className="font-bold">{gameState.whiteCount}</span>
                <div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest border border-outline-variant" />
              </div>
            </div>

            {isAIThinking ? (
              <span className="text-sm font-bold text-on-surface-variant animate-pulse">AI 생각중...</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded-full ${gameState.currentTurn === 'black' ? 'bg-on-surface' : 'bg-surface-container-lowest border border-outline-variant'}`} />
                <span className="text-sm font-bold">
                  {gameMode === 'ai'
                    ? gameState.currentTurn === 'black' ? '내 차례' : 'AI 차례'
                    : `${gameState.currentTurn === 'black' ? '흑' : '백'} 차례`}
                </span>
              </div>
            )}
            {gameMode === 'ai' && difficultyInfo && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: difficultyInfo.color }}>
                {difficultyInfo.label}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-4xl mx-auto lg:px-4 py-2 lg:py-4 pb-28 lg:pb-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-2 lg:space-y-0">
          <div className="space-y-2 lg:space-y-4">
            {/* 알림 메시지 */}
            {(error || noMovesMessage) && (
              <div className="mx-3 lg:mx-0 rounded-xl px-4 py-2.5 text-sm font-medium text-center"
                style={{ backgroundColor: error ? 'rgba(239,68,68,0.1)' : '#f4e3ce', color: error ? '#dc2626' : '#5d5242' }}>
                {error || noMovesMessage}
              </div>
            )}

            {/* Board */}
            <div className={`w-full shadow-xl transition-opacity ${boardDisabled ? 'opacity-75 pointer-events-none' : ''}`}>
              <ReversiBoard
                board={gameState.board}
                validMoves={boardDisabled ? [] : gameState.validMoves}
                lastMove={gameState.lastMove}
                onSquareClick={handleSquareClick}
                disabled={boardDisabled}
              />
            </div>

            {/* Resign */}
            <div className="px-3 lg:px-0">
              <button
                onClick={handleReset}
                className="w-full py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                포기
              </button>
            </div>
          </div>

          {/* Move history */}
          <div>
            {gameState.moveHistory.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-4 mx-3 lg:mx-0">
                <h3 className="font-headline font-bold text-sm mb-3 text-on-surface-variant uppercase tracking-widest">기보</h3>
                <div className="max-h-32 lg:max-h-[480px] overflow-y-auto no-scrollbar space-y-1">
                  {[...gameState.moveHistory].reverse().map((move) => (
                    <div key={move.moveNumber} className="flex items-center gap-2 text-xs">
                      <span className="text-on-surface-variant w-6 text-right">{move.moveNumber}.</span>
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${move.color === 'black' ? 'bg-on-surface' : 'bg-surface-container-lowest border border-outline-variant'}`} />
                      <span className="text-on-surface">
                        {move.position ? `${String.fromCharCode(65 + move.position.col)}${8 - move.position.row}` : '패스'}
                      </span>
                      {move.flipped > 0 && <span className="text-tertiary">(+{move.flipped})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
