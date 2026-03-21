'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Color, Position, BoardSize } from '@/lib/go-engine/types'

interface GoBoardProps {
  board: Color[][]
  size: BoardSize
  lastMove?: Position | null
  koPoint?: Position | null
  onIntersectionClick?: (pos: Position) => void
  disabled?: boolean
  highlightPositions?: Position[]  // 사활 퍼즐 힌트용
}

// 보드 크기별 성점 위치
const STAR_POINTS: Record<BoardSize, Position[]> = {
  9: [
    { row: 2, col: 2 }, { row: 2, col: 6 },
    { row: 4, col: 4 },
    { row: 6, col: 2 }, { row: 6, col: 6 },
  ],
  13: [
    { row: 3, col: 3 }, { row: 3, col: 9 },
    { row: 6, col: 6 },
    { row: 9, col: 3 }, { row: 9, col: 9 },
  ],
  19: [
    { row: 3, col: 3 }, { row: 3, col: 9 }, { row: 3, col: 15 },
    { row: 9, col: 3 }, { row: 9, col: 9 }, { row: 9, col: 15 },
    { row: 15, col: 3 }, { row: 15, col: 9 }, { row: 15, col: 15 },
  ],
}

export default function GoBoard({
  board,
  size,
  lastMove,
  koPoint,
  onIntersectionClick,
  disabled = false,
  highlightPositions = [],
}: GoBoardProps) {
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

    const canvasSize = containerSize
    const padding = canvasSize * 0.055  // 보드 여백
    const gridSize = (canvasSize - padding * 2) / (size - 1)
    const stoneRadius = gridSize * 0.46

    // 배경 (목재 색상)
    ctx.fillStyle = '#deb887'  // 따뜻한 나무색
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // 나무결 느낌의 그라디언트 오버레이
    const woodGrad = ctx.createLinearGradient(0, 0, canvasSize, canvasSize)
    woodGrad.addColorStop(0, 'rgba(210, 170, 110, 0.3)')
    woodGrad.addColorStop(0.5, 'rgba(180, 140, 90, 0.1)')
    woodGrad.addColorStop(1, 'rgba(160, 120, 70, 0.2)')
    ctx.fillStyle = woodGrad
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // 격자선
    ctx.strokeStyle = 'rgba(100, 70, 40, 0.6)'
    ctx.lineWidth = 1

    for (let i = 0; i < size; i++) {
      const x = padding + i * gridSize
      const y = padding + i * gridSize

      // 세로선
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, padding + (size - 1) * gridSize)
      ctx.stroke()

      // 가로선
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + (size - 1) * gridSize, y)
      ctx.stroke()
    }

    // 테두리 (굵은 선)
    ctx.strokeStyle = 'rgba(100, 70, 40, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(padding, padding, (size - 1) * gridSize, (size - 1) * gridSize)

    // 성점(화점)
    const starPoints = STAR_POINTS[size] || []
    for (const sp of starPoints) {
      const x = padding + sp.col * gridSize
      const y = padding + sp.row * gridSize
      ctx.fillStyle = 'rgba(100, 70, 40, 0.8)'
      ctx.beginPath()
      ctx.arc(x, y, stoneRadius * 0.22, 0, Math.PI * 2)
      ctx.fill()
    }

    // 돌 그리기
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const color = board[r][c]
        if (color === 'empty') continue

        const x = padding + c * gridSize
        const y = padding + r * gridSize
        const isLast = lastMove && lastMove.row === r && lastMove.col === c

        // 돌 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.35)'
        ctx.shadowBlur = stoneRadius * 0.5
        ctx.shadowOffsetX = stoneRadius * 0.1
        ctx.shadowOffsetY = stoneRadius * 0.15

        // 돌 그라디언트
        const grad = ctx.createRadialGradient(
          x - stoneRadius * 0.3, y - stoneRadius * 0.3, stoneRadius * 0.1,
          x, y, stoneRadius
        )

        if (color === 'black') {
          grad.addColorStop(0, '#666')
          grad.addColorStop(0.4, '#222')
          grad.addColorStop(1, '#000')
        } else {
          grad.addColorStop(0, '#fff')
          grad.addColorStop(0.5, '#f0f0f0')
          grad.addColorStop(1, '#d0d0d0')
        }

        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, stoneRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // 백돌 테두리
        if (color === 'white') {
          ctx.strokeStyle = 'rgba(180, 180, 180, 0.4)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.arc(x, y, stoneRadius, 0, Math.PI * 2)
          ctx.stroke()
        }

        // 마지막 착수 마커
        if (isLast) {
          ctx.fillStyle = color === 'black' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
          ctx.beginPath()
          ctx.arc(x, y, stoneRadius * 0.28, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // 패(Ko) 포인트 표시
    if (koPoint && board[koPoint.row][koPoint.col] === 'empty') {
      const x = padding + koPoint.col * gridSize
      const y = padding + koPoint.row * gridSize
      ctx.strokeStyle = 'rgba(255, 100, 0, 0.7)'
      ctx.lineWidth = 2
      ctx.strokeRect(x - stoneRadius * 0.6, y - stoneRadius * 0.6, stoneRadius * 1.2, stoneRadius * 1.2)
    }

    // 하이라이트 위치 (퍼즐 힌트)
    for (const pos of highlightPositions) {
      const x = padding + pos.col * gridSize
      const y = padding + pos.row * gridSize
      ctx.fillStyle = 'rgba(100, 180, 100, 0.3)'
      ctx.beginPath()
      ctx.arc(x, y, stoneRadius * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }

  }, [board, size, lastMove, koPoint, highlightPositions])

  // 클릭/터치 이벤트 핸들러
  const handleClick = useCallback((clientX: number, clientY: number) => {
    if (disabled || !onIntersectionClick) return
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = canvas.getBoundingClientRect()
    const canvasSize = rect.width
    const padding = canvasSize * 0.055
    const gridSize = (canvasSize - padding * 2) / (size - 1)

    const x = clientX - rect.left
    const y = clientY - rect.top

    const col = Math.round((x - padding) / gridSize)
    const row = Math.round((y - padding) / gridSize)

    if (col >= 0 && col < size && row >= 0 && row < size) {
      onIntersectionClick({ row, col })
    }
  }, [disabled, onIntersectionClick, size])

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
