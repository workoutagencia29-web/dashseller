import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, UserRound, Settings, Headset, Bell, LogOut, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/utils'
import { NotificationsModal } from './NotificationsModal'

/**
 * Menu da conta (Dashboard): um sino de notificações + o avatar redondo que
 * abre um popup com Conta · Configurações · Suporte & Gerente · Logout.
 * Fecha ao clicar fora / Esc. Logout é visual por enquanto (sem backend).
 */
export function UserMenu() {
  const [open, setOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const items: { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean; separatorBefore?: boolean }[] = [
    { label: 'Conta', icon: User, onClick: () => navigate('/conta') },
    { label: 'Configurações', icon: Settings, onClick: () => navigate('/configuracoes') },
    { label: 'Suporte & Gerente', icon: Headset, onClick: () => window.open('https://wa.me/5511912002801', '_blank', 'noopener,noreferrer') },
    { label: 'Logout', icon: LogOut, danger: true, separatorBefore: true, onClick: () => {} },
  ]

  return (
    <div className="flex items-center gap-2">
      {/* sino de notificações — abre o popup de notificações */}
      <button
        type="button"
        onClick={() => setNotifOpen(true)}
        aria-label="Notificações"
        className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-card-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Bell className="h-5 w-5" />
      </button>

      {notifOpen && <NotificationsModal onClose={() => setNotifOpen(false)} />}

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Abrir menu da conta"
          aria-haspopup="menu"
          className="block rounded-full transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1b47c4] text-white">
            <UserRound className="h-5 w-5" />
          </span>
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/30 animate-fade-in"
          >
            {items.map((it) => (
              <div key={it.label}>
                {it.separatorBefore && <div className="my-1 border-t border-border" />}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false)
                    it.onClick()
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    it.danger ? 'text-negative hover:bg-negative/10' : 'text-foreground hover:bg-card-muted',
                  )}
                >
                  <it.icon className="h-4 w-4 shrink-0" />
                  {it.label}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
