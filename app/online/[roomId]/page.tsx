'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import GoBoard from '@/components/board/GoBoard'
import { useOnlineStore } from '@/lib/store/onlineStore'
import { onAuthChanged } from '@/lib/firebase/auth'
import {
  subscribeRoom,
  pushMove,
  pushPass,
  resign,
  type RoomData,
} from '@/lib/firebase/roomService'
import { placeStone, pass } from '@/lib/go-engine/rules'
import { calculateScore, type ScoreResult } from '@/lib/go-engine/scoring'
import type { Color, GameState, BoardSize, Position } from '@/lib/go-engine/types'

function roomGameToGameState(room: RoomData): GameState {
  const boardSize = room.boardSize as BoardSize
  return {
    board: room.game.board,
    size: boardSize,
    currentTurn: room.game.currentTurn as Color,
    capturedBlack: room.game.capturedBlack,
    capturedWhite: room.game.capturedWhite,
    lastMove: room.game.lastMove,
    koPoint: room.game.koPoint,
    moveHistory: [],
    passes: room.game.passes,
    isGameOver: room.game.isGameOver,
    komi: 6.5,
  }
}

export default function OnlineGamePage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const { user, setUser, myColor, setRoom, roomData, setRoomData, clearRoom } = useOnlineStore()
  const [authLoaded, setAuthLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const prevStatusRef = useRef<string | null>(null)

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      setUser(firebaseUser)
      setAuthLoaded(true)
    })
    return unsubscribe
  }, [setUser])

  // Subscribe to room data
  useEffect(() => {
    if (!roomId) return
    const unsubscribe = subscribeRoom(roomId, (data) => {
      setRoomData(data)

      if (data && !myColor) {
        // Determine my color from room data
        if (user && data.players.black?.uid === user.uid) {
          setRoom(roomId, 'black')
        } else if (user && data.players.white?.uid === user.uid) {
          setRoom(roomId, 'white')
        }
      }

      // Detect game end
      if (data && data.status === 'finished' && prevStatusRef.current !== 'finished') {
        if (data.game.isGameOver && (!data.result || data.result.reason === 'score')) {
          const gs = roomGameToGameState(data)
          const scoreResult = calculateScore(gs)
          setScore(scoreResult)
        }
        setShowResult(true)
      }
      prevStatusRef.current = data?.status ?? null
    })
    return unsubscribe
  }, [roomId, user, myColor, setRoomData, setRoom])

  const handleMove = useCallback(async (pos: Position) => {
    if (!roomData || !myColor || !user) return
    if (roomData.status !== 'playing') return
    if (roomData.game.currentTurn !== myColor) return

    const gameState = roomGameToGameState(roomData)
    const result = placeStone(gameState, pos, myColor as Color)

    if (!result.success) {
      const messages: Record<string, string> = {
        occupied: '이미 돌이 있습니다',
        suicide: '자충수는 둘 수 없습니다',
        ko: '패입니다. 다른 곳에 두세요',
        game_over: '게임이 종료되었습니다',
      }
      setError(messages[result.error] || '착수 오류')
      setTimeout(() => setError(null), 2000)
      return
    }

    const newState = result.state
    const nextTurn = myColor === 'black' ? 'white' : 'black'

    try {
      await pushMove(
        roomId,
        newState.board,
        pos,
        nextTurn,
        newState.koPoint,
        newState.capturedBlack,
        newState.capturedWhite
      )
    } catch {
      setError('서버 오류. 다시 시도해주세요.')
      setTimeout(() => setError(null), 2000)
    }
  }, [roomData, myColor, user, roomId])

  const handlePass = useCallback(async () => {
    if (!roomData || !myColor) return
    if (roomData.status !== 'playing') return
    if (roomData.game.currentTurn !== myColor) return

    const gameState = roomGameToGameState(roomData)
    const newState = pass(gameState)
    const nextTurn = myColor === 'black' ? 'white' : 'black'

    try {
      await pushPass(roomId, nextTurn, newState.passes, newState.isGameOver)
    } catch {
      setError('서버 오류. 다시 시도해주세요.')
      setTimeout(() => setError(null), 2000)
    }
  }, [roomData, myColor, roomId])

  const handleResign = useCallback(async () => {
    if (!myColor) return
    if (!confirm('정말 기권하시겠습니까?')) return
    try {
      await resign(roomId, myColor)
    } catch {
      setError('기권 처리 실패')
    }
  }, [roomId, myColor])

  const handleBack = useCallback(() => {
    if (roomData?.status === 'playing') {
      if (confirm('게임을 포기하시겠습니까?')) {
        if (myColor) {
          resign(roomId, myColor).catch(() => {})
        }
        clearRoom()
        router.push('/online')
      }
    } else {
      clearRoom()
      router.push('/online')
    }
  }, [roomData, myColor, roomId, clearRoom, router])

  const handleGoHome = useCallback(() => {
    clearRoom()
    router.push('/online')
  }, [clearRoom, router])

  // Loading state
  if (!authLoaded) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 gap-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant">lock</span>
        <p className="text-on-surface-variant">로그인이 필요합니다</p>
        <button
          onClick={() => router.push('/online')}
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold"
        >
          로그인하기
        </button>
      </div>
    )
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 gap-4">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant animate-spin">progress_activity</span>
        <p className="text-on-surface-variant">방 정보를 불러오는 중...</p>
      </div>
    )
  }

  // Waiting for opponent
  if (roomData.status === 'waiting') {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5 gap-6">
        <span className="material-symbols-outlined text-5xl text-tertiary animate-pulse">hourglass_top</span>
        <div className="text-center space-y-2">
          <h2 className="font-headline font-bold text-xl">상대방 대기중</h2>
          <p className="text-on-surface-variant text-sm">방 코드를 공유해주세요</p>
          <p className="font-headline font-extrabold text-3xl tracking-widest mt-4">{roomId}</p>
        </div>
        <button
          onClick={handleBack}
          className="px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm"
        >
          나가기
        </button>
      </div>
    )
  }

  const gameState = roomGameToGameState(roomData)
  const isMyTurn = roomData.game.currentTurn === myColor
  const boardDisabled = !isMyTurn || roomData.status !== 'playing'

  const opponentColor = myColor === 'black' ? 'white' : 'black'
  const opponent = opponentColor === 'black' ? roomData.players.black : roomData.players.white
  const me = myColor === 'black' ? roomData.players.black : roomData.players.white

  // Result modal
  if (showResult && roomData.status === 'finished') {
    const result = roomData.result
    const isResign = result?.reason === 'resign'
    const iWon = result?.winner === myColor

    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <span className="material-symbols-outlined text-5xl mb-2" style={{ color: iWon ? '#4ade80' : '#f87171' }}>
              {iWon ? 'emoji_events' : 'sentiment_dissatisfied'}
            </span>
            <h2 className="font-headline font-extrabold text-3xl">
              {iWon ? '승리!' : '패배'}
            </h2>
            <p className="text-on-surface-variant">
              {isResign
                ? (iWon ? '상대방이 기권했습니다' : '기권으로 패배했습니다')
                : (score
                  ? `${score.winner === 'black' ? '흑' : '백'} 승 (${score.margin.toFixed(1)}점 차)`
                  : '게임이 종료되었습니다')
              }
            </p>
          </div>

          {score && !isResign && (
            <div className="bg-surface-container-high rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-on-surface" />
                  <span className="font-bold">
                    {roomData.players.black?.displayName ?? '흑'}
                    {myColor === 'black' ? ' (나)' : ''}
                  </span>
                </div>
                <span className="font-headline font-bold text-xl">{score.blackTotal.toFixed(1)}</span>
              </div>
              <div className="h-px bg-outline-variant/30" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest border border-outline-variant/50" />
                  <span className="font-bold">
                    {roomData.players.white?.displayName ?? '백'}
                    {myColor === 'white' ? ' (나)' : ''}
                  </span>
                </div>
                <span className="font-headline font-bold text-xl">{score.whiteTotal.toFixed(1)}</span>
              </div>
              <div className="text-xs text-on-surface-variant text-center">덤(Komi): {score.komi}점</div>
            </div>
          )}

          <button
            onClick={handleGoHome}
            className="w-full py-4 bg-primary text-on-primary rounded-xl font-bold active:scale-95 transition-transform"
          >
            로비로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // Active game
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="flex items-center justify-between max-w-lg lg:max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
            <h1 className="font-headline font-bold text-lg">
              {roomData.boardSize}x{roomData.boardSize} 온라인
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              gameState.currentTurn === 'black'
                ? 'bg-on-surface'
                : 'bg-surface-container-lowest border border-outline-variant'
            }`} />
            <span className="text-sm font-bold">
              {isMyTurn ? '내 차례' : '상대 차례'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-lg lg:max-w-4xl mx-auto py-2 pb-28 lg:pb-4">
        <div className="space-y-2">
          {/* Opponent info (top) */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${
                opponentColor === 'black'
                  ? 'bg-on-surface'
                  : 'bg-surface-container-lowest border border-outline-variant/50'
              }`} />
              <span className="font-bold text-sm">
                {opponent?.displayName ?? '대기중'}
              </span>
            </div>
            <div className="text-xs text-on-surface-variant">
              잡은 돌: {opponentColor === 'black' ? gameState.capturedWhite : gameState.capturedBlack}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mx-3 bg-error/10 border border-error/30 rounded-xl px-4 py-2.5 text-error text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Board */}
          <div className={`w-full shadow-xl transition-opacity ${boardDisabled ? 'opacity-75' : ''}`}>
            <GoBoard
              board={gameState.board}
              size={gameState.size}
              lastMove={gameState.lastMove}
              koPoint={gameState.koPoint}
              onIntersectionClick={handleMove}
              disabled={boardDisabled}
            />
          </div>

          {/* My info (bottom) */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${
                myColor === 'black'
                  ? 'bg-on-surface'
                  : 'bg-surface-container-lowest border border-outline-variant/50'
              }`} />
              <span className="font-bold text-sm">
                {me?.displayName ?? '나'} (나)
              </span>
            </div>
            <div className="text-xs text-on-surface-variant">
              잡은 돌: {myColor === 'black' ? gameState.capturedWhite : gameState.capturedBlack}
            </div>
          </div>

          {/* Status message */}
          <div className="text-center py-2">
            <span className={`text-sm font-bold ${isMyTurn ? 'text-tertiary' : 'text-on-surface-variant'}`}>
              {isMyTurn ? '당신의 차례입니다' : '상대방의 차례입니다'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 px-3">
            <button
              onClick={handlePass}
              disabled={boardDisabled}
              className="py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">front_hand</span>
              패스
            </button>
            <button
              onClick={handleResign}
              disabled={roomData.status !== 'playing'}
              className="py-3 bg-surface-container-high text-on-surface rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">flag</span>
              기권
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
