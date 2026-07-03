import { useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'
import { BottomNav } from './mobile/BottomNav'
import { PullToRefresh } from './mobile/PullToRefresh'
import { useIsMobile } from '../hooks/useIsMobile'
import { cn } from '../lib/utils'

/** Contexto passado às páginas via <Outlet> (ex: abrir o menu no mobile). */
export interface LayoutContext {
  onOpenMobile: () => void
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()

  // Páginas "focadas" (Configurações e Conta): a sidebar principal some — fica só o índice da própria página.
  const focused = pathname === '/configuracoes' || pathname === '/conta'

  // Chave por seção (1º segmento da URL) — troca de seção dispara o fade; trocar de sub-aba não.
  const section = '/' + (pathname.split('/')[1] ?? '')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        away={focused}
      />

      {/* pull-to-refresh — puxar pra baixo no topo recarrega (só mobile) */}
      <PullToRefresh scrollRef={mainRef} enabled={isMobile} />

      <main
        ref={mainRef}
        className={cn(
          // overscroll-none trava o bounce/rubber-band (não "pula" nem mostra espaço vazio) em todas as páginas
          // pb-24 no mobile reserva espaço pra bottom nav; no desktop (lg) não há barra, então pb-0
          'scrollbar-thin relative flex-1 overflow-y-auto overscroll-none pb-24 lg:pb-0',
        )}
      >
        {/* menu da conta — só na Dashboard, no canto superior direito (desktop; no mobile a home tem sua própria top bar) */}
        {pathname === '/' && (
          <div className="absolute right-5 top-5 z-30 hidden sm:right-7 sm:top-7 lg:block">
            <UserMenu />
          </div>
        )}
        <div
          key={section}
          className={cn(
            'page-fade px-5 py-6 sm:px-8 sm:py-8',
            focused ? 'w-full' : 'mx-auto max-w-[1320px]',
          )}
        >
          <Outlet context={{ onOpenMobile: () => setMobileOpen(true) } as LayoutContext} />
        </div>
      </main>

      {/* barra de navegação inferior — só no mobile */}
      <BottomNav />
    </div>
  )
}
