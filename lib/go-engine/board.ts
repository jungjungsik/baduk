import { Color, BoardSize, Position, GameState } from './types'

// 빈 보드 생성
export function createBoard(size: BoardSize): Color[][] {
  return Array.from({ length: size }, () => Array(size).fill('empty') as Color[])
}

// 초기 게임 상태 생성
export function createGameState(size: BoardSize, komi = 6.5): GameState {
  return {
    board: createBoard(size),
    size,
    currentTurn: 'black',
    capturedBlack: 0,
    capturedWhite: 0,
    lastMove: null,
    koPoint: null,
    moveHistory: [],
    passes: 0,
    isGameOver: false,
    komi,
  }
}

// 보드 딥 카피
export function cloneBoard(board: Color[][]): Color[][] {
  return board.map(row => [...row])
}

// 보드 상태 딥 카피
export function cloneState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    koPoint: state.koPoint ? { ...state.koPoint } : null,
    moveHistory: [...state.moveHistory],
  }
}

// 위치가 보드 내인지 확인
export function inBounds(pos: Position, size: number): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size
}

// 인접한 4방향 위치 반환
export function getNeighbors(pos: Position, size: number): Position[] {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  return dirs
    .map(([dr, dc]) => ({ row: pos.row + dr, col: pos.col + dc }))
    .filter(p => inBounds(p, size))
}
