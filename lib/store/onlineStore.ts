import { create } from 'zustand'
import type { RoomData } from '@/lib/firebase/roomService'

interface OnlineUser {
  uid: string
  email: string
  displayName: string
  photoURL: string
}

interface OnlineStore {
  user: OnlineUser | null
  roomId: string | null
  myColor: 'black' | 'white' | null
  roomData: RoomData | null
  isConnecting: boolean
  error: string | null

  setUser: (user: OnlineUser | null) => void
  setRoom: (roomId: string, myColor: 'black' | 'white') => void
  setRoomData: (data: RoomData | null) => void
  clearRoom: () => void
  setError: (error: string | null) => void
  setConnecting: (connecting: boolean) => void
}

export const useOnlineStore = create<OnlineStore>((set) => ({
  user: null,
  roomId: null,
  myColor: null,
  roomData: null,
  isConnecting: false,
  error: null,

  setUser: (user) => set({ user }),
  setRoom: (roomId, myColor) => set({ roomId, myColor }),
  setRoomData: (data) => set({ roomData: data }),
  clearRoom: () => set({ roomId: null, myColor: null, roomData: null }),
  setError: (error) => set({ error }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
}))
