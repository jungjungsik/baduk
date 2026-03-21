interface HeaderProps {
  title?: string
  showBack?: boolean
  rightElement?: React.ReactNode
}

export default function Header({ title = '흑백', showBack = false, rightElement }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex items-center justify-between px-5 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-primary">arrow_back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-on-surface flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-surface" />
              </div>
              <h1 className="font-headline font-bold text-lg tracking-tight text-on-surface">
                {title}
              </h1>
            </div>
          )}
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </header>
  )
}
