import { Lesson } from './types'

export const LESSONS: Lesson[] = [
  {
    id: 'basics-1',
    title: '바둑이란?',
    category: '기초',
    categoryLabel: '기초',
    duration: '5분',
    xpReward: 20,
    description: '바둑의 기본 개념과 규칙을 알아봅시다.',
    steps: [
      {
        type: 'text',
        title: '바둑이란 무엇인가요?',
        content:
          '바둑은 흑돌과 백돌로 영역을 차지하는 게임입니다.\n\n두 명의 플레이어가 번갈아 돌을 놓으며, 마지막에 더 넓은 집(영역)을 차지한 사람이 이깁니다.\n\n19×19가 표준이지만, 입문자는 9×9 판으로 시작하는 것을 추천합니다.',
      },
      {
        type: 'text',
        title: '교점에 돌을 놓습니다',
        content:
          '바둑판의 선과 선이 만나는 교점에 돌을 놓습니다.\n\n흑이 먼저 두고, 이후 번갈아 둡니다.\n\n아래 9×9 판에는 81개의 교점이 있습니다.',
        boardSize: 9,
        stones: { black: [], white: [] },
      },
      {
        type: 'interactive',
        title: '직접 놓아보세요!',
        content: '바둑판 가운데(천원)에 흑돌을 놓아보세요.',
        boardSize: 9,
        stones: { black: [], white: [] },
        task: {
          description: '가운데 교점(천원)에 흑돌을 놓아보세요!',
          targetPosition: [4, 4],
          highlightPositions: [[4, 4]],
          successMessage: '첫 번째 착수 성공! 이렇게 교점에 돌을 놓습니다.',
        },
      },
      {
        type: 'text',
        title: '패스와 게임 종료',
        content:
          '착수 대신 패스(손빼기)도 할 수 있습니다.\n\n두 명이 연속으로 패스하면 게임이 끝나고 집의 개수를 세어 승자를 결정합니다.\n\n다음 레슨에서는 상대 돌을 잡는 방법을 배워봅시다!',
      },
    ],
  },
  {
    id: 'basics-2',
    title: '돌 놓기와 따내기',
    category: '기초',
    categoryLabel: '기초',
    duration: '10분',
    xpReward: 30,
    description: '상대의 돌을 포위하여 잡는 방법을 배웁니다.',
    steps: [
      {
        type: 'text',
        title: '돌을 잡는 방법',
        content:
          '상대의 돌을 포위하면 잡을 수 있습니다.\n\n돌이 상하좌우로 연결된 빈 교점(활로)이 없어지면 그 돌은 잡힙니다.\n\n잡힌 돌은 판에서 제거되며 나중에 점수로 계산됩니다.',
      },
      {
        type: 'text',
        title: '활로가 하나 남은 돌',
        content:
          '백돌 하나가 흑돌 3개에 둘러싸여 있습니다.\n\n백의 활로(빈 교점)는 오직 하나! 오른쪽 방향만 남아 있습니다.\n\n흑이 그 자리에 두면 백돌을 잡을 수 있습니다.',
        boardSize: 9,
        stones: {
          black: [[3, 4], [4, 3], [5, 4]],
          white: [[4, 4]],
        },
        lastMove: [5, 4],
        highlightPositions: [[4, 5]],
      },
      {
        type: 'interactive',
        title: '백돌 하나 잡기',
        content: '백돌의 마지막 활로에 흑돌을 두어 백돌을 잡으세요.',
        boardSize: 9,
        stones: {
          black: [[3, 4], [4, 3], [5, 4]],
          white: [[4, 4]],
        },
        task: {
          description: '백돌의 마지막 활로에 흑돌을 놓아 잡으세요!',
          targetPosition: [4, 5],
          successMessage: '완벽해요! 백돌이 잡혔습니다. 활로가 0이 되면 돌이 제거됩니다.',
        },
      },
      {
        type: 'text',
        title: '연결된 돌 그룹',
        content:
          '여러 돌이 상하좌우로 이어지면 하나의 그룹으로 취급합니다.\n\n그룹의 모든 활로를 막아야 잡을 수 있습니다.\n\n아래 보드에서 백돌 2개가 연결되어 활로가 1개 남아있습니다.',
        boardSize: 9,
        stones: {
          black: [[3, 2], [3, 4], [4, 2], [4, 4], [5, 3]],
          white: [[3, 3], [4, 3]],
        },
        highlightPositions: [[2, 3]],
      },
      {
        type: 'interactive',
        title: '연결된 백돌 2개 잡기',
        content: '연결된 백돌 2개의 마지막 활로에 흑돌을 두세요.',
        boardSize: 9,
        stones: {
          black: [[3, 2], [3, 4], [4, 2], [4, 4], [5, 3]],
          white: [[3, 3], [4, 3]],
        },
        task: {
          description: '백돌 그룹의 마지막 활로에 흑돌을 놓으세요!',
          targetPosition: [2, 3],
          highlightPositions: [[2, 3]],
          successMessage: '훌륭해요! 연결된 돌 2개를 한 번에 잡았습니다!',
        },
      },
    ],
  },
  {
    id: 'basics-3',
    title: '활로(Liberty)의 개념',
    category: '기초',
    categoryLabel: '기초',
    duration: '8분',
    xpReward: 25,
    description: '돌의 생명인 활로 개념을 이해합니다.',
    steps: [
      {
        type: 'text',
        title: '활로란?',
        content:
          '활로(活路)는 돌에게 생명입니다.\n\n돌이 상하좌우로 직접 연결된 빈 교점이 활로입니다.\n\n가운데 돌은 최대 4개, 변의 돌은 3개, 귀의 돌은 2개의 활로를 가집니다.',
      },
      {
        type: 'text',
        title: '가운데: 활로 4개',
        content:
          '가운데에 있는 흑돌은 상하좌우 모두 비어있어 활로가 4개입니다.\n\n파란 점으로 활로 위치를 표시했습니다.',
        boardSize: 9,
        stones: { black: [[4, 4]], white: [] },
        lastMove: [4, 4],
        highlightPositions: [[3, 4], [5, 4], [4, 3], [4, 5]],
      },
      {
        type: 'text',
        title: '변: 활로 3개',
        content:
          '변에 있는 돌은 한쪽이 바둑판 경계로 막혀 활로가 3개입니다.\n\n바둑판 경계는 자연스러운 장벽 역할을 합니다.',
        boardSize: 9,
        stones: { black: [[4, 0]], white: [] },
        lastMove: [4, 0],
        highlightPositions: [[3, 0], [5, 0], [4, 1]],
      },
      {
        type: 'text',
        title: '귀: 활로 2개',
        content:
          '귀(코너)에 있는 돌은 두 방향이 막혀 활로가 2개뿐입니다.\n\n귀는 활로가 적어 잡기 쉽지만, 수비 시에는 적은 돌로 넓은 집을 만들 수 있습니다.',
        boardSize: 9,
        stones: { black: [[0, 0]], white: [] },
        lastMove: [0, 0],
        highlightPositions: [[0, 1], [1, 0]],
      },
      {
        type: 'interactive',
        title: '귀에서 잡아보세요',
        content:
          '귀에 있는 백돌의 활로는 2개뿐입니다. 흑이 하나를 막았으니, 나머지 활로를 막아 백돌을 잡으세요.',
        boardSize: 9,
        stones: {
          black: [[0, 1]],
          white: [[0, 0]],
        },
        task: {
          description: '귀의 백돌 마지막 활로에 흑돌을 놓아 잡으세요!',
          targetPosition: [1, 0],
          highlightPositions: [[1, 0]],
          successMessage: '정확합니다! 귀에서는 활로가 2개뿐이라 잡기 쉽습니다.',
        },
      },
    ],
  },
  {
    id: 'basics-4',
    title: '집(Territory) 만들기',
    category: '기초',
    categoryLabel: '기초',
    duration: '12분',
    xpReward: 35,
    description: '바둑의 목표인 집 만들기를 배웁니다.',
    steps: [
      {
        type: 'text',
        title: '집이란?',
        content:
          '집(集)은 내 돌이 완전히 둘러싼 빈 교점입니다.\n\n게임이 끝나면 집의 개수 + 잡은 돌 수로 점수를 계산합니다.\n\n바둑의 궁극적인 목표는 더 많은 집을 만드는 것입니다.',
      },
      {
        type: 'text',
        title: '흑의 집 — 2집',
        content:
          '흑돌이 2개의 빈 교점을 완전히 둘러쌌습니다.\n\n파란 점으로 표시된 빈 교점들이 흑의 집입니다.\n\n백은 이 빈 교점에 들어올 수 없습니다.',
        boardSize: 9,
        stones: {
          black: [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 4], [3, 1], [3, 2], [3, 3], [3, 4]],
          white: [],
        },
        highlightPositions: [[2, 2], [2, 3]],
      },
      {
        type: 'text',
        title: '귀를 활용하면 유리해요',
        content:
          '귀를 활용하면 적은 돌로 넓은 집을 만들 수 있습니다.\n\n흑돌 5개로 귀에서 4집(파란 점)을 완전히 가뒀습니다.\n\n같은 4집을 가운데에서 만들려면 돌이 훨씬 더 많이 필요합니다!',
        boardSize: 9,
        stones: {
          black: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]],
          white: [],
        },
        highlightPositions: [[0, 0], [0, 1], [1, 0], [1, 1]],
      },
      {
        type: 'interactive',
        title: '귀 집 완성하기',
        content: '흑돌 4개가 있습니다. 마지막 돌 하나를 놓아 귀에서 4집을 완전히 가두세요.',
        boardSize: 9,
        stones: {
          black: [[0, 2], [1, 2], [2, 0], [2, 1]],
          white: [],
        },
        task: {
          description: '[2,2]에 흑돌을 두어 귀의 집을 완성하세요!',
          targetPosition: [2, 2],
          highlightPositions: [[2, 2]],
          successMessage: '완성! 흑이 귀에서 4집([0,0][0,1][1,0][1,1])을 차지했습니다.',
        },
      },
    ],
  },
  {
    id: 'basics-5',
    title: '두 집 살기 (Two Eyes)',
    category: '기초',
    categoryLabel: '기초',
    duration: '10분',
    xpReward: 40,
    description: '절대로 잡힐 수 없는 그룹을 만드는 비결을 배웁니다.',
    steps: [
      {
        type: 'text',
        title: '두 집의 비밀',
        content:
          '바둑에서 절대로 잡힐 수 없는 그룹을 만드는 비결이 있습니다.\n\n바로 두 집(Two Eyes)!\n\n그룹 안에 독립된 빈 교점(눈)이 2개 있으면 영원히 살 수 있습니다.',
      },
      {
        type: 'text',
        title: '두 집이 있는 그룹 — 영생',
        content:
          '흑 그룹 안에 두 개의 완전히 독립된 눈([1,1]과 [1,3])이 있습니다.\n\n[1,2]의 흑돌이 두 눈을 갈라놓아 서로 연결되지 않습니다.\n\n백이 한쪽 눈을 채우면 자충수(自充手)! 이 그룹은 영원히 삽니다.',
        boardSize: 9,
        stones: {
          black: [[0, 1], [0, 3], [1, 0], [1, 2], [1, 4], [2, 1], [2, 2], [2, 3]],
          white: [[0, 0], [0, 4], [1, 5], [2, 4], [3, 1], [3, 2], [3, 3]],
        },
        highlightPositions: [[1, 1], [1, 3]],
      },
      {
        type: 'text',
        title: '눈이 하나면 잡힌다',
        content:
          '아래 흑 그룹은 [1,2]에 돌이 없어 눈 세 개([1,1][1,2][1,3])가 모두 연결된 하나의 공간입니다.\n\n이것은 두 집이 아닌 한 집! 백이 외부를 포위하면 잡힐 수 있습니다.\n\n[1,2]에 흑돌을 놓으면 두 눈으로 분리되어 살 수 있습니다.',
        boardSize: 9,
        stones: {
          black: [[0, 1], [0, 3], [1, 0], [1, 4], [2, 1], [2, 2], [2, 3]],
          white: [[0, 0], [0, 4], [1, 5], [2, 4], [3, 1], [3, 2], [3, 3]],
        },
        highlightPositions: [[1, 1], [1, 2], [1, 3]],
      },
      {
        type: 'interactive',
        title: '두 눈으로 갈라 살리기',
        content: '[1,2]에 흑돌을 놓아 하나의 큰 공간을 두 개의 독립된 눈으로 나눠 그룹을 살리세요.',
        boardSize: 9,
        stones: {
          black: [[0, 1], [0, 3], [1, 0], [1, 4], [2, 1], [2, 2], [2, 3]],
          white: [[0, 0], [0, 4], [1, 5], [2, 4], [3, 1], [3, 2], [3, 3]],
        },
        task: {
          description: '[1,2]에 흑돌을 놓아 공간을 두 눈으로 나누세요!',
          targetPosition: [1, 2],
          highlightPositions: [[1, 2]],
          successMessage: '완벽! [1,2]에 돌을 놓아 [1,1]과 [1,3]이 완전히 분리됐습니다. 이 그룹은 영원히 살아있습니다!',
        },
      },
    ],
  },
]

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getNextLesson(currentId: string): Lesson | undefined {
  const idx = LESSONS.findIndex((l) => l.id === currentId)
  return idx >= 0 && idx < LESSONS.length - 1 ? LESSONS[idx + 1] : undefined
}
