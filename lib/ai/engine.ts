import { GameState, Position, Color } from '@/lib/go-engine/types'
import { getNeighbors } from '@/lib/go-engine/board'
import { findGroup, countLiberties, isSuicide, isKo } from '@/lib/go-engine/rules'

export type AIDifficulty = 'easy' | 'medium' | 'hard'

// Returns all positions where `color` can legally play
function getAllValidMoves(state: GameState, color: Color): Position[] {
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

// Returns all groups of `color` that have exactly 1 liberty
function getGroupsInAtari(
  board: Color[][],
  color: Color,
  size: number
): { group: Position[]; liberty: Position }[] {
  const visited = new Set<string>()
  const result: { group: Position[]; liberty: Position }[] = []

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== color) continue
      const key = `${row},${col}`
      if (visited.has(key)) continue

      const group = findGroup(board, { row, col })
      for (const p of group) visited.add(`${p.row},${p.col}`)

      const libertySet = new Set<string>()
      for (const p of group) {
        for (const nb of getNeighbors(p, size)) {
          if (board[nb.row][nb.col] === 'empty') {
            libertySet.add(`${nb.row},${nb.col}`)
          }
        }
      }

      if (libertySet.size === 1) {
        const [libertyKey] = libertySet
        const [r, c] = libertyKey.split(',').map(Number)
        result.push({ group, liberty: { row: r, col: c } })
      }
    }
  }

  return result
}

// Score a candidate move for the AI
function scoreMove(state: GameState, pos: Position, aiColor: Color): number {
  const { board, size } = state
  const opponentColor: Color = aiColor === 'white' ? 'black' : 'white'
  let score = 0

  // +1000 if it captures an opponent group in atari
  const opponentAtaris = getGroupsInAtari(board, opponentColor, size)
  for (const { liberty } of opponentAtaris) {
    if (liberty.row === pos.row && liberty.col === pos.col) {
      score += 1000
      break
    }
  }

  // +500 if it saves own group in atari
  const ownAtaris = getGroupsInAtari(board, aiColor, size)
  for (const { liberty } of ownAtaris) {
    if (liberty.row === pos.row && liberty.col === pos.col) {
      score += 500
      break
    }
  }

  const neighbors = getNeighbors(pos, size)
  let ownAdjacent = 0
  let opponentAdjacent = 0
  let emptyAdjacent = 0
  for (const nb of neighbors) {
    if (board[nb.row][nb.col] === aiColor) ownAdjacent++
    else if (board[nb.row][nb.col] === opponentColor) opponentAdjacent++
    else emptyAdjacent++
  }
  score += ownAdjacent * 10      // prefer connecting to own stones
  score += emptyAdjacent * 7     // prefer open positions (territory)
  score += opponentAdjacent * 4  // slight bonus for pressing opponent

  // Simulate placement to check resulting group's liberties
  const testBoard = board.map(r => [...r])
  testBoard[pos.row][pos.col] = aiColor
  const newGroup = findGroup(testBoard, pos)
  const newLiberties = countLiberties(testBoard, newGroup)
  if (newLiberties === 1) {
    score -= 30   // mild penalty for self-atari (was -200, too harsh)
  } else if (newLiberties >= 3) {
    score += 10   // bonus for a comfortable group
  }

  // Prefer center over edges (more influence)
  const half = (size - 1) / 2
  const centerDist = Math.abs(pos.row - half) + Math.abs(pos.col - half)
  score += Math.max(0, size - centerDist) * 0.8

  // Avoid 1st-line (edge) moves unless forced
  if (pos.row === 0 || pos.row === size - 1 || pos.col === 0 || pos.col === size - 1) {
    score -= 8
  }

  // Slight random noise
  score += Math.random() * 4

  return score
}

// Get star points for a given board size
function getStarPoints(size: number): Position[] {
  if (size === 9) {
    return [
      { row: 2, col: 2 }, { row: 2, col: 6 },
      { row: 4, col: 4 },
      { row: 6, col: 2 }, { row: 6, col: 6 },
    ]
  } else if (size === 13) {
    return [
      { row: 3, col: 3 }, { row: 3, col: 9 },
      { row: 6, col: 6 },
      { row: 9, col: 3 }, { row: 9, col: 9 },
    ]
  } else {
    // 19x19
    return [
      { row: 3, col: 3 }, { row: 3, col: 9 }, { row: 3, col: 15 },
      { row: 9, col: 3 }, { row: 9, col: 9 }, { row: 9, col: 15 },
      { row: 15, col: 3 }, { row: 15, col: 9 }, { row: 15, col: 15 },
    ]
  }
}

export function getAIMove(state: GameState, difficulty: AIDifficulty): Position | null {
  const aiColor: Color = 'white'
  const { size, moveHistory, board } = state
  const validMoves = getAllValidMoves(state, aiColor)

  if (validMoves.length === 0) return null

  if (difficulty === 'easy') {
    // Pass if game is too advanced
    if (moveHistory.length > size * size * 0.6) return null
    // Random valid move
    return validMoves[Math.floor(Math.random() * validMoves.length)]
  }

  if (difficulty === 'medium') {
    if (validMoves.length === 0) return null

    const scored = validMoves.map(pos => ({ pos, score: scoreMove(state, pos, aiColor) }))
    scored.sort((a, b) => b.score - a.score)

    // Immediate capture → take it
    if (scored[0].score >= 1000) return scored[0].pos

    // Weighted pick from top 5 — always pick a move, never pass voluntarily
    const top = scored.slice(0, Math.min(5, scored.length))
    const minScore = Math.min(...top.map(x => x.score))
    const weights = top.map(x => Math.max(x.score - minScore + 1, 1))
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = Math.random() * totalWeight
    for (let i = 0; i < top.length; i++) {
      rand -= weights[i]
      if (rand <= 0) return top[i].pos
    }
    return top[0].pos
  }

  // hard
  const starPoints = getStarPoints(size)
  const isOpening = moveHistory.length < 20

  const scored = validMoves.map(pos => {
    let s = scoreMove(state, pos, aiColor)
    if (isOpening) {
      const isStarPoint = starPoints.some(sp => sp.row === pos.row && sp.col === pos.col)
      // Only add star bonus if it's empty
      if (isStarPoint && board[pos.row][pos.col] === 'empty') s += 50
    }
    return { pos, score: s }
  })

  scored.sort((a, b) => b.score - a.score)

  // Pass only if no valid moves remain (game is truly over)
  if (validMoves.length === 0) return null

  return scored[0].pos
}
