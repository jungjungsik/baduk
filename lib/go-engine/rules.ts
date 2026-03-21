import { Color, Position, GameState, PlaceResult, MoveRecord } from './types'
import { cloneBoard, cloneState, getNeighbors, inBounds } from './board'

// 연결된 같은 색 돌 그룹 찾기 (BFS)
export function findGroup(board: Color[][], pos: Position): Position[] {
  const size = board.length
  const color = board[pos.row][pos.col]
  if (color === 'empty') return []

  const visited = new Set<string>()
  const queue: Position[] = [pos]
  const group: Position[] = []

  while (queue.length > 0) {
    const current = queue.shift()!
    const key = `${current.row},${current.col}`
    if (visited.has(key)) continue
    visited.add(key)
    group.push(current)

    for (const neighbor of getNeighbors(current, size)) {
      const nKey = `${neighbor.row},${neighbor.col}`
      if (!visited.has(nKey) && board[neighbor.row][neighbor.col] === color) {
        queue.push(neighbor)
      }
    }
  }

  return group
}

// 그룹의 활로(liberty) 수 계산
export function countLiberties(board: Color[][], group: Position[]): number {
  const size = board.length
  const liberties = new Set<string>()

  for (const pos of group) {
    for (const neighbor of getNeighbors(pos, size)) {
      if (board[neighbor.row][neighbor.col] === 'empty') {
        liberties.add(`${neighbor.row},${neighbor.col}`)
      }
    }
  }

  return liberties.size
}

// 자충수(suicide) 판정
export function isSuicide(board: Color[][], pos: Position, color: Color): boolean {
  const size = board.length
  const testBoard = cloneBoard(board)
  testBoard[pos.row][pos.col] = color

  // 상대 돌을 먼저 따내고 판단
  const opponent: Color = color === 'black' ? 'white' : 'black'
  for (const neighbor of getNeighbors(pos, size)) {
    if (testBoard[neighbor.row][neighbor.col] === opponent) {
      const group = findGroup(testBoard, neighbor)
      if (countLiberties(testBoard, group) === 0) {
        // 상대 돌을 따내면 자충수가 아님
        return false
      }
    }
  }

  // 내 그룹의 활로 확인
  const myGroup = findGroup(testBoard, pos)
  return countLiberties(testBoard, myGroup) === 0
}

// 패(Ko) 판정
export function isKo(state: GameState, pos: Position): boolean {
  if (!state.koPoint) return false
  return state.koPoint.row === pos.row && state.koPoint.col === pos.col
}

// 죽은 돌 따내기 - 착수 후 상대방 돌 제거
export function captureDeadStones(
  board: Color[][],
  placedPos: Position,
  placedColor: Color
): { board: Color[][]; captured: number } {
  const size = board.length
  const opponent: Color = placedColor === 'black' ? 'white' : 'black'
  let captured = 0
  const newBoard = cloneBoard(board)

  for (const neighbor of getNeighbors(placedPos, size)) {
    if (newBoard[neighbor.row][neighbor.col] === opponent) {
      const group = findGroup(newBoard, neighbor)
      if (countLiberties(newBoard, group) === 0) {
        // 그룹 제거
        for (const stone of group) {
          newBoard[stone.row][stone.col] = 'empty'
          captured++
        }
      }
    }
  }

  return { board: newBoard, captured }
}

// 패 포인트 계산 (1개 돌만 따낸 경우)
function calculateKoPoint(
  beforeBoard: Color[][],
  afterBoard: Color[][],
  captured: number,
  placedPos: Position
): Position | null {
  if (captured !== 1) return null

  // 따낸 돌의 위치를 찾음
  const size = beforeBoard.length
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (beforeBoard[r][c] !== 'empty' && afterBoard[r][c] === 'empty') {
        return { row: r, col: c }
      }
    }
  }
  return null
}

// 착수 처리 (메인 함수)
export function placeStone(state: GameState, pos: Position, color: Color): PlaceResult {
  if (state.isGameOver) {
    return { success: false, error: 'game_over' }
  }

  const { board, size } = state

  // 이미 돌이 있는 위치
  if (board[pos.row][pos.col] !== 'empty') {
    return { success: false, error: 'occupied' }
  }

  // 패 규칙
  if (isKo(state, pos)) {
    return { success: false, error: 'ko' }
  }

  // 자충수 규칙
  if (isSuicide(board, pos, color)) {
    return { success: false, error: 'suicide' }
  }

  // 착수
  const newBoard = cloneBoard(board)
  newBoard[pos.row][pos.col] = color

  // 따내기
  const { board: boardAfterCapture, captured } = captureDeadStones(newBoard, pos, color)

  // 패 포인트 계산
  const koPoint = calculateKoPoint(board, boardAfterCapture, captured, pos)

  // 새 게임 상태
  const opponent: Color = color === 'black' ? 'white' : 'black'
  const moveRecord: MoveRecord = {
    position: pos,
    color,
    captured,
    moveNumber: state.moveHistory.length + 1,
  }

  const newState: GameState = {
    ...state,
    board: boardAfterCapture,
    currentTurn: opponent,
    capturedBlack: color === 'white' ? state.capturedBlack + captured : state.capturedBlack,
    capturedWhite: color === 'black' ? state.capturedWhite + captured : state.capturedWhite,
    lastMove: pos,
    koPoint,
    moveHistory: [...state.moveHistory, moveRecord],
    passes: 0,
    isGameOver: false,
  }

  return { success: true, state: newState }
}

// 패스 처리
export function pass(state: GameState): GameState {
  const opponent: Color = state.currentTurn === 'black' ? 'white' : 'black'
  const newPasses = state.passes + 1
  const moveRecord: MoveRecord = {
    position: null,
    color: state.currentTurn,
    captured: 0,
    moveNumber: state.moveHistory.length + 1,
  }

  return {
    ...state,
    currentTurn: opponent,
    lastMove: null,
    koPoint: null,
    moveHistory: [...state.moveHistory, moveRecord],
    passes: newPasses,
    isGameOver: newPasses >= 2,
  }
}
