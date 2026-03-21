interface StreakCardProps {
  streak: number
  xp: number
}

const DAYS = ['월', '화', '수', '목', '금', '토', '일']

export default function StreakCard({ streak, xp }: StreakCardProps) {
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  return (
    <div className="rounded-3xl p-5 flex flex-col gap-4" style={{ backgroundColor: '#fcf9f3' }}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-label text-[11px] uppercase tracking-widest mb-0.5" style={{ color: '#65655c' }}>
            나의 여정
          </p>
          <h3 className="font-headline font-bold text-xl" style={{ color: '#383831' }}>
            {streak}일 연속 학습 🔥
          </h3>
        </div>
        <div className="flex items-center gap-1" style={{ color: '#6f6252' }}>
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            stars
          </span>
          <span className="font-bold text-sm">{xp.toLocaleString()} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {DAYS.map((day, i) => {
          const isDone = i < todayIndex
          const isToday = i === todayIndex

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className="h-10 w-full rounded-lg transition-all"
                style={{
                  backgroundColor: isDone
                    ? '#6f6252'        /* 완료: 진한 갈색 */
                    : isToday
                    ? '#9c8070'        /* 오늘: 중간 갈색 */
                    : '#eae8de',       /* 미완료: 연한 회색 */
                  opacity: isDone ? 0.85 : 1,
                  boxShadow: isToday ? '0 0 0 2px #f4e3ce, 0 0 0 3px #9c8070' : 'none',
                }}
              />
              <span
                className="text-[9px] font-semibold"
                style={{ color: isToday ? '#6f6252' : '#65655c' }}
              >
                {day}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-center font-medium" style={{ color: '#65655c', opacity: 0.7 }}>
        오늘의 사활 문제를 풀어 스트릭을 유지하세요.
      </p>
    </div>
  )
}
