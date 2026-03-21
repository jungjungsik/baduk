# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**흑백 (Heukbaek)** — 교육용 바둑 PWA 앱. 입문자가 바둑을 배우고, 두고, 성장하는 앱.

## Commands

```bash
npm run dev      # 개발 서버 시작 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npx tsc --noEmit # 타입 체크
```

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript strict
- **Styling**: Tailwind CSS v4 with custom design system (warm neutral palette)
- **State**: Zustand (gameStore, userStore with localStorage persist)
- **Fonts**: Manrope (headline), Plus Jakarta Sans (body/label) via Google Fonts
- **Icons**: Material Symbols Outlined

## Architecture

```
app/                    # Next.js App Router pages
  layout.tsx            # Root layout with BottomNav
  page.tsx              # Home (streak, XP, featured lesson, paths, records)
  play/page.tsx         # Game screen (board size select → active game)
  puzzle/page.tsx       # Tsumego puzzles
  study/page.tsx        # Lesson library
  practice/page.tsx     # Step-by-step lessons
  profile/page.tsx      # User stats

components/
  board/GoBoard.tsx     # Canvas-based Go board (9x9/13x13/19x19, touch support)
  layout/BottomNav.tsx  # 5-tab bottom navigation
  layout/Header.tsx     # Sticky header
  ui/StreakCard.tsx     # Daily streak + XP display

lib/
  go-engine/            # Pure function Go rules engine
    types.ts            # Color, Position, GameState, PlaceResult types
    board.ts            # createBoard, createGameState, cloneState, getNeighbors
    rules.ts            # placeStone, findGroup, countLiberties, isKo, isSuicide, pass
    scoring.ts          # calculateScore (Japanese rules)
  store/
    gameStore.ts        # Zustand: board state, makeMove, passMove, resetGame
    userStore.ts        # Zustand+persist: XP, streak, lesson/puzzle progress
```

## Design System

Custom Tailwind color tokens based on a warm neutral palette:
- `surface` / `on-surface`: #fffcf7 / #383831 (cream background, dark text)
- `primary`: #5f5e5e (neutral dark)
- `tertiary` / `tertiary-container`: #6f6252 / #f4e3ce (warm brown accent)
- `secondary-container`: #e8e2d6 (muted warm)

Key CSS utilities: `.wood-texture`, `.no-scrollbar`

## Go Engine Key Rules

- `placeStone(state, pos, color)` returns `PlaceResult` — check `result.success` before using `result.state`
- Ko point stored in `state.koPoint`; checked via `isKo(state, pos)`
- Two consecutive passes (`state.passes >= 2`) ends the game (`state.isGameOver = true`)
- Scoring uses Japanese rules: territory + opponent's captured stones + komi (6.5)

## Board Sizes

- 9×9: 입문 미니게임 (star points: 5개)
- 13×13: 초급 (star points: 5개)
- 19×19: 정식 바둑 (star points: 9개)

## Phase Status

- **Phase 0** ✅ — Core engine + all 6 screens + Canvas board
- **Phase 1** 🔜 — Real tsumego data, full lesson content, Supabase auth
- **Phase 2** 🔜 — 13x13/19x19 optimization, XP sync, external puzzle API
- **Phase 3** 🔜 — AI opponent (GnuGo WASM or KataGo lite)
