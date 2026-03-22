import {
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  type Unsubscribe,
} from 'firebase/database'
import { db } from './config'
import { Color, BoardSize } from '@/lib/go-engine/types'
import { createBoard } from '@/lib/go-engine/board'

export interface PlayerInfo {
  uid: string
  displayName: string
}

export interface RoomGame {
  board: Color[][]
  currentTurn: 'black' | 'white'
  koPoint: { row: number; col: number } | null
  capturedBlack: number
  capturedWhite: number
  passes: number
  isGameOver: boolean
  lastMove: { row: number; col: number } | null
}

export interface RoomResult {
  winner: 'black' | 'white' | null
  reason: 'score' | 'resign' | 'timeout' | null
}

export interface RoomData {
  status: 'waiting' | 'playing' | 'finished'
  boardSize: BoardSize
  createdAt: number
  players: {
    black: PlayerInfo | null
    white: PlayerInfo | null
  }
  game: RoomGame
  result: RoomResult | null
}

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createRoom(
  uid: string,
  displayName: string,
  boardSize: BoardSize,
  myColor: 'black' | 'white' | 'random'
): Promise<{ roomId: string; assignedColor: 'black' | 'white' }> {
  const roomId = generateRoomId()
  const board = createBoard(boardSize)

  let assignedColor: 'black' | 'white'
  if (myColor === 'random') {
    assignedColor = Math.random() < 0.5 ? 'black' : 'white'
  } else {
    assignedColor = myColor
  }

  const playerInfo: PlayerInfo = { uid, displayName }

  const roomData: RoomData = {
    status: 'waiting',
    boardSize,
    createdAt: Date.now(),
    players: {
      black: assignedColor === 'black' ? playerInfo : null,
      white: assignedColor === 'white' ? playerInfo : null,
    },
    game: {
      board,
      currentTurn: 'black',
      koPoint: null,
      capturedBlack: 0,
      capturedWhite: 0,
      passes: 0,
      isGameOver: false,
      lastMove: null,
    },
    result: null,
  }

  await set(ref(db, `rooms/${roomId}`), roomData)
  return { roomId, assignedColor }
}

export async function joinRoom(
  roomId: string,
  uid: string,
  displayName: string
): Promise<'black' | 'white'> {
  const roomRef = ref(db, `rooms/${roomId}`)
  const snapshot = await get(roomRef)

  if (!snapshot.exists()) {
    throw new Error('방을 찾을 수 없습니다')
  }

  const data = snapshot.val() as RoomData
  if (data.status !== 'waiting') {
    throw new Error('이미 진행 중이거나 종료된 방입니다')
  }

  // Check if user is already in the room
  if (data.players.black?.uid === uid || data.players.white?.uid === uid) {
    throw new Error('이미 참가한 방입니다')
  }

  const playerInfo: PlayerInfo = { uid, displayName }
  let assignedColor: 'black' | 'white'

  if (!data.players.black) {
    assignedColor = 'black'
  } else if (!data.players.white) {
    assignedColor = 'white'
  } else {
    throw new Error('방이 가득 찼습니다')
  }

  await update(roomRef, {
    [`players/${assignedColor}`]: playerInfo,
    status: 'playing',
  })

  return assignedColor
}

export function subscribeRoom(
  roomId: string,
  callback: (data: RoomData | null) => void
): Unsubscribe {
  const roomRef = ref(db, `rooms/${roomId}`)
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as RoomData) : null)
  })
}

export async function pushMove(
  roomId: string,
  newBoard: Color[][],
  pos: { row: number; col: number },
  nextTurn: 'black' | 'white',
  koPoint: { row: number; col: number } | null,
  capturedBlack: number,
  capturedWhite: number
): Promise<void> {
  const gameRef = ref(db, `rooms/${roomId}/game`)
  await update(gameRef, {
    board: newBoard,
    currentTurn: nextTurn,
    lastMove: pos,
    koPoint,
    capturedBlack,
    capturedWhite,
    passes: 0,
    isGameOver: false,
  })
}

export async function pushPass(
  roomId: string,
  nextTurn: 'black' | 'white',
  passes: number,
  isGameOver: boolean
): Promise<void> {
  const updates: Record<string, unknown> = {
    'game/currentTurn': nextTurn,
    'game/lastMove': null,
    'game/koPoint': null,
    'game/passes': passes,
    'game/isGameOver': isGameOver,
  }

  if (isGameOver) {
    updates['status'] = 'finished'
    updates['result'] = { winner: null, reason: 'score' }
  }

  await update(ref(db, `rooms/${roomId}`), updates)
}

export async function resign(
  roomId: string,
  myColor: 'black' | 'white'
): Promise<void> {
  const winner = myColor === 'black' ? 'white' : 'black'
  await update(ref(db, `rooms/${roomId}`), {
    status: 'finished',
    'game/isGameOver': true,
    result: { winner, reason: 'resign' },
  })
}

export async function deleteRoom(roomId: string): Promise<void> {
  await remove(ref(db, `rooms/${roomId}`))
}
