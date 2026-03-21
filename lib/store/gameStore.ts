import { create } from 'zustand'
import { GameState, Position, BoardSize } from '@/lib/go-engine/types'
import { createGameState } from '@/lib/go-engine/board'
import { placeStone, pass } from '@/lib/go-engine/rules'
import { calculateScore, ScoreResult } from '@/lib/go-engine/scoring'

interface GameStore {
  gameState: GameState | null
  score: ScoreResult | null
  error: string | null

  // Actions
  startGame: (size: BoardSize, komi?: number) => void
  makeMove: (pos: Position) => void
  passMove: () => void
  calculateFinalScore: () => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  score: null,
  error: null,

  startGame: (size, komi = 6.5) => {
    set({
      gameState: createGameState(size, komi),
      score: null,
      error: null,
    })
  },

  makeMove: (pos) => {
    const { gameState } = get()
    if (!gameState) return

    const result = placeStone(gameState, pos, gameState.currentTurn)
    if (result.success) {
      set({ gameState: result.state, error: null })
    } else {
      const errorMessages: Record<string, string> = {
        occupied: '이미 돌이 있습니다',
        suicide: '자충수는 둘 수 없습니다',
        ko: '패입니다. 다른 곳에 두세요',
        game_over: '게임이 종료되었습니다',
      }
      set({ error: errorMessages[result.error] || '착수 오류' })
      setTimeout(() => set({ error: null }), 2000)
    }
  },

  passMove: () => {
    const { gameState } = get()
    if (!gameState) return
    const newState = pass(gameState)
    set({ gameState: newState })
    if (newState.isGameOver) {
      const score = calculateScore(newState)
      set({ score })
    }
  },

  calculateFinalScore: () => {
    const { gameState } = get()
    if (!gameState) return
    const score = calculateScore(gameState)
    set({ score })
  },

  resetGame: () => {
    set({ gameState: null, score: null, error: null })
  },
}))
