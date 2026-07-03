import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import type { LayoutContext } from '../Layout'
import { cn } from '../../lib/utils'

const TABS = [
  { label: 'Webhooks', path: '/integracoes/webhooks' },
  { label: 'Chaves de API', path: '/integracoes/chaves-de-api' },
  { label: 'Integrações', path: '/integracoes/conexoes' },
]

/**
 * Switcher das ferramentas — só no mobile (`lg:hidden`). No mobile a bottom nav
 * leva pra "Ferramentas" e este seletor troca entre Webhooks / Chaves de API /
 * Integrações (que no desktop são alcançadas pela sidebar). No desktop fica
 * escondido, então as páginas renderizam exatamente como antes.
 */
export function FerramentasTabs() {
  // repassa o contexto do Layout (onOpenMobile) pras páginas filhas
  const ctx = useOutletContext<LayoutContext>()
  return (
    <>
      <div className="scrollbar-thin mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        {TABS.map((t) => (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted hover:text-foreground',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <Outlet context={ctx} />
    </>
  )
}
