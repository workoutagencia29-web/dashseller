import type { ReactNode } from 'react'
import { X, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatCurrency } from '../../lib/utils'

/* --------------------------- Card de saldo ---------------------------- */

export function BalanceCard({
  label,
  value,
  obs,
  icon: Icon,
  action,
}: {
  label: string
  value: number
  obs: string
  icon: LucideIcon
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card-muted text-muted">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-[22px] font-bold leading-none tracking-tight text-foreground">{formatCurrency(value)}</p>
      <p className="mt-2 text-xs text-muted">{obs}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}

/* --------------------------- Abas internas ---------------------------- */

export function InternalTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="inline-flex gap-1 rounded-xl bg-card-muted/60 p-1">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            active === t ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------- Modal -------------------------------- */

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
