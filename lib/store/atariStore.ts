import { create } from 'zustand'
import { GameState, Position, BoardSize } from '@/lib/go-engine/types'
import { createGameState } from '@/lib/go-engine/board'
import { placeStone, pass } from '@/lib/go-engine/rules'

interface AtariStore {
  gameState: GameState | null
  atariWinner: 'black' | 'white' | null
  error: string | null

  startGame: (size: BoardSize) => void
  makeMove: (pos: Position) => void
  passMove: () => void
  resetGame: () => void
}

export const useAtariStore = create<AtariStore>((set, get) => ({
  gameState: null,
  atariWinner: null,
  error: null,

  startGame: (size) => {
    set({
      gameState: createGameState(size, 0),  // 아타리는 덤 없음
      atariWinner: null,
      error: null,
    })
  },

  makeMove: (pos) => {
    const { gameState } = get()
    if (!gameState) return

    const prevCapturedWhite = gameState.capturedWhite
    const prevCapturedBlack = gameState.capturedBlack

    const result = placeStone(gameState, pos, gameState.currentTurn)
    if (result.success) {
      const next = result.state
      // 첫 따냄 감지:
      // capturedWhite 증가 → 흑이 백을 잡음 → 흑 승리
      // capturedBlack 증가 → 백이 흑을 잡음 → 백 승리
      let winner: 'black' | 'white' | null = null
      if (next.capturedWhite > prevCapturedWhite) winner = 'black'
      else if (next.capturedBlack > prevCapturedBlack) winner = 'white'

      set({
        gameState: winner !== null ? { ...next, isGameOver: true } : next,
        atariWinner: winner,
        error: null,
      })
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
  },

  resetGame: () => {
    set({ gameState: null, atariWinner: null, error: null })
  },
}))
