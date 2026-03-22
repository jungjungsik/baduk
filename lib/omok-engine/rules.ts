import { Color, Position } from '@/lib/go-engine/types'
import { OmokGameState, OmokPlaceResult, OmokBoardSize } from './types'

const DIRECTIONS = [
  [0, 1],   // 가로
  [1, 0],   // 세로
  [1, 1],   // 우하 대각
  [1, -1],  // 우상 대각
] as const

// 한 방향(+방향과 -방향 포함)으로 연속된 같은 색 돌 개수와 위치 반환
function scanLine(
  board: Color[][],
  row: number,
  col: number,
  color: Color,
  dr: number,
  dc: number,
  size: number
): { stones: Position[]; openEnds: number } {
  const stones: Position[] = [{ row, col }]
  let openEnds = 0

  // 정방향
  let r = row + dr, c = col + dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === color) {
    stones.push({ row: r, col: c })
    r += dr; c += dc
  }
  if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === 'empty') openEnds++

  // 역방향
  r = row - dr; c = col - dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === color) {
    stones.push({ row: r, col: c })
    r -= dr; c -= dc
  }
  if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === 'empty') openEnds++

  return { stones, openEnds }
}

// 5목 완성 여부 체크
export function checkWin(
  board: Color[][],
  pos: Position,
  color: Color,
  useRenju: boolean,
  size: number
): { won: boolean; winLine: Position[] } {
  for (const [dr, dc] of DIRECTIONS) {
    const { stones } = scanLine(board, pos.row, pos.col, color, dr, dc, size)
    const count = stones.length
    if (useRenju && color === 'black') {
      // 렌주룰: 흑은 정확히 5개만 승리 (장목 6+ 불가)
      if (count === 5) return { won: true, winLine: stones }
    } else {
      if (count >= 5) return { won: true, winLine: stones.slice(0, 5) }
    }
  }
  return { won: false, winLine: [] }
}

// 렌주룰 금수 판정 (흑만 적용)
export function isForbidden(
  board: Color[][],
  pos: Position,
  size: number
): boolean {
  // 임시로 돌 놓기
  const tempBoard = board.map(r => [...r])
  tempBoard[pos.row][pos.col] = 'black'

  let fours = 0
  let openThrees = 0

  for (const [dr, dc] of DIRECTIONS) {
    const { stones, openEnds } = scanLine(tempBoard, pos.row, pos.col, 'black', dr, dc, size)
    const count = stones.length

    // 장목 (6+): 금수
    if (count >= 6) return true

    // 사 (4): 양끝 중 하나라도 열려있는 4
    if (count === 4 && openEnds >= 1) fours++

    // 열린 삼 (3): 양끝 모두 열려있는 3
    if (count === 3 && openEnds === 2) openThrees++
  }

  // 쌍사 (4-4): 금수
  if (fours >= 2) return true
  // 쌍삼 (3-3): 금수
  if (openThrees >= 2) return true

  return false
}

// 돌 놓기 (메인 함수)
export function placeOmokStone(
  state: OmokGameState,
  pos: Position
): OmokPlaceResult {
  if (state.isGameOver) {
    return { success: false, error: 'game_over' }
  }

  const { board, size, currentTurn, useRenju } = state

  if (board[pos.row][pos.col] !== 'empty') {
    return { success: false, error: 'occupied' }
  }

  // 렌주룰 금수 체크 (흑만)
  if (useRenju && currentTurn === 'black') {
    if (isForbidden(board, pos, size)) {
      return { success: false, error: 'forbidden' }
    }
  }

  // 새 보드에 돌 놓기
  const newBoard = board.map(r => [...r]) as Color[][]
  newBoard[pos.row][pos.col] = currentTurn

  // 승리 체크
  const { won, winLine } = checkWin(newBoard, pos, currentTurn, useRenju, size)

  // 무승부 체크 (보드 꽉 찬 경우)
  const isDraw = !won && newBoard.every(row => row.every(cell => cell !== 'empty'))

  const newRecord = {
    position: pos,
    color: currentTurn,
    moveNumber: state.moveHistory.length + 1,
  }

  const newState: OmokGameState = {
    ...state,
    board: newBoard,
    currentTurn: currentTurn === 'black' ? 'white' : 'black',
    lastMove: pos,
    winner: won ? currentTurn : null,
    winLine: won ? winLine : null,
    isGameOver: won || isDraw,
    moveHistory: [...state.moveHistory, newRecord],
  }

  return { success: true, state: newState }
}
