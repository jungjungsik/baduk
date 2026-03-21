#!/usr/bin/env node
/**
 * Generates public/icons/icon-192.png and icon-512.png
 * Uses only Node.js built-ins (zlib, fs, path)
 */
const zlib = require('zlib')
const fs = require('fs')
const path = require('path')

// ─── CRC32 ────────────────────────────────────────────────────────────────────
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  crcTable[i] = c
}
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

// ─── PNG builder ──────────────────────────────────────────────────────────────
function makePNG(size, pixels) {
  function chunk(type, data) {
    const tBuf = Buffer.from(type, 'ascii')
    const lenBuf = Buffer.allocUnsafe(4); lenBuf.writeUInt32BE(data.length)
    const crcBuf = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([tBuf, data])))
    return Buffer.concat([lenBuf, tBuf, data, crcBuf])
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 6  // color type: RGBA
  // bytes 10-12 = 0 (deflate, no filter, no interlace)

  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4)
    row[0] = 0  // filter: None
    for (let x = 0; x < size; x++) {
      const s = (y * size + x) * 4
      row[1 + x * 4]     = pixels[s]
      row[1 + x * 4 + 1] = pixels[s + 1]
      row[1 + x * 4 + 2] = pixels[s + 2]
      row[1 + x * 4 + 3] = pixels[s + 3]
    }
    rows.push(row)
  }

  const idat = zlib.deflateSync(Buffer.concat(rows), { level: 9 })

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),  // PNG signature
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ─── Drawing helpers ──────────────────────────────────────────────────────────
function makeCanvas(size) {
  const pixels = new Uint8Array(size * size * 4)  // RGBA, init transparent

  function setPixel(x, y, r, g, b, a = 255) {
    x = Math.round(x); y = Math.round(y)
    if (x < 0 || x >= size || y < 0 || y >= size) return
    const i = (y * size + x) * 4
    // Alpha blend over existing pixel
    const srcA = a / 255
    const dstA = pixels[i + 3] / 255
    const outA = srcA + dstA * (1 - srcA)
    if (outA === 0) return
    pixels[i]     = (r * srcA + pixels[i]     * dstA * (1 - srcA)) / outA
    pixels[i + 1] = (g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA
    pixels[i + 2] = (b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA
    pixels[i + 3] = outA * 255
  }

  function fillRect(x0, y0, w, h, r, g, b, a = 255) {
    for (let y = y0; y < y0 + h; y++)
      for (let x = x0; x < x0 + w; x++)
        setPixel(x, y, r, g, b, a)
  }

  // Anti-aliased filled circle
  function fillCircle(cx, cy, radius, r, g, b, a = 255) {
    const x0 = Math.floor(cx - radius - 1)
    const x1 = Math.ceil(cx + radius + 1)
    const y0 = Math.floor(cy - radius - 1)
    const y1 = Math.ceil(cy + radius + 1)
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        if (dist <= radius - 0.5) {
          setPixel(x, y, r, g, b, a)
        } else if (dist <= radius + 0.5) {
          const alpha = Math.round(a * (radius + 0.5 - dist))
          setPixel(x, y, r, g, b, alpha)
        }
      }
    }
  }

  // Rounded rectangle fill
  function fillRoundRect(x0, y0, w, h, cornerR, r, g, b, a = 255) {
    for (let y = y0; y < y0 + h; y++) {
      for (let x = x0; x < x0 + w; x++) {
        // corners
        let inTL = x < x0 + cornerR && y < y0 + cornerR
        let inTR = x >= x0 + w - cornerR && y < y0 + cornerR
        let inBL = x < x0 + cornerR && y >= y0 + h - cornerR
        let inBR = x >= x0 + w - cornerR && y >= y0 + h - cornerR

        let dist = 0
        let cornered = false
        if (inTL)      { dist = Math.sqrt((x - (x0 + cornerR)) ** 2 + (y - (y0 + cornerR)) ** 2); cornered = true }
        else if (inTR) { dist = Math.sqrt((x - (x0 + w - cornerR)) ** 2 + (y - (y0 + cornerR)) ** 2); cornered = true }
        else if (inBL) { dist = Math.sqrt((x - (x0 + cornerR)) ** 2 + (y - (y0 + h - cornerR)) ** 2); cornered = true }
        else if (inBR) { dist = Math.sqrt((x - (x0 + w - cornerR)) ** 2 + (y - (y0 + h - cornerR)) ** 2); cornered = true }

        if (cornered) {
          if (dist <= cornerR - 0.5) setPixel(x, y, r, g, b, a)
          else if (dist <= cornerR + 0.5) setPixel(x, y, r, g, b, Math.round(a * (cornerR + 0.5 - dist)))
        } else {
          setPixel(x, y, r, g, b, a)
        }
      }
    }
  }

  // Horizontal line with given thickness
  function hline(x0, x1, y, thickness, r, g, b, a = 255) {
    const half = thickness / 2
    for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      for (let dy = -half; dy <= half; dy++) {
        const alpha = dy >= -half + 0.5 && dy <= half - 0.5 ? a : Math.round(a * (half - Math.abs(dy)))
        setPixel(x, y + dy, r, g, b, Math.max(0, alpha))
      }
    }
  }

  function vline(x, y0, y1, thickness, r, g, b, a = 255) {
    const half = thickness / 2
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      for (let dx = -half; dx <= half; dx++) {
        const alpha = dx >= -half + 0.5 && dx <= half - 0.5 ? a : Math.round(a * (half - Math.abs(dx)))
        setPixel(x + dx, y, r, g, b, Math.max(0, alpha))
      }
    }
  }

  return { pixels, setPixel, fillRect, fillCircle, fillRoundRect, hline, vline }
}

