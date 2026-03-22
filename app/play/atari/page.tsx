'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import GoBoard from '@/components/board/GoBoard'
import { useAtariStore } from '@/lib/store/atariStore'
import { BoardSize, Position } from '@/lib/go-engine/types'
import { getAtariAIMove, AtariAIDifficulty } from '@/lib/ai/atari-engine'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const BOARD_SIZES: { size: BoardSize; label: string; desc: string }[] = [
  { size: 9, label: '9×9', desc: '미니 (권장)' },
  { size: 13, label: '13×13', desc: '중형' },
  { size: 19, label: '19×19', desc: '정식' },
]

const AI_DIFFICULTIES: { value: AtariAIDifficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: '입문', desc: '따낼 수 있으면 따냅니다', color: '#4ade80' },
  { value: 'medium', label: '초급', desc: '단수와 탈출을 이해합니다', color: '#fbbf24' },
  { value: 'hard', label: '중급', desc: '상대 활로를 적극 줄입니다', color: '#f87171' },
]

export default function AtariPage() {
  const router = useRouter()
  const { gameState, atariWinner, error, startGame, makeMove, passMove, resetGame } = useAtariStore()
  const [selectedSize, setSelectedSize] = useState<BoardSize>(9)
  const [gameMode, setGameMode] = useState<'ai' | 'two-player' | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AtariAIDifficulty>('easy')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiThinkingRef = useRef(false)

  // AI move effect
  useEffect(() => {
    if (!gameState || gameMode !== 'ai') return
    if (gameState.isGameOver || atariWinner) return
    if (gameState.currentTurn !== 'white') return
    if (aiThinkingRef.current) return

    aiThinkingRef.current = true
    setIsAIThinking(true)

    const delay = aiDifficulty === 'hard' ? 700 : aiDifficulty === 'medium' ? 450 : 250

    const doMove = async () => {
      await new Promise(r => setTimeout(r, delay))
      const aiPos = getAtariAIMove(gameState, aiDifficulty)
      if (aiPos) {
        makeMove(aiPos)
      } else {
        passMove()
      }
      aiThinkingRef.current = false
      setIsAIThinking(false)
    }

    doMove()

    return () => {
      aiThinkingRef.current = false
      setIsAIThinking(false)
    }
  }, [gameState, gameMode, aiDifficulty, atariWinner, makeMove, passMove])

  const handleIntersectionClick = useCallback((pos: Position) => {
    if (gameMode === 'ai' && (isAIThinking || gameState?.currentTurn !== 'black')) return
    makeMove(pos)
  }, [makeMove, gameMode, isAIThinking, gameState])

  const handleStart = () => startGame(selectedSize)

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
            <h1 className="font-headline font-bold text-lg">아타리 바둑</h1>
          </div>
        </header>

        <div className="max-w-lg lg:max-w-2xl mx-auto px-5 py-8 space-y-8">
          {/* 게임 설명 */}
          <div className="rounded-2xl p-4 space-y-1" style={{ backgroundColor: '#f4e3ce' }}>
            <p className="font-headline font-bold text-sm" style={{ color: '#5d5242' }}>아타리 바둑이란?</p>
            <p className="text-xs leading-relaxed" style={{ color: '#6f6252' }}>
              바둑 규칙 그대로지만, <strong>상대 돌을 처음 따내는 사람이 즉시 승리</strong>합니다.
              바둑 입문자가 따내기 감각을 익히기 좋은 게임입니다.
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

          {/* Step 3: Board size */}
          {gameMode !== null && (
            <div>
              <h2 className="font-headline font-extrabold text-xl mb-2">바둑판 크기 선택</h2>
              <p className="text-on-surface-variant text-sm mb-4">아타리 바둑은 9×9를 추천합니다.</p>
              <div className="space-y-3">
                {BOARD_SIZES.map(({ size, label, desc }) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      selectedSize === size ? 'border-primary bg-primary-container' : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-black ${
                        selectedSize === size ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'
                      }`}>
                        {label}
                      </div>
                      <div className="text-left">
                        <p className="font-headline font-bold">{label} 바둑판</p>
                        <p className="text-sm text-on-surface-variant">{desc}</p>
                      </div>
                    </div>
                    {selectedSize === size && <span className="material-symbols-outlined text-primary">check_circle</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameMode !== null && (
            <button
              onClick={handleStart}
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
  if (gameState.isGameOver && atariWinner) {
    const playerWon = atariWinner === 'black'

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-headline font-extrabold text-3xl">
              {gameMode === 'ai'
                ? playerWon ? '승리!' : '패배'
                : `${atariWinner === 'black' ? '흑' : '백'} 승리!`}
            </h2>
            <p className="text-on-surface-variant">
              {atariWinner === 'black' ? '흑' : '백'}이 첫 번째 따냄에 성공했습니다
            </p>
          </div>

          <div className="w-48 mx-auto shadow-xl">
            <GoBoard
              board={gameState.board}
              size={gameState.size}
              lastMove={gameState.lastMove}
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStart}
              className="py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold active:scale-95 transition-transform"
            >
              재대국
            </button>
            <button
              onClick={() => { resetGame(); router.push('/play') }}
              className="py-4 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform"
            >
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
            <div>
              <h1 className="font-headline font-bold text-base leading-tight">아타리 바둑 {gameState.size}×{gameState.size}</h1>
              <p className="text-xs text-on-surface-variant">첫 따냄 승리</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAIThinking ? (
              <span className="text-sm font-bold text-on-surface-variant animate-pulse">AI 생각중...</span>
            ) : (
              <>
                <div className={`w-4 h-4 rounded-full ${gameState.currentTurn === 'black' ? 'bg-on-surface' : 'bg-surface-container-lowest border border-outline-variant'}`} />
                <span className="text-sm font-bold">
                  {gameMode === 'ai'
                    ? gameState.currentTurn === 'black' ? '나 (흑) 차례' : 'AI (백) 차례'
                    : `${gameState.currentTurn === 'black' ? '흑' : '백'} 차례`}
                </span>
              </>
            )}
            {gameMode === 'ai' && difficultyInfo && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white ml-1" style={{ backgroundColor: difficultyInfo.color }}>
                {difficultyInfo.label}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-4xl mx-auto lg:px-4 py-2 lg:py-4 pb-28 lg:pb-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-2 lg:space-y-0">
          <div className="space-y-2 lg:space-y-4">
            {/* 캡처 수 */}
            <div className="flex justify-between text-sm px-3 lg:px-0">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-on-surface" />
                <span className="text-on-surface-variant">잡힌 백돌:</span>
                <span className="font-bold">{gameState.capturedWhite}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">잡힌 흑돌:</span>
                <span className="font-bold">{gameState.capturedBlack}</span>
                <div className="w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant/50" />
              </div>
            </div>

            {error && (
              <div className="mx-3 lg:mx-0 bg-error/10 border border-error/30 rounded-xl px-4 py-2.5 text-error text-sm font-medium text-center">
                {error}
              </div>
            )}

            <div className={`w-full shadow-xl transition-opacity ${boardDisabled ? 'opacity-75 pointer-events-none' : ''}`}>
              <GoBoard
                board={gameState.board}
                size={gameState.size}
                lastMove={gameState.lastMove}
                koPoint={gameState.koPoint}
                onIntersectionClick={handleIntersectionClick}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 px-3 lg:px-0">
              <button
                onClick={() => { if (gameMode === 'ai' && (isAIThinking || gameState.currentTurn !== 'black')) return; passMove() }}
                disabled={gameMode === 'ai' && (isAIThinking || gameState.currentTurn !== 'black')}
                className="py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">front_hand</span>
                패스
              </button>
              <button
                onClick={handleReset}
                className="py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                포기
              </button>
            </div>
          </div>

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
                        {move.position ? `${String.fromCharCode(65 + move.position.col)}${gameState.size - move.position.row}` : '패스'}
                      </span>
                      {move.captured > 0 && <span className="text-tertiary font-bold">(+{move.captured} 따냄!)</span>}
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
