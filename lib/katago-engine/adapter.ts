import { GameState, Position, Color } from '@/lib/go-engine/types'
import type { BoardState, Move, Player } from './app-types'

/**
 * Convert our board (Color[][]) to KataGo board (Intersection[][] [y][x])
 * where Intersection = Player | null
 */
export function toKataGoBoard(board: Color[][], size: number): BoardState {
  const result: BoardState = []
  for (let y = 0; y < size; y++) {
    result[y] = []
    for (let x = 0; x < size; x++) {
      const c = board[y][x]
      result[y][x] = c === 'empty' ? null : (c as Player)
    }
  }
  return result
}

/**
 * Convert our move history to KataGo format
 */
export function toKataGoMoves(state: GameState): Move[] {
  return state.moveHistory.map((m) => ({
    x: m.position ? m.position.col : -1,
    y: m.position ? m.position.row : -1,
    player: m.color as Player,
  }))
}

/**
 * Convert KataGo move (x, y) to our Position
 */
export function fromKataGoMove(x: number, y: number): Position | null {
  if (x === -1 || y === -1) return null // pass
  return { row: y, col: x }
}
