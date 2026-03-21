'use client'

import { useState, useCallback, use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import GoBoard from '@/components/board/GoBoard'
import { getPuzzleById, PUZZLES } from '@/lib/puzzles/data'
import { Color, Position } from '@/lib/go-engine/types'
import { captureDeadStones } from '@/lib/go-engine/rules'
import { useUserStore } from '@/lib/store/userStore'
import Link from 'next/link'

function buildInitialBoard(size: number, stones: { black: [number,number][], white: [number,number][] }): Color[][] {
  const board: Color[][] = Array.from({ length: size }, () => Array(size).fill('empty') as Color[])
  for (const [r, c] of stones.black) board[r][c] = 'black'
  for (const [r, c] of stones.white) board[r][c] = 'white'
  return board
}

export default function PuzzleSolvePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const puzzle = getPuzzleById(id)
  const router = useRouter()
  const { completePuzzle, completedPuzzles } = useUserStore()

  if (!puzzle) notFound()

  const initialBoard = buildInitialBoard(puzzle.boardSize, puzzle.stones)
  const [board, setBoard] = useState<Color[][]>(initialBoard)
  const [showHint, setShowHint] = useState(false)
  const [status, setStatus] = useState<'playing' | 'correct' | 'wrong'>('playing')
  const [moveCount, setMoveCount] = useState(0)
  const [lastMove, setLastMove] = useState<Position | null>(null)

  const alreadySolved = completedPuzzles.includes(puzzle.id)

  const currentPuzzleIndex = PUZZLES.findIndex(p => p.id === id)
  const nextPuzzle = PUZZLES[currentPuzzleIndex + 1]

  const handleMove = useCallback((pos: Position) => {
    if (status !== 'playing') return
    if (board[pos.row][pos.col] !== 'empty') return

    const expectedMove = puzzle.solution[moveCount]
    const isCorrect = expectedMove &&
      expectedMove[0] === pos.row &&
      expectedMove[1] === pos.col

    const newBoard = board.map(row => [...row]) as Color[][]
    newBoard[pos.row][pos.col] = puzzle.turn
    const { board: afterCapture } = captureDeadStones(newBoard, pos, puzzle.turn)
    setBoard(afterCapture)
    setLastMove(pos)

    if (isCorrect) {
      const nextMoveCount = moveCount + 1
      if (nextMoveCount >= puzzle.solution.length) {
        setStatus('correct')
        if (!alreadySolved) completePuzzle(puzzle.id, puzzle.xpReward)
      } else {
        setMoveCount(nextMoveCount)
      }
    } else {
      setStatus('wrong')
      setTimeout(() => {
        setBoard(initialBoard)
        setLastMove(null)
        setStatus('playing')
        setMoveCount(0)
      }, 1200)
    }
  }, [board, status, moveCount, puzzle, initialBoard, alreadySolved, completePuzzle])

  const handleReset = () => {
    setBoard(initialBoard)
    setLastMove(null)
    setStatus('playing')
    setMoveCount(0)
    setShowHint(false)
  }

  const LEVEL_COLORS: Record<string, string> = {
    beginner: '#f4e3ce',
    elementary: '#e8e2d6',
    intermediate: '#eae8de',
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fffcf7' }}>
      {/* 헤더 */}
      <header className="sticky top-0 z-40 backdrop-blur-md px-5 py-3 border-b" style={{ backgroundColor: 'rgba(255,252,247,0.9)', borderColor: '#eae8de' }}>
        <div className="flex items-center justify-between max-w-lg lg:max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/puzzle" className="w-9 h-9 flex items-center justify-center rounded-full" style={{ backgroundColor: '#f0eee5' }}>
              <span className="material-symbols-outlined" style={{ color: '#5f5e5e' }}>arrow_back</span>
            </Link>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#65655c' }}>
                {puzzle.levelLabel} · {puzzle.objectiveLabel}
              </p>
              <h1 className="font-headline font-bold text-base leading-tight">{puzzle.title}</h1>
            </div>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: LEVEL_COLORS[puzzle.level], color: '#5d5242' }}
          >
            +{puzzle.xpReward} XP
          </span>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-3xl mx-auto px-4 py-5 lg:grid lg:grid-cols-2 lg:gap-8">
        {/* 왼쪽: 바둑판 */}
        <div className="space-y-4">
          {/* 상태 메시지 */}
          {status === 'correct' && (
            <div className="rounded-xl px-4 py-3 text-center font-bold text-sm"
              style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}>
              정답입니다! +{puzzle.xpReward} XP 획득
            </div>
          )}
          {status === 'wrong' && (
            <div className="rounded-xl px-4 py-3 text-center font-bold text-sm"
              style={{ backgroundColor: '#fee2e2', color: '#a54731' }}>
              틀렸습니다. 다시 시도하세요.
            </div>
          )}
          {status === 'playing' && (
            <div className="rounded-xl px-4 py-3 text-center text-sm font-medium"
              style={{ backgroundColor: '#f6f4ec', color: '#65655c' }}>
              {puzzle.turn === 'black' ? '흑' : '백'}의 차례 -- {puzzle.objectiveLabel}하세요
            </div>
          )}

          {/* 바둑판 */}
          <div className="shadow-xl">
            <GoBoard
              board={board}
              size={puzzle.boardSize}
              lastMove={lastMove}
              onIntersectionClick={handleMove}
              disabled={status === 'correct'}
              highlightPositions={showHint ? [{ row: puzzle.hint[0], col: puzzle.hint[1] }] : []}
            />
          </div>

          {/* 컨트롤 버튼 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleReset}
              className="py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: '#e8e2d6', color: '#555248' }}
            >
              <span className="material-symbols-outlined text-lg">undo</span>
              초기화
            </button>
            <button
              onClick={() => setShowHint(!showHint)}
              className="py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
              style={{ backgroundColor: '#f4e3ce', color: '#5d5242' }}
            >
              <span className="material-symbols-outlined text-lg">lightbulb</span>
              {showHint ? '힌트 숨기기' : '힌트 보기'}
            </button>
          </div>
        </div>

        {/* 오른쪽: 문제 설명 + 다음 문제 */}
        <div className="space-y-4 mt-4 lg:mt-0">
          {/* 문제 설명 */}
          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: '#f6f4ec' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: '#6f6252' }}>info</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#65655c' }}>문제 설명</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#383831' }}>{puzzle.description}</p>
          </div>

          {/* 바둑 상식 카드 */}
          <div className="rounded-2xl p-5 space-y-2" style={{ backgroundColor: '#f4e3ce' }}>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm" style={{ color: '#6f6252' }}>auto_stories</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#5d5242' }}>바둑 용어</span>
            </div>
            <h4 className="font-headline font-bold text-base" style={{ color: '#383831' }}>
              {puzzle.objectiveLabel}이란?
            </h4>
            <p className="text-xs leading-relaxed" style={{ color: '#65655c' }}>
              {puzzle.objective === 'capture' && '상대방 돌의 활로(숨쉬는 공간)를 모두 막아서 돌을 잡는 것입니다. 잡힌 돌은 게임 종료 시 집 계산에 영향을 줍니다.'}
              {puzzle.objective === 'live' && '자신의 돌 그룹 안에 두 개 이상의 집(눈)을 만들어 상대가 잡을 수 없게 하는 것입니다.'}
              {puzzle.objective === 'kill' && '상대 돌 그룹이 두 집을 만들지 못하도록 방해해서 결국 잡히게 만드는 것입니다.'}
            </p>
          </div>

          {/* 정답 시 다음 문제 버튼 */}
          {status === 'correct' && nextPuzzle && (
            <Link
              href={`/puzzle/${nextPuzzle.id}`}
              className="w-full py-4 rounded-xl font-headline font-bold text-base text-center flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
              style={{ backgroundColor: '#383831', color: '#fffcf7' }}
            >
              다음 문제
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          )}
          {status === 'correct' && !nextPuzzle && (
            <Link
              href="/puzzle"
              className="w-full py-4 rounded-xl font-headline font-bold text-base text-center flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
              style={{ backgroundColor: '#383831', color: '#fffcf7' }}
            >
              문제 목록으로
              <span className="material-symbols-outlined">list</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
