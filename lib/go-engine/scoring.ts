import { Color, GameState, Position } from './types'
import { getNeighbors } from './board'

export interface ScoreResult {
  blackTerritory: number
  whiteTerritory: number
  blackCaptured: number
  whiteCaptured: number
  komi: number
  blackTotal: number
  whiteTotal: number
  winner: 'black' | 'white' | 'draw'
  margin: number
}

// 중국식 집 계산 (영역 + 돌 수)
export function calculateScore(state: GameState): ScoreResult {
  const { board, size, capturedBlack, capturedWhite, komi } = state
  let blackTerritory = 0
  let whiteTerritory = 0

  const visited = new Set<string>()

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r},${c}`
      if (visited.has(key) || board[r][c] !== 'empty') continue

      // BFS로 빈 지역 탐색
      const region: Position[] = []
      const borderingColors = new Set<Color>()
      const queue: Position[] = [{ row: r, col: c }]

      while (queue.length > 0) {
        const pos = queue.shift()!
        const posKey = `${pos.row},${pos.col}`
        if (visited.has(posKey)) continue
        visited.add(posKey)
        region.push(pos)

        for (const neighbor of getNeighbors(pos, size)) {
          const neighborColor = board[neighbor.row][neighbor.col]
          if (neighborColor === 'empty') {
            queue.push(neighbor)
          } else {
            borderingColors.add(neighborColor)
          }
        }
      }

      // 한 색만 접해있으면 해당 색의 집
      if (borderingColors.size === 1) {
        const [owner] = borderingColors
        if (owner === 'black') blackTerritory += region.length
        else if (owner === 'white') whiteTerritory += region.length
      }
    }
  }

  // 중국식: 집 + 잡힌 돌 (일본식은 집 + 상대가 잡은 돌)
  // 여기서는 일본식으로 계산 (capturedWhite = 백이 잡힌 수 = 흑 점수)
  const blackTotal = blackTerritory + capturedWhite
  const whiteTotal = whiteTerritory + capturedBlack + komi

  const margin = blackTotal - whiteTotal
  const winner = margin > 0 ? 'black' : margin < 0 ? 'white' : 'draw'

  return {
    blackTerritory,
    whiteTerritory,
    blackCaptured: capturedBlack,
    whiteCaptured: capturedWhite,
    komi,
    blackTotal,
    whiteTotal,
    winner,
    margin: Math.abs(margin),
  }
}
