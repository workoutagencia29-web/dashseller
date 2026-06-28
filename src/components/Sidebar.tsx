import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronsLeft, Settings, Sun, Moon } from 'lucide-react'
import { navItems, type NavItem } from '../data/mockData'
import { cn } from '../lib/utils'
import { useTheme } from '../context/ThemeContext'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
  /** quando true, a sidebar desliza pra fora (esquerda) — ex.: na página de Configurações */
  away?: boolean
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, away = false }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  const { pathname } = useLocation()
  const matchPath = (p: string) => pathname === p || pathname.startsWith(p + '/')

  const activeGroup =
    navItems.find((i) => i.children?.some((c) => matchPath(c.path)))?.label ?? null
  const [expanded, setExpanded] = useState<string | null>(activeGroup)

  // keep the group of the current route open as you navigate
  useEffect(() => {
    if (activeGroup) setExpanded(activeGroup)
  }, [activeGroup])

  function renderItem(item: NavItem) {
    const Icon = item.icon
    const hasChildren = !!item.children?.length
    const isOpen = expanded === item.label
    const directActive = !!item.path && pathname === item.path
    const groupActive = item.children?.some((c) => matchPath(c.path)) ?? false

    // Disabled item (Marketplace — Em Breve)
    if (item.disabled) {
      return (
        <div
          key={item.label}
          title={collapsed ? `${item.label} · ${item.badge}` : undefined}
          className={cn(
            'flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-faint',
            collapsed && 'justify-center px-0',
          )}
        >
          <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="rounded-md bg-card-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-faint">
                  {item.badge}
                </span>
              )}
            </>
          )}
        </div>
      )
    }

    // Direct link (Dashboard, Integrações)
    if (item.path) {
      return (
        <Link
          key={item.label}
          to={item.path}
          onClick={onCloseMobile}
          title={collapsed ? item.label : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            collapsed && 'justify-center px-0',
            directActive
              ? 'bg-primary text-primary-foreground shadow-glow'
              : 'text-muted hover:bg-card-muted hover:text-foreground',
          )}
        >
          <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
        </Link>
      )
    }

    // Group with submenu (Relatório, Financeiro, Produto)
    return (
      <div key={item.label}>
        <button
          onClick={() => {
            if (collapsed) {
              onToggleCollapse()
              setExpanded(item.label)
            } else {
              setExpanded(isOpen ? null : item.label)
            }
          }}
          title={collapsed ? item.label : undefined}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
            collapsed && 'justify-center px-0',
            groupActive ? 'text-foreground' : 'text-muted hover:bg-card-muted hover:text-foreground',
          )}
        >
          <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
          {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
          {!collapsed && hasChildren && (
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          )}
        </button>

        {!collapsed && hasChildren && (
          <div
            className={cn(
              'grid transition-all duration-300 ease-in-out',
              isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <div className="ml-[26px] mt-1 space-y-0.5 border-l border-border pl-3">
                {item.children!.map((child) => {
                  const childActive = matchPath(child.path)
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={onCloseMobile}
                      className={cn(
                        'block w-full rounded-lg px-3 py-1.5 text-left text-[13px] transition-colors',
                        childActive
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted hover:bg-card-muted hover:text-foreground',
                      )}
                    >
                      {child.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{ marginLeft: away ? (collapsed ? -84 : -264) : 0 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-border bg-sidebar transition-[width,margin,transform] duration-300 ease-in-out lg:static lg:translate-x-0',
          collapsed ? 'w-[84px]' : 'w-[264px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // desliza pra fora pela esquerda na rota de Configurações (margem negativa reflui o conteúdo junto)
          away && 'lg:pointer-events-none',
        )}
      >
        {/* Brand */}
        <div className={cn('flex h-[88px] items-center gap-3 px-5', collapsed && 'justify-center px-0')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-primary-foreground shadow-glow">
            N
          </div>
          {!collapsed && (
            <span className="flex-1 text-[20px] font-bold tracking-tight text-foreground">Nummo</span>
          )}
          {!collapsed && (
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-card-muted hover:text-foreground lg:block"
              aria-label="Recolher menu"
            >
              <ChevronsLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="mx-auto mb-2 hidden rounded-lg p-1.5 text-muted transition-colors hover:bg-card-muted hover:text-foreground lg:block"
            aria-label="Expandir menu"
          >
            <ChevronsLeft className="h-5 w-5 rotate-180" />
          </button>
        )}

        {/* Nav */}
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto overscroll-none px-3 py-2">
          {navItems.map(renderItem)}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-border px-3 py-3">
          <Link
            to="/configuracoes"
            onClick={onCloseMobile}
            title={collapsed ? 'Configurações' : undefined}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              collapsed && 'justify-center px-0',
              pathname === '/configuracoes'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : 'text-muted hover:bg-card-muted hover:text-foreground',
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Configurações</span>}
          </Link>

          <ThemeToggle collapsed={collapsed} theme={theme} onSet={setTheme} />
        </div>
      </aside>
    </>
  )
}

function ThemeToggle({
  collapsed,
  theme,
  onSet,
}: {
  collapsed: boolean
  theme: 'light' | 'dark'
  onSet: (t: 'light' | 'dark') => void
}) {
  if (collapsed) {
    return (
      <button
        onClick={() => onSet(theme === 'dark' ? 'light' : 'dark')}
        className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-card-muted text-foreground transition-colors hover:bg-input"
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
    )
  }

  const pillTransition = { type: 'spring' as const, stiffness: 380, damping: 32 }

  return (
    <div className="mt-1 flex items-center gap-1 rounded-xl bg-card-muted p-1">
      <button
        onClick={() => onSet('light')}
        className={cn(
          'relative flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors',
          theme === 'light' ? 'text-foreground' : 'text-muted hover:text-foreground',
        )}
      >
        {theme === 'light' && (
          <motion.span
            layoutId="theme-pill"
            transition={pillTransition}
            className="absolute inset-0 rounded-lg bg-card shadow-sm"
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Claro
        </span>
      </button>
      <button
        onClick={() => onSet('dark')}
        className={cn(
          'relative flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors',
          theme === 'dark' ? 'text-primary-foreground' : 'text-muted hover:text-foreground',
        )}
      >
        {theme === 'dark' && (
          <motion.span
            layoutId="theme-pill"
            transition={pillTransition}
            className="absolute inset-0 rounded-lg bg-primary shadow-sm"
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Moon className="h-4 w-4" />
          Escuro
        </span>
      </button>
    </div>
  )
}
