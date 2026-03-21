'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import GoBoard from '@/components/board/GoBoard'
import { useUserStore } from '@/lib/store/userStore'
import { getLessonById, getNextLesson } from '@/lib/lessons/data'
import { createBoard } from '@/lib/go-engine/board'
import { captureDeadStones } from '@/lib/go-engine/rules'
import { Lesson, LessonStep } from '@/lib/lessons/types'
import { Color, Position } from '@/lib/go-engine/types'

function buildBoard(step: LessonStep): Color[][] {
  const size = step.boardSize ?? 9
  const board = createBoard(size)
  if (step.stones) {
    for (const [r, c] of step.stones.black) {
      board[r][c] = 'black'
    }
    for (const [r, c] of step.stones.white) {
      board[r][c] = 'white'
    }
  }
  return board
}

export default function PracticeLessonPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [interactiveBoard, setInteractiveBoard] = useState<Color[][] | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [completed, setCompleted] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const [showHint, setShowHint] = useState(false)

  const completeLesson = useUserStore((s) => s.completeLesson)
  const completedLessons = useUserStore((s) => s.completedLessons)

  useEffect(() => {
    const found = getLessonById(id)
    if (!found) {
      router.replace('/study')
      return
    }
    setLesson(found)
  }, [id, router])

  const currentStep = lesson?.steps[stepIndex]

  // Reset interactive board and hint when step changes
  useEffect(() => {
    if (!currentStep) return
    if (currentStep.type === 'interactive') {
      setInteractiveBoard(buildBoard(currentStep))
    } else {
      setInteractiveBoard(null)
    }
    setFeedback(null)
    setAdvancing(false)
    setShowHint(false)
  }, [stepIndex, currentStep])

  const handleNext = useCallback(() => {
    if (!lesson) return
    if (stepIndex < lesson.steps.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      // Last step — mark complete
      completeLesson(lesson.id, lesson.xpReward)
      setCompleted(true)
    }
  }, [lesson, stepIndex, completeLesson])

  const handleIntersectionClick = useCallback(
    (pos: Position) => {
      if (!currentStep || currentStep.type !== 'interactive' || !currentStep.task) return
      if (advancing) return

      const [targetRow, targetCol] = currentStep.task.targetPosition
      const isCorrect = pos.row === targetRow && pos.col === targetCol

      if (isCorrect) {
        // Place stone and apply captures using the game engine
        if (interactiveBoard) {
          const newBoard = interactiveBoard.map((row) => [...row])
          newBoard[pos.row][pos.col] = 'black'
          const { board: afterCapture } = captureDeadStones(newBoard, pos, 'black')
          setInteractiveBoard(afterCapture)
        }
        setFeedback({ type: 'success', message: currentStep.task.successMessage })
        setAdvancing(true)
        setTimeout(() => {
          handleNext()
        }, 1800)
      } else {
        setFeedback({ type: 'error', message: '틀렸습니다. 다시 생각해보세요.' })
        setTimeout(() => setFeedback(null), 1200)
      }
    },
    [currentStep, advancing, interactiveBoard, handleNext]
  )

  if (!lesson || !currentStep) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="text-on-surface-variant text-sm">로딩 중...</span>
      </div>
    )
  }

  if (completed) {
    const alreadyHad = completedLessons.includes(lesson.id)
    const nextLesson = getNextLesson(lesson.id)
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-5 gap-6 text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#f4e3ce' }}
          >
            <span className="material-symbols-outlined text-4xl" style={{ color: '#6f6252' }}>
              workspace_premium
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="font-headline font-bold text-2xl">레슨 완료!</h2>
            <p className="text-on-surface-variant text-sm">{lesson.title}</p>
          </div>
          {!alreadyHad && (
            <div
              className="px-6 py-3 rounded-2xl flex items-center gap-2"
              style={{ backgroundColor: '#f4e3ce' }}
            >
              <span className="material-symbols-outlined" style={{ color: '#6f6252' }}>
                star
              </span>
              <span className="font-bold text-sm" style={{ color: '#6f6252' }}>
                +{lesson.xpReward} XP 획득!
              </span>
            </div>
          )}
          <div className="flex gap-3 mt-2 flex-wrap justify-center">
            <Link
              href="/study"
              className="px-6 py-3 rounded-2xl text-sm font-bold border border-outline-variant text-on-surface"
            >
              스터디로 돌아가기
            </Link>
            {nextLesson ? (
              <Link
                href={`/practice/${nextLesson.id}`}
                className="px-6 py-3 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}
              >
                다음 레슨: {nextLesson.title}
              </Link>
            ) : (
              <Link
                href="/study"
                className="px-6 py-3 rounded-2xl text-sm font-bold"
                style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}
              >
                모든 레슨 보기
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const totalSteps = lesson.steps.length
  const progress = ((stepIndex + 1) / totalSteps) * 100

  const stepBoard = currentStep.type === 'text' && currentStep.stones ? buildBoard(currentStep) : null
  const lastMovePos: Position | null = currentStep.lastMove
    ? { row: currentStep.lastMove[0], col: currentStep.lastMove[1] }
    : null

  // Highlight positions: text steps use step.highlightPositions directly;
  // interactive steps show task.highlightPositions only when hint is toggled on.
  const highlightPos: Position[] = (() => {
    if (currentStep.type === 'text' && currentStep.highlightPositions) {
      return currentStep.highlightPositions.map(([r, c]) => ({ row: r, col: c }))
    }
    if (currentStep.type === 'interactive' && showHint && currentStep.task?.highlightPositions) {
      return currentStep.task.highlightPositions.map(([r, c]) => ({ row: r, col: c }))
    }
    return []
  })()

  const showBoard =
    currentStep.boardSize !== undefined &&
    (currentStep.type === 'interactive' || (currentStep.type === 'text' && currentStep.stones !== undefined))

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/study" className="text-on-surface-variant active:opacity-60">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-on-surface-variant font-medium">
                {lesson.title}
              </span>
              <span className="text-xs text-on-surface-variant">
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, backgroundColor: '#6f6252' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-5 py-6 flex flex-col gap-5">
        {/* Step title */}
        <div>
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: '#6f6252' }}
          >
            {lesson.categoryLabel}
          </span>
          <h2 className="font-headline font-bold text-xl mt-1">{currentStep.title}</h2>
        </div>

        {/* Content text — shown FIRST */}
        <div className="space-y-1">
          {currentStep.content.split('\n').map((line, i) =>
            line === '' ? (
              <div key={i} className="h-2" />
            ) : (
              <p key={i} className="text-sm text-on-surface leading-relaxed">
                {line}
              </p>
            )
          )}
        </div>

        {/* Board — shown AFTER text */}
        {showBoard && (
          <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3">
            {currentStep.type === 'interactive' && interactiveBoard ? (
              <GoBoard
                board={interactiveBoard}
                size={currentStep.boardSize ?? 9}
                lastMove={lastMovePos}
                onIntersectionClick={handleIntersectionClick}
                highlightPositions={highlightPos}
                disabled={advancing}
              />
            ) : stepBoard ? (
              <GoBoard
                board={stepBoard}
                size={currentStep.boardSize ?? 9}
                lastMove={lastMovePos}
                highlightPositions={highlightPos}
                disabled={true}
              />
            ) : null}

            {/* Hint toggle — only for interactive steps */}
            {currentStep.type === 'interactive' && !feedback && !advancing && (
              <button
                onClick={() => setShowHint((h) => !h)}
                className="text-xs text-on-surface-variant underline self-center"
              >
                {showHint ? '힌트 숨기기' : '힌트 보기'}
              </button>
            )}
          </div>
        )}

        {/* Task description for interactive steps */}
        {currentStep.type === 'interactive' && currentStep.task && !feedback && (
          <div
            className="px-4 py-3 rounded-2xl text-sm"
            style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}
          >
            <span className="material-symbols-outlined text-base align-middle mr-1">
              touch_app
            </span>
            {currentStep.task.description}
          </div>
        )}

        {/* Feedback banner */}
        {feedback && (
          <div
            className="px-4 py-3 rounded-2xl text-sm font-medium text-center transition-all"
            style={{
              backgroundColor: feedback.type === 'success' ? '#f4e3ce' : '#fde8e8',
              color: feedback.type === 'success' ? '#5d5242' : '#a54731',
            }}
          >
            {feedback.type === 'success' ? '✓ ' : '✗ '}
            {feedback.message}
          </div>
        )}
      </div>

      {/* Bottom action — only for text steps */}
      {currentStep.type === 'text' && (
        <div className="px-5 pb-8 max-w-lg mx-auto w-full">
          <button
            onClick={handleNext}
            className="w-full py-4 rounded-2xl font-bold text-sm transition-transform active:scale-[0.98]"
            style={{ backgroundColor: '#383831', color: '#fffcf7' }}
          >
            {stepIndex < totalSteps - 1 ? '다음' : '완료'}
          </button>
        </div>
      )}
    </div>
  )
}
