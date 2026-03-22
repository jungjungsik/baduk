import { create } from 'zustand'
import { OmokGameState, OmokBoardSize, OmokPlaceResult, createOmokGameState } from '@/lib/omok-engine/types'
import { placeOmokStone } from '@/lib/omok-engine/rules'
import { Position } from '@/lib/go-engine/types'

interface OmokStore {
  gameState: OmokGameState | null
  error: string | null

  startGame: (size: OmokBoardSize, useRenju?: boolean) => void
  makeMove: (pos: Position) => void
  resetGame: () => void
}

export const useOmokStore = create<OmokStore>((set, get) => ({
  gameState: null,
  error: null,

  startGame: (size, useRenju = false) => {
    set({
      gameState: createOmokGameState(size, useRenju),
      error: null,
    })
  },

  makeMove: (pos) => {
    const { gameState } = get()
    if (!gameState) return

    const result: OmokPlaceResult = placeOmokStone(gameState, pos)
    if (result.success) {
      set({ gameState: result.state, error: null })
    } else {
      const errorMessages: Record<string, string> = {
        occupied: '이미 돌이 있습니다',
        forbidden: '금수입니다 (렌주룰)',
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
