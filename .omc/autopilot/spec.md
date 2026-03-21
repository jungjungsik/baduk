# 흑백 (Heukbaek) - Phase 0 Specification

## 프로젝트 개요
교육용 바둑 PWA 앱. 바둑을 모르는 입문자가 배우기 위한 앱.
앱 이름: 흑백 (Heukbaek) — 흑돌과 백돌을 의미

## 기술 스택
- Next.js 15 (App Router) + TypeScript (strict)
- Tailwind CSS (커스텀 디자인 시스템)
- Serwist (PWA)
- Zustand (상태 관리)
- Google Fonts (Manrope, Plus Jakarta Sans)
- Material Symbols Outlined (아이콘)

## Phase 0 목표
바둑판 렌더링 + 기본 규칙 엔진 PoC

## 화면 구성
- / : 홈 (스트릭, XP, 피처드 레슨, 큐레이티드 경로, 최근 기록)
- /study : 스터디 (기초/정석/사활)
- /practice : 연습 (단계별 레슨 + 바둑판)
- /puzzle : 사활 퍼즐
- /play : 대국 (9x9/13x13/19x19 선택, AI 대국)
- /profile : 프로필

## 바둑판 스펙
- Canvas 기반 렌더링
- 9x9, 13x13, 19x19 지원
- 목재 질감 배경 (#e8e2d6)
- 격자선 + 성점(화점)
- 흑/백 돌 렌더링 (그라디언트 + 그림자)
- 클릭/터치로 착수
- 마지막 착수 마커

## 바둑 규칙 엔진 스펙
순수 함수 기반:
- createBoard(size) → Color[][]
- placeStone(state, pos, color) → GameState | Error
- findGroup(board, pos) → Position[]
- countLiberties(board, group) → number
- captureDeadStones(board, pos, color) → { board, captured }
- isKo(state, pos) → boolean
- isSuicide(board, pos, color) → boolean
- pass(state) → GameState

## 디자인 토큰 (Tailwind)
surface: #fffcf7
primary: #5f5e5e
secondary: #68645b
tertiary: #6f6252
tertiary-container: #f4e3ce
tertiary-fixed: #f4e3ce
on-surface: #383831
outline-variant: #babab0
