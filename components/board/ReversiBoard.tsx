'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Color, Position } from '@/lib/go-engine/types'

interface ReversiBoardProps {
  board: Color[][]          // 8×8
  validMoves: Position[]    // 현재 플레이어의 유효 착수 위치
  lastMove?: Position | null
  onSquareClick?: (pos: Position) => void
  disabled?: boolean
}

const BOARD_SIZE = 8

export default function ReversiBoard({
  board,
  validMoves,
  lastMove,
  onSquareClick,
  disabled = false,
}: ReversiBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const containerSize = container.clientWidth
    const dpr = window.devicePixelRatio || 1
    canvas.width = containerSize * dpr
    canvas.height = containerSize * dpr
    canvas.style.width = `${containerSize}px`
    canvas.style.height = `${containerSize}px`
    ctx.scale(dpr, dpr)

    const size = containerSize
    const cellSize = size / BOARD_SIZE
    const pieceRadius = cellSize * 0.40

    // 배경: 짙은 녹색 (전통 오델로)
    ctx.fillStyle = '#1d6b31'
    ctx.fillRect(0, 0, size, size)

    // 미세 그라디언트 오버레이
    const grad = ctx.createLinearGradient(0, 0, size, size)
    grad.addColorStop(0, 'rgba(255,255,255,0.05)')
    grad.addColorStop(1, 'rgba(0,0,0,0.08)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    // 격자선 (9개 × 9개 — 8×8 칸 경계)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.30)'
    ctx.lineWidth = 1

    for (let i = 0; i <= BOARD_SIZE; i++) {
      const xy = i * cellSize
      ctx.beginPath()
      ctx.moveTo(xy, 0)
      ctx.lineTo(xy, size)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(0, xy)
      ctx.lineTo(size, xy)
      ctx.stroke()
    }

    // 외곽 테두리
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 2
    ctx.strokeRect(0, 0, size, size)

    // 화점 (4개: d4, d5, e4, e5 위치 — 0-indexed: (2,2),(2,5),(5,2),(5,5))
    const dotPositions = [
      { row: 2, col: 2 }, { row: 2, col: 5 },
      { row: 5, col: 2 }, { row: 5, col: 5 },
    ]
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    for (const dp of dotPositions) {
      const x = dp.col * cellSize + cellSize / 2
      const y = dp.row * cellSize + cellSize / 2
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    // 유효 착수 표시 (반투명 흰 점)
    for (const vm of validMoves) {
      const x = vm.col * cellSize + cellSize / 2
      const y = vm.row * cellSize + cellSize / 2
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'
      ctx.beginPath()
      ctx.arc(x, y, pieceRadius * 0.38, 0, Math.PI * 2)
      ctx.fill()
    }

    // 돌 렌더링
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const color = board[r][c]
        if (color === 'empty') continue

        const x = c * cellSize + cellSize / 2
        const y = r * cellSize + cellSize / 2
        const isLast = lastMove && lastMove.row === r && lastMove.col === c

        // 돌 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.40)'
        ctx.shadowBlur = pieceRadius * 0.5
        ctx.shadowOffsetX = pieceRadius * 0.08
        ctx.shadowOffsetY = pieceRadius * 0.12

        // 방사형 그라디언트 (GoBoard와 동일)
        const stoneGrad = ctx.createRadialGradient(
          x - pieceRadius * 0.3, y - pieceRadius * 0.3, pieceRadius * 0.1,
          x, y, pieceRadius
        )
        if (color === 'black') {
          stoneGrad.addColorStop(0, '#666')
          stoneGrad.addColorStop(0.4, '#222')
          stoneGrad.addColorStop(1, '#000')
        } else {
          stoneGrad.addColorStop(0, '#fff')
          stoneGrad.addColorStop(0.5, '#f0f0f0')
          stoneGrad.addColorStop(1, '#d0d0d0')
        }

        ctx.fillStyle = stoneGrad
        ctx.beginPath()
        ctx.arc(x, y, pieceRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // 백돌 테두리
        if (color === 'white') {
          ctx.strokeStyle = 'rgba(180,180,180,0.4)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.arc(x, y, pieceRadius, 0, Math.PI * 2)
          ctx.stroke()
        }

        // 마지막 착수 마커
        if (isLast) {
          ctx.fillStyle = color === 'black' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.45)'
          ctx.beginPath()
          ctx.arc(x, y, pieceRadius * 0.28, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }, [board, validMoves, lastMove])

  const handleClick = useCallback((clientX: number, clientY: number) => {
    if (disabled || !onSquareClick) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const cellSize = rect.width / BOARD_SIZE

    const col = Math.floor((clientX - rect.left) / cellSize)
    const row = Math.floor((clientY - rect.top) / cellSize)

    if (col >= 0 && col < BOARD_SIZE && row >= 0 && row < BOARD_SIZE) {
      onSquareClick({ row, col })
    }
  }, [disabled, onSquareClick])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const handleResize = () => draw()
    const observer = new ResizeObserver(handleResize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} className="w-full aspect-square rounded-xl overflow-hidden">
      <canvas
        ref={canvasRef}
        className="block cursor-pointer"
        style={{ touchAction: 'none' }}
        onClick={(e) => handleClick(e.clientX, e.clientY)}
        onTouchEnd={(e) => {
          e.preventDefault()
          const touch = e.changedTouches[0]
          handleClick(touch.clientX, touch.clientY)
        }}
      />
    </div>
  )
}
