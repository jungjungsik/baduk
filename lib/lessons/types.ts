import { Color, BoardSize } from '@/lib/go-engine/types'

export type StepType = 'text' | 'interactive'

export interface StoneSetup {
  black: [number, number][]
  white: [number, number][]
}

export interface InteractiveTask {
  description: string
  targetPosition: [number, number]
  highlightPositions?: [number, number][]
  successMessage: string
}

export interface LessonStep {
  type: StepType
  title: string
  content: string
  boardSize?: BoardSize
  stones?: StoneSetup
  task?: InteractiveTask
  lastMove?: [number, number]
  highlightPositions?: [number, number][]
}

export interface Lesson {
  id: string
  title: string
  category: string
  categoryLabel: string
  duration: string
  xpReward: number
  description: string
  steps: LessonStep[]
}

// Suppress unused import warning — Color is re-exported for consumers
export type { Color }
