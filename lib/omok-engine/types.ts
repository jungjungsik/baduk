import { Color, Position } from '@/lib/go-engine/types'

export type OmokBoardSize = 15 | 19
export type { Color, Position }

export interface OmokGameState {
  board: Color[][]
  size: OmokBoardSize
  currentTurn: 'black' | 'white'
  lastMove: Position | null
  winner: 'black' | 'white' | null
  winLine: Position[] | null
  isGameOver: boolean
  moveHistory: OmokMoveRecord[]
  useRenju: boolean
}

export interface OmokMoveRecord {
  position: Position
  color: 'black' | 'white'
  moveNumber: number
}

export type OmokPlaceResult =
  | { success: true; state: OmokGameState }
  | { success: false; error: 'occupied' | 'forbidden' | 'game_over' }

export function createOmokGameState(size: OmokBoardSize, useRenju = false): OmokGameState {
  const board: Color[][] = Array.from({ length: size }, () =>
    Array(size).fill('empty')
  )
  return {
    board,
    size,
    currentTurn: 'black',
    lastMove: null,
    winner: null,
    winLine: null,
    isGameOver: false,
    moveHistory: [],
    useRenju,
  }
}
