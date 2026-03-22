import { Color, Position } from '@/lib/go-engine/types'
export type { Color, Position }

export const REVERSI_SIZE = 8

export interface ReversiGameState {
  board: Color[][]
  currentTurn: 'black' | 'white'
  lastMove: Position | null
  validMoves: Position[]
  winner: 'black' | 'white' | null
  isDraw: boolean
  isGameOver: boolean
  moveHistory: ReversiMoveRecord[]
  blackCount: number
  whiteCount: number
  consecutivePasses: number
}

export interface ReversiMoveRecord {
  position: Position | null
  color: 'black' | 'white'
  flipped: number
  moveNumber: number
}

export type ReversiPlaceResult =
  | { success: true; state: ReversiGameState }
  | { success: false; error: 'invalid_move' | 'game_over' }

export function createReversiGameState(): ReversiGameState {
  const board: Color[][] = Array.from({ length: REVERSI_SIZE }, () =>
    Array(REVERSI_SIZE).fill('empty')
  )
  // 초기 배치: 중앙 4칸
  board[3][3] = 'white'
  board[3][4] = 'black'
  board[4][3] = 'black'
  board[4][4] = 'white'

  // 흑의 초기 유효 수 계산 (여기서는 미리 계산하지 않고 rules에서 처리)
  return {
    board,
    currentTurn: 'black',
    lastMove: null,
    validMoves: [], // rules의 getValidMoves로 채워짐
    winner: null,
    isDraw: false,
    isGameOver: false,
    moveHistory: [],
    blackCount: 2,
    whiteCount: 2,
    consecutivePasses: 0,
  }
}
