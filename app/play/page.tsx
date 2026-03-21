'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import GoBoard from '@/components/board/GoBoard'
import { useGameStore } from '@/lib/store/gameStore'
import { BoardSize, Position } from '@/lib/go-engine/types'
import { getAIMove, AIDifficulty } from '@/lib/ai/engine'
import { initKataGo, getKataGoMove, onKataGoStatusChange, type KataGoStatus } from '@/lib/ai/katago-interface'
import Link from 'next/link'

const BOARD_SIZES: { size: BoardSize; label: string; desc: string }[] = [
  { size: 9, label: '9×9', desc: '미니 (입문)' },
  { size: 13, label: '13×13', desc: '중형 (초급)' },
  { size: 19, label: '19×19', desc: '정식 (표준)' },
]

const AI_DIFFICULTIES: { value: AIDifficulty; label: string; desc: string; color: string }[] = [
  { value: 'easy', label: '입문', desc: '랜덤 착수 — 아무 곳에나 둡니다', color: '#4ade80' },
  { value: 'medium', label: '초급', desc: '따내기와 살리기를 이해합니다', color: '#fbbf24' },
  { value: 'hard', label: '중급', desc: '포석과 전략을 고려합니다', color: '#f87171' },
]

export default function PlayPage() {
  const { gameState, score, error, startGame, makeMove, passMove, resetGame } = useGameStore()
  const [selectedSize, setSelectedSize] = useState<BoardSize>(9)
  const [gameMode, setGameMode] = useState<'ai' | 'two-player' | null>(null)
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('easy')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const aiThinkingRef = useRef(false)
  const [kataGoStatus, setKataGoStatus] = useState<KataGoStatus>('idle')

  // Initialize KataGo when AI mode is selected
  useEffect(() => {
    if (gameMode !== 'ai') return
    initKataGo().catch(console.error)
    const unsubscribe = onKataGoStatusChange(setKataGoStatus)
    return unsubscribe
  }, [gameMode])

  // AI move effect
  useEffect(() => {
    if (!gameState || gameMode !== 'ai') return
    if (gameState.isGameOver) return
    if (gameState.currentTurn !== 'white') return
    if (aiThinkingRef.current) return  // prevent double-fire

    aiThinkingRef.current = true
    setIsAIThinking(true)

    const visits = aiDifficulty === 'hard' ? 200 : aiDifficulty === 'medium' ? 100 : 30
    const delay = aiDifficulty === 'hard' ? 800 : aiDifficulty === 'medium' ? 500 : 300

    const doMove = async () => {
      let aiPos: Position | null = null

      if (kataGoStatus === 'ready') {
        try {
          aiPos = await getKataGoMove(gameState, visits)
        } catch {
          // fallback to heuristic
          aiPos = getAIMove(gameState, aiDifficulty)
        }
      } else {
        // KataGo not ready yet, use heuristic
        await new Promise(r => setTimeout(r, delay))
        aiPos = getAIMove(gameState, aiDifficulty)
      }

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
  }, [gameState, gameMode, aiDifficulty, kataGoStatus, makeMove, passMove])

  const handleIntersectionClick = useCallback((pos: Position) => {
    if (gameMode === 'ai' && (isAIThinking || gameState?.currentTurn !== 'black')) return
    makeMove(pos)
  }, [makeMove, gameMode, isAIThinking, gameState])

  const handleStart = () => {
    startGame(selectedSize)
  }

  const handlePass = () => {
    if (gameMode === 'ai' && (isAIThinking || gameState?.currentTurn !== 'black')) return
    passMove()
  }

  const handleReset = () => {
    resetGame()
    setGameMode(null)
    setIsAIThinking(false)
  }

  const difficultyInfo = AI_DIFFICULTIES.find(d => d.value === aiDifficulty)

  // Setup screen (before game starts)
  if (!gameState) {
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

        <div className="max-w-lg lg:max-w-2xl mx-auto px-5 py-8 space-y-8">

          {/* Step 1: Mode selection */}
          <div>
            <h2 className="font-headline font-extrabold text-2xl mb-2">대국 방식 선택</h2>
            <p className="text-on-surface-variant text-sm mb-4">어떤 방식으로 두실 건가요?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setGameMode('ai')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 gap-2 transition-all ${
                  gameMode === 'ai'
                    ? 'border-primary bg-primary-container'
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">smart_toy</span>
                <span className="font-headline font-bold text-sm">AI 대국</span>
                <span className="text-xs text-on-surface-variant">나 (흑) vs AI (백)</span>
              </button>
              <button
                onClick={() => setGameMode('two-player')}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 gap-2 transition-all ${
                  gameMode === 'two-player'
                    ? 'border-primary bg-primary-container'
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                <span className="material-symbols-outlined text-3xl">group</span>
                <span className="font-headline font-bold text-sm">두 사람 대국</span>
                <span className="text-xs text-on-surface-variant">흑 vs 백</span>
              </button>
            </div>
          </div>

          {/* Step 2: AI difficulty (only in AI mode) */}
          {gameMode === 'ai' && (
            <div>
              <h2 className="font-headline font-extrabold text-xl mb-2">AI 난이도</h2>
              <div className="space-y-2">
                {AI_DIFFICULTIES.map(({ value, label, desc, color }) => (
                  <button
                    key={value}
                    onClick={() => setAiDifficulty(value)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                      aiDifficulty === value
                        ? 'border-primary bg-primary-container'
                        : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white"
                        style={{ backgroundColor: color }}
                      >
                        {label}
                      </div>
                      <div className="text-left">
                        <p className="font-headline font-bold">{label} AI</p>
                        <p className="text-xs text-on-surface-variant">{desc}</p>
                      </div>
                    </div>
                    {aiDifficulty === value && (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* KataGo loading status */}
          {gameMode === 'ai' && kataGoStatus === 'loading' && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant animate-pulse">
              <span className="material-symbols-outlined text-base">sync</span>
              KataGo 모델 로딩 중... (3.6MB)
            </div>
          )}
          {gameMode === 'ai' && kataGoStatus === 'ready' && (
            <div className="flex items-center gap-2 text-sm text-tertiary">
              <span className="material-symbols-outlined text-base">check_circle</span>
              KataGo 준비 완료
            </div>
          )}
          {gameMode === 'ai' && kataGoStatus === 'error' && (
            <div className="flex items-center gap-2 text-sm text-error">
              <span className="material-symbols-outlined text-base">error</span>
              KataGo 로딩 실패 (기본 AI 사용)
            </div>
          )}

          {/* Step 3: Board size */}
          {gameMode !== null && (
            <div>
              <h2 className="font-headline font-extrabold text-xl mb-2">바둑판 크기 선택</h2>
              <p className="text-on-surface-variant text-sm mb-4">입문자라면 9×9 미니 게임을 추천합니다.</p>

              <div className="space-y-3">
                {BOARD_SIZES.map(({ size, label, desc }) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary-container'
                        : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
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
                    {selectedSize === size && (
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Start button */}
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
  if (gameState.isGameOver && score) {
    const playerWon = score.winner === 'black'
    const isDraw = score.winner === null

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            {gameMode === 'ai' ? (
              <>
                <h2 className="font-headline font-extrabold text-3xl">
                  {isDraw ? '무승부' : playerWon ? '승리!' : '패배'}
                </h2>
                <p className="text-on-surface-variant">
                  {isDraw
                    ? '비겼습니다'
                    : playerWon
                    ? '흑이 이겼습니다'
                    : 'AI가 이겼습니다'}
                  {!isDraw && score.margin > 0 && ` (${score.margin.toFixed(1)}점 차)`}
                </p>
              </>
            ) : (
              <>
                <h2 className="font-headline font-extrabold text-3xl">게임 종료</h2>
                <p className="text-on-surface-variant">
                  {score.winner === 'black' ? '흑' : score.winner === 'white' ? '백' : '무'}승
                  {score.margin > 0 && ` (${score.margin.toFixed(1)}점 차)`}
                </p>
              </>
            )}
          </div>

          <div className="bg-surface-container-high rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-on-surface" />
                <span className="font-bold">{gameMode === 'ai' ? '나 (흑)' : '흑'}</span>
              </div>
              <span className="font-headline font-bold text-xl">{score.blackTotal.toFixed(1)}</span>
            </div>
            <div className="h-px bg-outline-variant/30" />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-surface-container-lowest border border-outline-variant/50" />
                <span className="font-bold">{gameMode === 'ai' ? `AI (백)` : '백'}</span>
              </div>
              <span className="font-headline font-bold text-xl">{score.whiteTotal.toFixed(1)}</span>
            </div>
            <div className="text-xs text-on-surface-variant text-center">덤(Komi): {score.komi}점</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleStart}
              className="py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold active:scale-95 transition-transform"
            >
              재대국
            </button>
            <button
              onClick={handleReset}
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
            <button
              onClick={handleReset}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-lg">{gameState.size}×{gameState.size} 대국</h1>
          </div>

          {/* Turn indicator / AI thinking indicator */}
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
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white ml-1"
                style={{ backgroundColor: difficultyInfo.color }}
              >
                {difficultyInfo.label} AI
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-4xl mx-auto px-4 py-4">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-4 lg:space-y-0">
          {/* Left: board area */}
          <div className="space-y-4">
            {/* Capture counts */}
            <div className="flex justify-between text-sm">
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

            {/* Error message */}
            {error && (
              <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-2.5 text-error text-sm font-medium text-center">
                {error}
              </div>
            )}

            {/* Board */}
            <div className={`w-full shadow-xl transition-opacity ${boardDisabled ? 'opacity-75 pointer-events-none' : ''}`}>
              <GoBoard
                board={gameState.board}
                size={gameState.size}
                lastMove={gameState.lastMove}
                koPoint={gameState.koPoint}
                onIntersectionClick={handleIntersectionClick}
              />
            </div>

            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handlePass}
                disabled={gameMode === 'ai' && (isAIThinking || gameState.currentTurn !== 'black')}
                className="py-3.5 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">front_hand</span>
                패스
              </button>
              <button
                onClick={handleReset}
                className="py-3.5 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-lg">restart_alt</span>
                포기
              </button>
            </div>
          </div>

          {/* Right: move history */}
          <div>
            {gameState.moveHistory.length > 0 && (
              <div className="bg-surface-container-low rounded-2xl p-4">
                <h3 className="font-headline font-bold text-sm mb-3 text-on-surface-variant uppercase tracking-widest">기보</h3>
                <div className="max-h-32 lg:max-h-[480px] overflow-y-auto no-scrollbar space-y-1">
                  {[...gameState.moveHistory].reverse().map((move) => (
                    <div key={move.moveNumber} className="flex items-center gap-2 text-xs">
                      <span className="text-on-surface-variant w-6 text-right">{move.moveNumber}.</span>
                      <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${move.color === 'black' ? 'bg-on-surface' : 'bg-surface-container-lowest border border-outline-variant'}`} />
                      <span className="text-on-surface">
                        {move.position
                          ? `${String.fromCharCode(65 + move.position.col)}${gameState.size - move.position.row}`
                          : '패스'}
                      </span>
                      {move.captured > 0 && (
                        <span className="text-tertiary">(+{move.captured})</span>
                      )}
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
