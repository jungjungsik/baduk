import { Color, BoardSize } from '@/lib/go-engine/types'

export type PuzzleLevel = 'beginner' | 'elementary' | 'intermediate'
export type PuzzleObjective = 'capture' | 'live' | 'kill'

export interface PuzzleStone {
  black: [number, number][]  // [row, col]
  white: [number, number][]
}

export interface Puzzle {
  id: string
  title: string
  description: string
  level: PuzzleLevel
  levelLabel: string
  objective: PuzzleObjective
  objectiveLabel: string
  turn: Color  // whose turn
  boardSize: BoardSize
  stones: PuzzleStone
  solution: [number, number][]  // correct moves in order
  hint: [number, number]       // first move hint
  xpReward: number
}
