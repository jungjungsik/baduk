export type Color = 'black' | 'white' | 'empty'
export type BoardSize = 9 | 13 | 19

export interface Position {
  row: number
  col: number
}

export interface GameState {
  board: Color[][]
  size: BoardSize
  currentTurn: Color
  capturedBlack: number  // 흑이 잡힌 수
  capturedWhite: number  // 백이 잡힌 수
  lastMove: Position | null
  koPoint: Position | null
  moveHistory: MoveRecord[]
  passes: number
  isGameOver: boolean
  komi: number  // 덤 (기본 6.5)
}

export interface MoveRecord {
  position: Position | null  // null = pass
  color: Color
  captured: number
  moveNumber: number
}

export type PlaceResult =
  | { success: true; state: GameState }
  | { success: false; error: 'occupied' | 'suicide' | 'ko' | 'game_over' }
