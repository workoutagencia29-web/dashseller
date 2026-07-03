import { Menu } from 'lucide-react'
import { cn } from '../lib/utils'
import { useIsMobile } from '../hooks/useIsMobile'
import { useScrollCollapse } from '../hooks/useScrollCollapse'

interface HeaderProps {
  title: string
  subtitle?: string
  onOpenMobile: () => void
}

export function Header({ title, subtitle, onOpenMobile }: HeaderProps) {
  // No mobile o cabeçalho fixa no topo e encolhe ao rolar (título menor, subtítulo some).
  // Tudo gated por isMobile — no desktop `collapsed` é sempre false e nenhuma classe mobile entra.
  const isMobile = useIsMobile()
  const collapsed = useScrollCollapse(16, isMobile)

  return (
    <header
      className={cn(
        'mb-6 flex items-center gap-4',
        isMobile && 'sticky top-0 z-20 -mx-5 px-5 transition-all duration-300 sm:-mx-8 sm:px-8',
        isMobile && (collapsed ? 'border-b border-border bg-background/85 py-3 backdrop-blur-lg' : 'py-2'),
      )}
    >
      {/* hambúrguer escondido no mobile — a bottom nav (app) substitui a sidebar; o desktop já não mostrava */}
      <button
        onClick={onOpenMobile}
        className="hidden rounded-lg border border-border bg-card p-2 text-foreground"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="min-w-0">
        <h1
          className={cn(
            'font-bold tracking-tight text-foreground',
            isMobile && 'transition-all duration-300',
            isMobile && collapsed ? 'text-lg' : 'text-2xl sm:text-[26px]',
          )}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={cn(
              'text-sm text-muted',
              isMobile && 'overflow-hidden transition-all duration-300',
              isMobile ? (collapsed ? 'mt-0 max-h-0 opacity-0' : 'mt-1 max-h-10 opacity-100') : 'mt-1',
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
    </header>
  )
}
