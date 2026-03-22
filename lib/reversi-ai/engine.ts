import { ReversiGameState, REVERSI_SIZE } from '@/lib/reversi-engine/types'
import { getStonesFlipped, getValidMoves } from '@/lib/reversi-engine/rules'
import { Color, Position } from '@/lib/go-engine/types'

export type ReversiAIDifficulty = 'easy' | 'medium' | 'hard'

// 오델로 표준 위치 가중치 맵 (코너 최고, 코너 인접 최악)
const POSITION_WEIGHTS: number[][] = [
  [100, -20,  10,   5,   5,  10, -20, 100],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [ 10,  -2,   5,   1,   1,   5,  -2,  10],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [  5,  -2,   1,   0,   0,   1,  -2,   5],
  [ 10,  -2,   5,   1,   1,   5,  -2,  10],
  [-20, -50,  -2,  -2,  -2,  -2, -50, -20],
  [100, -20,  10,   5,   5,  10, -20, 100],
]

const CORNERS: Position[] = [
  { row: 0, col: 0 }, { row: 0, col: 7 },
  { row: 7, col: 0 }, { row: 7, col: 7 },
]

function isCorner(pos: Position): boolean {
  return CORNERS.some(c => c.row === pos.row && c.col === pos.col)
}

export function getReversiAIMove(
  state: ReversiGameState,
  difficulty: ReversiAIDifficulty
): Position | null {
  const { board, validMoves, currentTurn } = state

  if (validMoves.length === 0) return null

  if (difficulty === 'easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  if (difficulty === 'medium') {
    // 코너가 있으면 즉시 선택
    const corner = validMoves.find(isCorner)
    if (corner) return corner

    // 뒤집히는 돌 수 최대화 (greedy)
    let best: Position = validMoves[0]
    let bestFlipped = -1
    for (const pos of validMoves) {
      const flipped = getStonesFlipped(board, pos, currentTurn).length
      if (flipped > bestFlipped) {
        bestFlipped = flipped
        best = pos
      }
    }
    return best
  }

  // hard: 위치 가중치 + 뒤집 수 + 상대 기동성 억제
  const opponent: Color = currentTurn === 'black' ? 'white' : 'black'

  let best: Position = validMoves[0]
  let bestScore = -Infinity

  for (const pos of validMoves) {
    const flipped = getStonesFlipped(board, pos, currentTurn)
    const posWeight = POSITION_WEIGHTS[pos.row][pos.col]

    // 코너면 즉시 반환
    if (posWeight === 100) return pos

    // 뒤집기 시뮬레이션 후 상대 기동성 계산
    const testBoard = board.map(r => [...r]) as Color[][]
    testBoard[pos.row][pos.col] = currentTurn
    for (const p of flipped) testBoard[p.row][p.col] = currentTurn
    const opponentMobility = getValidMoves(testBoard, opponent).length

    const score =
      posWeight * 10 +
      flipped.length * 2 -
      opponentMobility * 3 +
      Math.random() * 2

    if (score > bestScore) {
      bestScore = score
      best = pos
    }
  }

  return best
}
