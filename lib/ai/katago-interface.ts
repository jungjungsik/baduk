import { GameState, Position } from '@/lib/go-engine/types'
import { getKataGoEngineClient } from '@/lib/katago-engine/client'
import { toKataGoBoard, toKataGoMoves, fromKataGoMove } from '@/lib/katago-engine/adapter'

const MODEL_URL = '/models/katago-small.bin.gz'

export type KataGoStatus = 'idle' | 'loading' | 'ready' | 'error'

let statusListeners: ((status: KataGoStatus) => void)[] = []
let currentStatus: KataGoStatus = 'idle'

function setStatus(s: KataGoStatus) {
  currentStatus = s
  statusListeners.forEach((fn) => fn(s))
}

export function onKataGoStatusChange(fn: (status: KataGoStatus) => void) {
  statusListeners.push(fn)
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn)
  }
}

export function getKataGoStatus(): KataGoStatus {
  return currentStatus
}

let initPromise: Promise<void> | null = null

export async function initKataGo(): Promise<void> {
  if (currentStatus === 'ready') return
  if (initPromise) return initPromise

  setStatus('loading')
  initPromise = (async () => {
    try {
      const client = getKataGoEngineClient()
      await client.init(MODEL_URL)
      setStatus('ready')
    } catch (e) {
      console.error('KataGo init failed:', e)
      setStatus('error')
      initPromise = null
      throw e
    }
  })()

  return initPromise
}

export async function getKataGoMove(
  state: GameState,
  visits: number = 50
): Promise<Position | null> {
  const client = getKataGoEngineClient()
  const board = toKataGoBoard(state.board, state.size)
  const moves = toKataGoMoves(state)
  const currentPlayer = state.currentTurn === 'black' ? 'black' : 'white'

  try {
    const result = await client.analyze({
      modelUrl: MODEL_URL,
      board,
      currentPlayer,
      moveHistory: moves,
      komi: state.komi,
      visits,
      topK: 5,
      rules: 'japanese',
    })

    if (!result.moves || result.moves.length === 0) return null
    const best = result.moves[0]
    return fromKataGoMove(best.x, best.y)
  } catch (e) {
    console.error('KataGo analyze failed:', e)
    return null
  }
}
