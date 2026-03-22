'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signInWithGoogle, signOut, onAuthChanged } from '@/lib/firebase/auth'
import { createRoom, joinRoom, subscribeRoom } from '@/lib/firebase/roomService'
import { useOnlineStore } from '@/lib/store/onlineStore'
import { BoardSize } from '@/lib/go-engine/types'

function AuthForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const firebaseError = err as { code?: string }
      if (firebaseError.code !== 'auth/popup-closed-by-user') {
        setError('로그인에 실패했습니다. 다시 시도해주세요.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-red-600 text-sm text-center">
          {error}
        </div>
      )}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 active:scale-[0.98] transition-transform disabled:opacity-50 shadow-sm border"
        style={{ backgroundColor: '#fff', borderColor: '#e0e0e0', color: '#3c4043' }}
      >
        {loading ? (
          <span className="material-symbols-outlined animate-spin">progress_activity</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        )}
        Google로 로그인
      </button>
    </div>
  )
}

function LobbyView() {
  const router = useRouter()
  const { user, setRoom, setError, error } = useOnlineStore()
  const [boardSize, setBoardSize] = useState<BoardSize>(9)
  const [myColorChoice, setMyColorChoice] = useState<'black' | 'white' | 'random'>('black')
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const _ref = useRef(null)

  // Subscribe to room when created, waiting for opponent
  useEffect(() => {
    if (!createdRoomId) return
    const unsubscribe = subscribeRoom(createdRoomId, (data) => {
      if (data && data.status === 'playing') {
        router.push(`/online/${createdRoomId}`)
      }
    })
    return unsubscribe
  }, [createdRoomId, router])

  const handleCreateRoom = useCallback(async () => {
    if (!user) return
    setIsCreating(true)
    setError(null)
    try {
      const { roomId, assignedColor } = await createRoom(
        user.uid,
        user.displayName,
        boardSize,
        myColorChoice
      )
      setRoom(roomId, assignedColor)
      setCreatedRoomId(roomId)
    } catch (err: unknown) {
      setError((err as Error).message || '방 생성 실패')
    } finally {
      setIsCreating(false)
    }
  }, [user, boardSize, myColorChoice, setRoom, setError])

  const handleJoinRoom = useCallback(async () => {
    if (!user) return
    const code = joinCode.trim().toUpperCase()
    if (code.length < 4) {
      setError('방 코드를 입력해주세요')
      return
    }
    setIsJoining(true)
    setError(null)
    try {
      const assignedColor = await joinRoom(code, user.uid, user.displayName)
      setRoom(code, assignedColor)
      router.push(`/online/${code}`)
    } catch (err: unknown) {
      setError((err as Error).message || '방 참가 실패')
    } finally {
      setIsJoining(false)
    }
  }, [user, joinCode, setRoom, setError, router])

  const handleCopy = useCallback(async () => {
    if (!createdRoomId) return
    try {
      await navigator.clipboard.writeText(createdRoomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }, [createdRoomId])

  const handleSignOut = useCallback(async () => {
    await signOut()
    setCreatedRoomId(null)
  }, [])

  if (!user) return null

  const boardSizes: { size: BoardSize; label: string }[] = [
    { size: 9, label: '9x9' },
    { size: 13, label: '13x13' },
    { size: 19, label: '19x19' },
  ]

  const colorChoices: { value: 'black' | 'white' | 'random'; label: string; icon: string }[] = [
    { value: 'black', label: '흑', icon: 'circle' },
    { value: 'white', label: '백', icon: 'panorama_fish_eye' },
    { value: 'random', label: '랜덤', icon: 'shuffle' },
  ]

  return (
    <div className="max-w-lg mx-auto px-5 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-extrabold text-xl">
            안녕하세요, {user.displayName}님
          </h2>
          <p className="text-on-surface-variant text-sm">온라인 대국을 시작하세요</p>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-sm font-bold active:scale-95 transition-transform"
        >
          로그아웃
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl px-4 py-2.5 text-error text-sm">
          {error}
        </div>
      )}

      {/* Create Room Card */}
      <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20 space-y-5">
        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
          <span className="material-symbols-outlined">add_circle</span>
          방 만들기
        </h3>

        {createdRoomId ? (
          <div className="space-y-4 text-center">
            <p className="text-on-surface-variant text-sm">방 코드를 상대방에게 공유하세요</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-headline font-extrabold text-3xl tracking-widest">
                {createdRoomId}
              </span>
              <button
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-xl">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm animate-pulse">
              <span className="material-symbols-outlined text-base">hourglass_top</span>
              상대방 입장 대기중...
            </div>
          </div>
        ) : (
          <>
            {/* Board Size */}
            <div>
              <label className="block text-sm font-bold mb-2">바둑판 크기</label>
              <div className="grid grid-cols-3 gap-2">
                {boardSizes.map(({ size, label }) => (
                  <button
                    key={size}
                    onClick={() => setBoardSize(size)}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                      boardSize === size
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Choice */}
            <div>
              <label className="block text-sm font-bold mb-2">내 돌 색깔</label>
              <div className="grid grid-cols-3 gap-2">
                {colorChoices.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    onClick={() => setMyColorChoice(value)}
                    className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                      myColorChoice === value
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
            >
              {isCreating ? '생성 중...' : '방 만들기'}
            </button>
          </>
        )}
      </div>

      {/* Join Room Card */}
      {!createdRoomId && (
        <div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/20 space-y-4">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2">
            <span className="material-symbols-outlined">login</span>
            방 참가하기
          </h3>

          <div>
            <label className="block text-sm font-bold mb-1.5">방 코드</label>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="6자리 코드 입력"
              maxLength={6}
              className="w-full px-4 py-3 rounded-xl border border-outline-variant/30 bg-surface text-center font-headline font-bold text-xl tracking-widest uppercase focus:outline-none focus:border-primary"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining || joinCode.trim().length < 4}
            className="w-full py-3.5 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-transform"
          >
            {isJoining ? '참가 중...' : '참가하기'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function OnlinePage() {
  const { user, setUser } = useOnlineStore()
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChanged((firebaseUser) => {
      setUser(firebaseUser)
      setAuthLoading(false)
    })
    return unsubscribe
  }, [setUser])

  return (
    <div className="min-h-screen bg-surface pb-24 lg:pb-8">
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-5 py-3 border-b border-outline-variant/20">
        <div className="flex items-center gap-3 max-w-lg lg:max-w-4xl mx-auto">
          <Link href="/play" className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined text-primary">arrow_back</span>
          </Link>
          <h1 className="font-headline font-bold text-lg">온라인 대국</h1>
        </div>
      </header>

      {authLoading ? (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant animate-spin">progress_activity</span>
        </div>
      ) : user ? (
        <LobbyView />
      ) : (
        <div className="py-8">
          <div className="text-center mb-6">
            <span className="material-symbols-outlined text-5xl text-tertiary mb-2">wifi</span>
            <h2 className="font-headline font-extrabold text-2xl">온라인 대국</h2>
            <p className="text-on-surface-variant text-sm mt-1">로그인하여 다른 사람과 바둑을 두세요</p>
          </div>
          <AuthForm />
        </div>
      )}
    </div>
  )
}
