import { Menu } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
  onOpenMobile: () => void
}

export function Header({ title, subtitle, onOpenMobile }: HeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-4">
      {/* hambúrguer escondido no mobile — a bottom nav (app) substitui a sidebar; o desktop já não mostrava */}
      <button
        onClick={onOpenMobile}
        className="hidden rounded-lg border border-border bg-card p-2 text-foreground"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
    </header>
  )
}
