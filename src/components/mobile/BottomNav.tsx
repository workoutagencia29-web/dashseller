import { Link, useLocation } from 'react-router-dom'
import { FileText, KeyRound, Home, Wallet, User, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface Tab {
  label: string
  icon: LucideIcon
  path: string
  /** prefixo que marca a aba como ativa (além do próprio path) */
  match: string
  /** prefixos que NÃO devem acender esta aba (ex.: Webhooks vive no Perfil, não em Ferramentas) */
  exclude?: string[]
  center?: boolean
}

/** As 5 áreas mantidas no mobile. "Início" fica no centro, elevado. */
const TABS: Tab[] = [
  { label: 'Relatório', icon: FileText, path: '/relatorio/entradas', match: '/relatorio' },
  { label: "API's", icon: KeyRound, path: '/integracoes/chaves-de-api', match: '/integracoes', exclude: ['/integracoes/webhooks'] },
  { label: 'Início', icon: Home, path: '/', match: '/', center: true },
  { label: 'Financeiro', icon: Wallet, path: '/financeiro/geral', match: '/financeiro' },
  { label: 'Perfil', icon: User, path: '/perfil', match: '/perfil' },
]

/**
 * Barra de navegação inferior — só no mobile (`lg:hidden`). Substitui a sidebar
 * na versão app. O desktop nunca vê essa barra. Fixa no rodapé, respeita a
 * safe-area do iOS.
 */
export function BottomNav() {
  const { pathname } = useLocation()
  const isActive = (t: Tab) => {
    if (t.exclude?.some((e) => pathname.startsWith(e))) return false
    return t.match === '/' ? pathname === '/' : pathname.startsWith(t.match)
  }

  return (
    <nav
      // bottom-nav-pad: compacta no navegador; usa a safe-area só quando instalado (standalone)
      className="bottom-nav-pad fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur-lg lg:hidden"
      aria-label="Navegação principal"
    >
      <div className="mx-auto flex h-[68px] max-w-md items-stretch justify-around px-2">
        {TABS.map((t) => {
          const active = isActive(t)
          const Icon = t.icon

          if (t.center) {
            return (
              <Link
                key={t.label}
                to={t.path}
                aria-label={t.label}
                aria-current={active ? 'page' : undefined}
                className="relative flex w-16 flex-col items-center justify-end pb-1.5"
              >
                <span
                  className={cn(
                    'absolute -top-5 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg shadow-primary/40 ring-4 ring-background transition-transform active:scale-95',
                    'bg-primary',
                  )}
                >
                  <Icon className="h-6 w-6" strokeWidth={2.2} />
                </span>
                <span className={cn('mt-9 text-[11px] font-semibold', active ? 'text-primary' : 'text-muted')}>
                  {t.label}
                </span>
              </Link>
            )
          }

          return (
            <Link
              key={t.label}
              to={t.path}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 rounded-xl transition-colors',
                active ? 'text-primary' : 'text-faint hover:text-muted',
              )}
            >
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
              <span className={cn('text-[11px]', active ? 'font-semibold' : 'font-medium')}>{t.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
