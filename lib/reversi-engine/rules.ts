import { Color, Position } from '@/lib/go-engine/types'
import { ReversiGameState, ReversiPlaceResult, ReversiMoveRecord, REVERSI_SIZE, createReversiGameState } from './types'

const DIRS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
]

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < REVERSI_SIZE && col >= 0 && col < REVERSI_SIZE
}

// pos에 color를 놓았을 때 뒤집히는 상대 돌 위치 목록
export function getStonesFlipped(
  board: Color[][],
  pos: Position,
  color: Color
): Position[] {
  const opponent: Color = color === 'black' ? 'white' : 'black'
  const flipped: Position[] = []

  for (const [dr, dc] of DIRS) {
    const line: Position[] = []
    let r = pos.row + dr
    let c = pos.col + dc

    while (inBounds(r, c) && board[r][c] === opponent) {
      line.push({ row: r, col: c })
      r += dr
      c += dc
    }

    // 상대 돌 1개 이상 + 아군 돌로 마감
    if (line.length > 0 && inBounds(r, c) && board[r][c] === color) {
      flipped.push(...line)
    }
  }

  return flipped
}

// color가 놓을 수 있는 모든 유효 위치
export function getValidMoves(board: Color[][], color: Color): Position[] {
  const moves: Position[] = []
  for (let row = 0; row < REVERSI_SIZE; row++) {
    for (let col = 0; col < REVERSI_SIZE; col++) {
      if (board[row][col] !== 'empty') continue
      if (getStonesFlipped(board, { row, col }, color).length > 0) {
        moves.push({ row, col })
      }
    }
  }
  return moves
}

export function countStones(board: Color[][]): { black: number; white: number } {
  let black = 0, white = 0
  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++
      else if (cell === 'white') white++
    }
  }
  return { black, white }
}

export function initReversiGame(): ReversiGameState {
  const state = createReversiGameState()
  return {
    ...state,
    validMoves: getValidMoves(state.board, 'black'),
  }
}

export function placeReversiStone(
  state: ReversiGameState,
  pos: Position
): ReversiPlaceResult {
  if (state.isGameOver) {
    return { success: false, error: 'game_over' }
  }

  const { board, currentTurn, moveHistory, consecutivePasses } = state

  // 유효성 검사
  const isValid = state.validMoves.some(
    v => v.row === pos.row && v.col === pos.col
  )
  if (!isValid) {
    return { success: false, error: 'invalid_move' }
  }

  // 뒤집기
  const flipped = getStonesFlipped(board, pos, currentTurn)
  const newBoard = board.map(r => [...r]) as Color[][]
  newBoard[pos.row][pos.col] = currentTurn
  for (const p of flipped) {
    newBoard[p.row][p.col] = currentTurn
  }

  const { black: blackCount, white: whiteCount } = countStones(newBoard)
  const opponent: 'black' | 'white' = currentTurn === 'black' ? 'white' : 'black'

  const record: ReversiMoveRecord = {
    position: pos,
    color: currentTurn,
    flipped: flipped.length,
    moveNumber: moveHistory.length + 1,
  }

  // 다음 플레이어 유효 수 계산
  const opponentMoves = getValidMoves(newBoard, opponent)
  const myMoves = getValidMoves(newBoard, currentTurn)

  let newIsGameOver = false
  let newWinner: 'black' | 'white' | null = null
  let newIsDraw = false
  let newCurrentTurn: 'black' | 'white' = opponent
  let newValidMoves: Position[] = opponentMoves
  let newConsecutivePasses = 0

  if (opponentMoves.length === 0 && myMoves.length === 0) {
    // 양쪽 모두 유효 수 없음 → 게임 종료
    newIsGameOver = true
    if (blackCount > whiteCount) newWinner = 'black'
    else if (whiteCount > blackCount) newWinner = 'white'
    else newIsDraw = true
  } else if (opponentMoves.length === 0) {
    // 상대방 유효 수 없음 → 상대 강제 패스, 현재 플레이어 계속
    newCurrentTurn = currentTurn
    newValidMoves = myMoves
    newConsecutivePasses = consecutivePasses + 1
  }
  // else: 정상 진행, consecutivePasses = 0

  const newState: ReversiGameState = {
    board: newBoard,
    currentTurn: newCurrentTurn,
    lastMove: pos,
    validMoves: newValidMoves,
    winner: newWinner,
    isDraw: newIsDraw,
    isGameOver: newIsGameOver,
    moveHistory: [...moveHistory, record],
    blackCount,
    whiteCount,
    consecutivePasses: newConsecutivePasses,
  }

  return { success: true, state: newState }
}
