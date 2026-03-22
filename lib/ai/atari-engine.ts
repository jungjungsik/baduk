import { GameState, Position, Color } from '@/lib/go-engine/types'
import { isSuicide, isKo, captureDeadStones, findGroup, countLiberties } from '@/lib/go-engine/rules'
import { cloneBoard, getNeighbors } from '@/lib/go-engine/board'

export type AtariAIDifficulty = 'easy' | 'medium' | 'hard'

// aiColor에 대한 합법적 착수 위치 목록
function getValidMoves(state: GameState, color: Color): Position[] {
  const { board, size } = state
  const moves: Position[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const pos: Position = { row, col }
      if (board[row][col] !== 'empty') continue
      if (isKo(state, pos)) continue
      if (isSuicide(board, pos, color)) continue
      moves.push(pos)
    }
  }
  return moves
}

// 이 수를 두면 상대 돌을 따내는지 확인
function willCapture(board: Color[][], pos: Position, color: Color): boolean {
  const testBoard = cloneBoard(board)
  testBoard[pos.row][pos.col] = color
  const { captured } = captureDeadStones(testBoard, pos, color)
  return captured > 0
}

// 내 돌 중 단수(활로 1)인 그룹들의 유일한 활로 위치 반환
function getSaveMoves(board: Color[][], color: Color, size: number): Position[] {
  const visited = new Set<string>()
  const saves: Position[] = []

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== color) continue
      const key = `${row},${col}`
      if (visited.has(key)) continue

      const group = findGroup(board, { row, col })
      for (const p of group) visited.add(`${p.row},${p.col}`)

      if (countLiberties(board, group) === 1) {
        // 단수 상태 — 활로 위치 찾기
        for (const p of group) {
          for (const nb of getNeighbors(p, size)) {
            if (board[nb.row][nb.col] === 'empty') {
              saves.push(nb)
            }
          }
        }
      }
    }
  }
  return saves
}

// 상대 돌을 단수에 몰아넣는 수 찾기
function getThreatMoves(board: Color[][], pos: Position, color: Color, size: number): boolean {
  const testBoard = cloneBoard(board)
  testBoard[pos.row][pos.col] = color
  const opponent: Color = color === 'black' ? 'white' : 'black'

  const visited = new Set<string>()
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (testBoard[row][col] !== opponent) continue
      const key = `${row},${col}`
      if (visited.has(key)) continue
      const group = findGroup(testBoard, { row, col })
      for (const p of group) visited.add(`${p.row},${p.col}`)
      if (countLiberties(testBoard, group) === 1) return true
    }
  }
  return false
}

export function getAtariAIMove(
  state: GameState,
  difficulty: AtariAIDifficulty
): Position | null {
  const aiColor = state.currentTurn
  const { board, size } = state
  const validMoves = getValidMoves(state, aiColor)

  if (validMoves.length === 0) return null

  // Priority 1 (모든 난이도): 즉시 따냄 → 즉시 승리
  for (const pos of validMoves) {
    if (willCapture(board, pos, aiColor)) return pos
  }

  if (difficulty === 'easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // Priority 2 (medium+): 내 단수 그룹 살리기
  const saveMoves = getSaveMoves(board, aiColor, size)
  const validSaves = saveMoves.filter(s =>
    validMoves.some(v => v.row === s.row && v.col === s.col)
  )
  if (validSaves.length > 0) {
    return validSaves[Math.floor(Math.random() * validSaves.length)]
  }

  // Priority 3 (medium+): 상대를 단수에 몰기
  const threatMoves = validMoves.filter(pos => getThreatMoves(board, pos, aiColor, size))
  if (threatMoves.length > 0) {
    return threatMoves[Math.floor(Math.random() * threatMoves.length)]
  }

  if (difficulty === 'medium') {
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  // hard: Priority 4 — 중앙 지향 + 상대 활로 줄이기
  const opponent: Color = aiColor === 'black' ? 'white' : 'black'
  const half = (size - 1) / 2

  const scored = validMoves.map(pos => {
    const testBoard = cloneBoard(board)
    testBoard[pos.row][pos.col] = aiColor

    // 상대 총 활로 수 계산 (낮을수록 좋음)
    let opponentLiberties = 0
    const visited = new Set<string>()
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (testBoard[r][c] !== opponent) continue
        const key = `${r},${c}`
        if (visited.has(key)) continue
        const group = findGroup(testBoard, { row: r, col: c })
        for (const p of group) visited.add(`${p.row},${p.col}`)
        opponentLiberties += countLiberties(testBoard, group)
      }
    }

    const centerDist = Math.abs(pos.row - half) + Math.abs(pos.col - half)
    const centerScore = Math.max(0, size - centerDist)
    const score = -opponentLiberties * 2 + centerScore + Math.random() * 3

    return { pos, score }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0].pos
}
