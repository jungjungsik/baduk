import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
  // 프로필
  nickname: string
  avatarUrl: string | null

  // 진행 상황
  xp: number
  streak: number
  lastStudyDate: string | null
  completedLessons: string[]
  completedPuzzles: string[]

  // 통계
  totalGamesPlayed: number
  totalGamesWon: number
  totalPuzzlesSolved: number

  // Actions
  addXp: (amount: number) => void
  updateStreak: () => void
  completeLesson: (lessonId: string, xpReward: number) => void
  completePuzzle: (puzzleId: string, xpReward: number) => void
  recordGame: (won: boolean) => void
  setNickname: (nickname: string) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      nickname: '바둑 입문자',
      avatarUrl: null,
      xp: 450,
      streak: 12,
      lastStudyDate: null,
      completedLessons: [],
      completedPuzzles: [],
      totalGamesPlayed: 0,
      totalGamesWon: 0,
      totalPuzzlesSolved: 0,

      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),

      updateStreak: () => {
        const today = new Date().toDateString()
        const { lastStudyDate } = get()
        if (lastStudyDate === today) return

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const isConsecutive = lastStudyDate === yesterday.toDateString()

        set((state) => ({
          streak: isConsecutive ? state.streak + 1 : 1,
          lastStudyDate: today,
        }))
      },

      completeLesson: (lessonId, xpReward) => {
        set((state) => {
          if (state.completedLessons.includes(lessonId)) return state
          return {
            completedLessons: [...state.completedLessons, lessonId],
            xp: state.xp + xpReward,
          }
        })
        get().updateStreak()
      },

      completePuzzle: (puzzleId, xpReward) => {
        set((state) => {
          if (state.completedPuzzles.includes(puzzleId)) return state
          return {
            completedPuzzles: [...state.completedPuzzles, puzzleId],
            xp: state.xp + xpReward,
            totalPuzzlesSolved: state.totalPuzzlesSolved + 1,
          }
        })
        get().updateStreak()
      },

      recordGame: (won) => {
        set((state) => ({
          totalGamesPlayed: state.totalGamesPlayed + 1,
          totalGamesWon: won ? state.totalGamesWon + 1 : state.totalGamesWon,
        }))
      },

      setNickname: (nickname) => set({ nickname }),
    }),
    {
      name: 'heukbaek-user',
    }
  )
)
