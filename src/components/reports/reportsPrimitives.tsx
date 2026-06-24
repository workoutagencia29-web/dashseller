import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ChevronDown, Check, Search, X, FileText, FileDown, FileArchive, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Badge, Button } from '../settings/primitives'

/* ------------------------------- Abas -------------------------------- */

const TABS = [
  { label: 'Clientes', path: '/relatorio/clientes' },
  { label: 'Entradas', path: '/relatorio/entradas' },
  { label: 'Saídas', path: '/relatorio/saidas' },
]

export function ReportTabs() {
  return (
    <div className="mb-6 flex gap-1 border-b border-border">
      {TABS.map((t) => (
        <NavLink
          key={t.path}
          to={t.path}
          className={({ isActive }) =>
            cn(
              'relative px-4 py-2.5 text-sm font-medium transition-colors',
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
  )
}

/* ----------------------------- Pesquisa ------------------------------- */

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-input/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-faint focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </div>
  )
}

/* ---------------------------- MultiSelect ----------------------------- */

export function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: string[]
  onChange: (v: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt])
  }

  const summary = selected.length === 0 ? label : selected.length === 1 ? selected[0] : `${label}: ${selected.length}`

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors',
          selected.length ? 'border-primary/50 bg-primary/5 text-foreground' : 'border-border bg-input/60 text-foreground hover:bg-input',
        )}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute left-0 z-30 mt-2 w-52 origin-top overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/20 animate-fade-in">
          {options.map((opt) => {
            const on = selected.includes(opt)
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-card-muted"
              >
                {opt}
                <span className={cn('flex h-4 w-4 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                  {on && <Check className="h-3 w-3" strokeWidth={3} />}
                </span>
              </button>
            )
          })}
          {selected.length > 0 && (
            <button onClick={() => onChange([])} className="mt-1 w-full rounded-lg px-3 py-1.5 text-left text-xs text-muted hover:bg-card-muted hover:text-foreground">
              Limpar
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------ Badges -------------------------------- */

const statusTone: Record<string, Parameters<typeof Badge>[0]['tone']> = {
  Aprovado: 'success',
  Aprovada: 'success',
  Pendente: 'warning',
  'Em Análise': 'warning',
  'Em Revisão': 'neutral',
  Estornado: 'neutral',
  Bloqueado: 'danger',
  Chargeback: 'danger',
  Cancelado: 'danger',
  Cancelada: 'danger',
  // Financeiro
  Concluído: 'success',
  Negado: 'danger',
  Negada: 'danger',
  Ativa: 'success',
  'Em Atraso': 'warning',
  Pausada: 'neutral',
  Pago: 'success',
  Vencido: 'danger',
  Aberta: 'warning',
  'Defesa Enviada': 'info',
  Encerrada: 'neutral',
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone[status] ?? 'neutral'}>{status}</Badge>
}

export function TypeBadge({ type }: { type: string }) {
  return <Badge tone="info">{type}</Badge>
}

/* ------------------------------ Drawer -------------------------------- */

export function Drawer({ open, title, onClose, children, footer }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="scrollbar-thin absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  )
}

/** Lista de campos rótulo→valor (usada nos drawers). */
export function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export function DrawerSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-faint">{title}</h4>
      {children}
    </div>
  )
}

/* ----------------------------- Timeline ------------------------------- */

export function Timeline({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const done = i <= current
        const last = i === steps.length - 1
        return (
          <div key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={cn('flex h-4 w-4 items-center justify-center rounded-full', done ? 'bg-primary' : 'bg-card-muted')}>
                {done && <Check className="h-2.5 w-2.5 text-primary-foreground" strokeWidth={3} />}
              </span>
              {!last && <span className={cn('w-px flex-1', i < current ? 'bg-primary' : 'bg-border')} style={{ minHeight: 20 }} />}
            </div>
            <span className={cn('pb-4 text-sm', done ? 'font-medium text-foreground' : 'text-muted')}>{step}</span>
          </div>
        )
      })}
    </div>
  )
}

/* --------------------------- Export CSV ------------------------------- */

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const content = '﻿' + [headers, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Barra de exportação: CSV baixa de verdade; PDF/OFX/ZIP mostram aviso. */
export function ExportButtons({ formats, onCsv, onRefresh }: { formats: ('CSV' | 'PDF' | 'OFX' | 'ZIP')[]; onCsv: () => void; onRefresh?: () => void }) {
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  function flash(msg: string) {
    setToast(msg)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setToast(null), 2600)
  }
  function handle(fmt: string) {
    if (fmt === 'CSV') {
      onCsv()
      flash('CSV exportado ✓')
    } else {
      flash(`Exportação ${fmt} — em breve 🚧`)
    }
  }

  const icons: Record<string, ReactNode> = {
    CSV: <FileText className="h-4 w-4" />,
    PDF: <FileDown className="h-4 w-4" />,
    OFX: <FileDown className="h-4 w-4" />,
    ZIP: <FileArchive className="h-4 w-4" />,
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
        )}
        {formats.map((fmt) => (
          <Button key={fmt} variant={fmt === 'CSV' ? 'primary' : 'outline'} size="sm" onClick={() => handle(fmt)}>
            {icons[fmt]} {fmt}
          </Button>
        ))}
      </div>
      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </>
  )
}

/* -------------------------- Card wrapper ------------------------------ */

export function ReportCard({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">{children}</div>
}
