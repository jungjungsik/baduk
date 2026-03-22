import { OmokGameState } from '@/lib/omok-engine/types'
import { Color, Position } from '@/lib/go-engine/types'

export type OmokAIDifficulty = 'easy' | 'medium' | 'hard'

const DIRECTIONS = [
  [0, 1], [1, 0], [1, 1], [1, -1],
] as const

function getEmptyPositions(board: Color[][], size: number): Position[] {
  const positions: Position[] = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === 'empty') positions.push({ row: r, col: c })
    }
  }
  return positions
}

function getCenterBias(pos: Position, size: number): number {
  const center = (size - 1) / 2
  const dist = Math.abs(pos.row - center) + Math.abs(pos.col - center)
  return Math.max(0, size - dist)
}

// 특정 방향으로 연속된 색 돌 개수 세기
function countInDirection(
  board: Color[][],
  row: number,
  col: number,
  color: Color,
  dr: number,
  dc: number,
  size: number
): { count: number; openEnds: number } {
  let count = 1
  let openEnds = 0

  let r = row + dr, c = col + dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === color) {
    count++; r += dr; c += dc
  }
  if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === 'empty') openEnds++

  r = row - dr; c = col - dc
  while (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === color) {
    count++; r -= dr; c -= dc
  }
  if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === 'empty') openEnds++

  return { count, openEnds }
}

// 특정 위치에 놓았을 때의 위협 점수 계산
function scorePosition(
  board: Color[][],
  pos: Position,
  color: Color,
  size: number
): number {
  const tempBoard = board.map(r => [...r])
  tempBoard[pos.row][pos.col] = color

  let score = 0
  for (const [dr, dc] of DIRECTIONS) {
    const { count, openEnds } = countInDirection(
      tempBoard, pos.row, pos.col, color, dr, dc, size
    )
    if (count >= 5) score += 100000      // 즉시 승리
    else if (count === 4 && openEnds >= 1) score += 5000   // 열린 4
    else if (count === 4 && openEnds === 0) score += 100    // 막힌 4
    else if (count === 3 && openEnds === 2) score += 1000   // 열린 3
    else if (count === 3 && openEnds === 1) score += 100    // 반열린 3
    else if (count === 2 && openEnds === 2) score += 50     // 열린 2
  }
  return score
}

export function getOmokAIMove(
  state: OmokGameState,
  difficulty: OmokAIDifficulty
): Position | null {
  const { board, size, currentTurn } = state
  const opponent: Color = currentTurn === 'black' ? 'white' : 'black'
  const emptyPositions = getEmptyPositions(board, size)

  if (emptyPositions.length === 0) return null

  if (difficulty === 'easy') {
    // 즉시 승리 가능하면 두기, 아니면 랜덤
    for (const pos of emptyPositions) {
      const attackScore = scorePosition(board, pos, currentTurn, size)
      if (attackScore >= 100000) return pos
    }
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
  }

  // medium / hard: 각 위치 점수 평가
  let bestPos: Position | null = null
  let bestScore = -Infinity

  for (const pos of emptyPositions) {
    const attackScore = scorePosition(board, pos, currentTurn, size)
    const defenseScore = scorePosition(board, pos, opponent, size)

    let score: number
    if (difficulty === 'medium') {
      // 공격이 즉시승리면 우선, 수비가 즉시패배 방지면 우선, 나머지는 공격우선
      score = Math.max(attackScore, defenseScore * 0.9)
    } else {
      // hard: 공격+수비 복합 점수 + 중앙 가중치
      score = attackScore + defenseScore * 0.8 + getCenterBias(pos, size) * 2
    }

    if (score > bestScore) {
      bestScore = score
      bestPos = pos
    }
  }

  return bestPos
}
