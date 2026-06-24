import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import { Header } from '../Header'
import type { LayoutContext } from '../Layout'
import { cn } from '../../lib/utils'

const TABS = [
  { label: 'Geral', path: '/financeiro/geral' },
  { label: 'Assinaturas', path: '/financeiro/assinaturas' },
  { label: 'Link de Pagamento', path: '/financeiro/link-de-pagamento' },
  { label: 'Contestações', path: '/financeiro/contestacoes' },
  { label: 'Taxas', path: '/financeiro/taxas' },
]

export function FinanceiroLayout() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  return (
    <>
      <Header title="Financeiro" subtitle="Saldo, assinaturas, contestações e taxas." onOpenMobile={onOpenMobile} />
      <div className="scrollbar-thin mb-6 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) =>
              cn(
                'relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {t.label}
                {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </>
  )
}
