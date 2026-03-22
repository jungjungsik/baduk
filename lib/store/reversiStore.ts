import { create } from 'zustand'
import { Position } from '@/lib/go-engine/types'
import { ReversiGameState } from '@/lib/reversi-engine/types'
import { initReversiGame, placeReversiStone } from '@/lib/reversi-engine/rules'

interface ReversiStore {
  gameState: ReversiGameState | null
  error: string | null

  startGame: () => void
  makeMove: (pos: Position) => void
  resetGame: () => void
}

export const useReversiStore = create<ReversiStore>((set, get) => ({
  gameState: null,
  error: null,

  startGame: () => {
    set({
      gameState: initReversiGame(),
      error: null,
    })
  },

  makeMove: (pos) => {
    const { gameState } = get()
    if (!gameState) return

    const result = placeReversiStone(gameState, pos)
    if (result.success) {
      set({ gameState: result.state, error: null })
    } else {
      const errorMessages: Record<string, string> = {
        invalid_move: '그 곳에는 둘 수 없습니다',
        game_over: '게임이 종료되었습니다',
      }
      set({ error: errorMessages[result.error] || '착수 오류' })
      setTimeout(() => set({ error: null }), 2000)
    }
  },

  resetGame: () => {
    set({ gameState: null, error: null })
  },
}))
