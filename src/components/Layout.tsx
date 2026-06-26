import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { LogoutButton } from './LogoutButton'
import { cn } from '../lib/utils'

/** Contexto passado às páginas via <Outlet> (ex: abrir o menu no mobile). */
export interface LayoutContext {
  onOpenMobile: () => void
}

export function Layout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  // Na página de Configurações a sidebar principal some — fica só o índice da própria página.
  const focusedSettings = pathname === '/configuracoes' || pathname.startsWith('/configuracoes/')

  // A tela de Logs preenche a altura e NÃO rola (layout travado em viewport).
  const isLogs = pathname === '/equipe/logs'

  // Chave por seção (1º segmento da URL) — troca de seção dispara o fade; trocar de sub-aba não.
  const section = '/' + (pathname.split('/')[1] ?? '')

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        away={focusedSettings}
      />

      <main
        className={cn(
          // overscroll-none trava o bounce/rubber-band (não "pula" nem mostra espaço vazio) em todas as páginas
          'scrollbar-thin relative flex-1 overscroll-none',
          // Logs preenche a altura e não rola; demais páginas rolam normalmente
          isLogs ? 'overflow-hidden' : 'overflow-y-auto',
        )}
      >
        {/* Botão de logout — fica no topo da página e some ao rolar (escondido na tela focada de Configurações) */}
        {!focusedSettings && (
          <div className="absolute right-5 top-5 z-30 sm:right-7 sm:top-7">
            <LogoutButton />
          </div>
        )}
        <div
          key={section}
          className={cn(
            'page-fade px-5 sm:px-8',
            // Logs usa padding vertical menor para os 5 registros caberem sem scroll
            isLogs ? 'py-5' : 'py-6 sm:py-8',
            focusedSettings ? 'w-full' : 'mx-auto max-w-[1320px]',
            // na tela de Logs o conteúdo vira coluna que preenche a altura (sem scroll)
            isLogs && 'flex h-full min-h-0 flex-col',
          )}
        >
          <Outlet context={{ onOpenMobile: () => setMobileOpen(true) } as LayoutContext} />
        </div>
      </main>
    </div>
  )
}