// ─── Icon design ──────────────────────────────────────────────────────────────
// Colors from the design system
const BG     = [0x38, 0x38, 0x31]  // #383831 dark warm
const BOARD  = [0xc8, 0xb0, 0x90]  // warm wood board color
const LINE   = [0x8a, 0x72, 0x58]  // board line color
const BLACK  = [0x12, 0x12, 0x0e]  // black stone
const WHITE  = [0xf8, 0xf4, 0xec]  // white stone (cream)
const SHADOW = [0x28, 0x24, 0x20]  // stone shadow

function drawIcon(size) {
  const { pixels, fillCircle, fillRoundRect, hline, vline } = makeCanvas(size)

  const pad = size * 0.1
  const cornerR = size * 0.18

  // Background: dark rounded square
  fillRoundRect(0, 0, size, size, cornerR, BG[0], BG[1], BG[2])

  // Board area (warm wood square, slightly inset)
  const boardPad = size * 0.14
  const boardSize = size - boardPad * 2
  const boardCorner = size * 0.08
  fillRoundRect(boardPad, boardPad, boardSize, boardSize, boardCorner, BOARD[0], BOARD[1], BOARD[2])

  // 3×3 grid lines
  const margin = size * 0.22
  const step = (size - margin * 2) / 2
  const lineW = Math.max(1, size * 0.018)

  for (let i = 0; i <= 2; i++) {
    const pos = margin + i * step
    hline(margin, size - margin, pos, lineW, LINE[0], LINE[1], LINE[2], 200)
    vline(pos, margin, size - margin, lineW, LINE[0], LINE[1], LINE[2], 200)
  }

  // Star points at corners and center of the 3×3 grid
  const starR = lineW * 1.5
  const pts = [0, 1, 2]
  for (const i of pts) for (const j of pts) {
    if ((i === 0 || i === 2) && (j === 0 || j === 2)) {
      fillCircle(margin + i * step, margin + j * step, starR, LINE[0], LINE[1], LINE[2], 200)
    }
  }

  const stoneR = step * 0.38

  // White stone — top-left intersection, with slight shadow
  const wx = margin
  const wy = margin
  fillCircle(wx + stoneR * 0.08, wy + stoneR * 0.1, stoneR * 1.02, SHADOW[0], SHADOW[1], SHADOW[2], 140)
  fillCircle(wx, wy, stoneR, WHITE[0], WHITE[1], WHITE[2])
  // Subtle grey shading on white stone
  fillCircle(wx + stoneR * 0.1, wy + stoneR * 0.12, stoneR * 0.65, 0xd8, 0xd4, 0xcc, 60)

  // Black stone — center intersection, with shadow + highlight
  const bx = margin + step
  const by = margin + step
  fillCircle(bx + stoneR * 0.08, by + stoneR * 0.1, stoneR * 1.02, SHADOW[0] - 10, SHADOW[1] - 10, SHADOW[2] - 10, 140)
  fillCircle(bx, by, stoneR, BLACK[0], BLACK[1], BLACK[2])
  // Highlight gloss on black stone
  fillCircle(bx - stoneR * 0.22, by - stoneR * 0.26, stoneR * 0.3, 0x88, 0x88, 0x80, 120)

  return pixels
}

// ─── Generate & save ──────────────────────────────────────────────────────────
const outDir = path.join(__dirname, 'public', 'icons')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

for (const size of [192, 512]) {
  const pixels = drawIcon(size)
  const png = makePNG(size, pixels)
  const file = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(file, png)
  console.log(`✓ ${file} (${(png.length / 1024).toFixed(1)} KB)`)
}
