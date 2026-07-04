import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { NavLink } from 'react-router-dom'
import { ChevronDown, ChevronLeft, ChevronRight, Check, Search, X, FileText, FileDown, FileArchive, RefreshCw, MoreVertical, SlidersHorizontal, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Badge, Button } from '../settings/primitives'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { useIsMobile } from '../../hooks/useIsMobile'
import { PRESET_LABELS, type RangePreset, type DateRange } from '../../lib/date'

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
  // no mobile o placeholder fica só "Buscar" (o texto longo não cabe/ficava cortado);
  // no desktop mantém a dica completa (ex.: "Buscar nome, CPF ou CNPJ")
  const isMobile = useIsMobile()
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isMobile ? 'Buscar' : placeholder}
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
  // Afiliados (gerenciador)
  Ativo: 'success',
  'Convite enviado': 'info',
  Pausado: 'neutral',
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

export function Drawer({ open, title, onClose, children, footer, widthClass = 'max-w-md' }: { open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; widthClass?: string }) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // trava a rolagem do fundo (main + html) enquanto o drawer está aberto,
    // matando também o bounce/overscroll do documento sobre o backdrop
    const main = document.querySelector('main')
    const html = document.documentElement
    const prev = {
      mainOverflow: main?.style.overflow ?? '',
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    }
    if (main) main.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'

    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev.mainOverflow
      html.style.overflow = prev.htmlOverflow
      html.style.overscrollBehavior = prev.htmlOverscroll
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={cn('scrollbar-thin absolute right-0 top-0 flex h-full w-full flex-col border-l border-border bg-card shadow-2xl animate-fade-in', widthClass)}>
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-thin flex-1 overflow-y-auto p-6">{children}</div>
        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </div>
    </div>,
    document.body,
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

/* ----------------------------- Paginação ----------------------------- */

/** Controle de páginas (‹ 1 2 3 ›) — some quando há só 1 página. */
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (n: number) => void }) {
  if (totalPages <= 1) return null
  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Página anterior"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={cn(
            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors',
            n === page ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-card-muted hover:text-foreground',
          )}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Próxima página"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

/**
 * Linhas-fantasma (invisíveis) que preenchem os slots vazios da página,
 * mantendo a altura do card fixa independente de quantos itens a página tem.
 */
export function GhostRows({ count, colSpan, rowClassName }: { count: number; colSpan: number; rowClassName?: string }) {
  if (count <= 0) return null
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={`ghost-${i}`} aria-hidden className={cn('border-b border-transparent', rowClassName)}>
          <td className="py-3.5 pr-3" colSpan={colSpan}>
            <span className="invisible inline-flex items-center border px-3 py-1.5 text-[13px]">Ver</span>
          </td>
        </tr>
      ))}
    </>
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

/* ---------------------------- ActionMenu ------------------------------ */

export interface ActionMenuItem {
  label: string
  icon?: LucideIcon
  onClick: () => void
  /** Estilo destrutivo (vermelho). */
  danger?: boolean
  /** Desenha um divisor acima deste item. */
  separatorBefore?: boolean
}

/**
 * Menu de ações por linha (•••). Renderizado via portal com posição fixa
 * ancorada no botão — assim não é cortado pelo overflow da tabela e abre pra
 * cima quando não há espaço embaixo.
 */
export function ActionMenu({ items, label = 'Ações' }: { items: ActionMenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const MENU_W = 226

  function place() {
    const el = btnRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.right - MENU_W, window.innerWidth - MENU_W - 8))
    const estH = items.length * 40 + 16
    const top = r.bottom + 6 + estH > window.innerHeight - 8 ? Math.max(8, r.top - 6 - estH) : r.bottom + 6
    setPos({ top, left })
  }

  function toggle() {
    if (!open) place()
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function onReflow() {
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-haspopup="menu"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground',
          open && 'bg-card-muted text-foreground',
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        pos &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{ position: 'fixed', top: pos.top, left: pos.left, width: MENU_W }}
            className="z-[70] overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl shadow-black/30 animate-fade-in"
          >
            {items.map((it) => (
              <Fragment key={it.label}>
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
                  {it.icon && <it.icon className="h-4 w-4 shrink-0" />}
                  {it.label}
                </button>
              </Fragment>
            ))}
          </div>,
          document.body,
        )}
    </>
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

/* -------------------------- Filtros (toolbar) ------------------------- */

/** Descreve um filtro de forma declarativa — o desktop renderiza o dropdown
 *  normal; o mobile renderiza os chips dentro do painel "Filtros". */
export type FilterSpec =
  | { kind: 'date'; preset: RangePreset; customRange: DateRange | null; onChange: (p: RangePreset, custom?: DateRange) => void }
  | { kind: 'multi'; label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }

const DATE_PRESETS: RangePreset[] = ['all', 'today', 'yesterday', 'last7', 'last15', 'last30', 'thisMonth']

const isSpecActive = (f: FilterSpec) => (f.kind === 'date' ? f.preset !== 'all' : f.selected.length > 0)

const chipClass = (active: boolean) =>
  cn(
    'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
    active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-input/60 text-foreground hover:bg-input',
  )

/**
 * Toolbar de filtros da Relatório.
 * Desktop: linha única (dropdowns + busca à esquerda, exportar à direita) — igual antes.
 * Mobile: busca + botão "Filtros" (com contador) e um painel deslizante com as opções em chips.
 */
export function ReportFilters({
  search,
  onSearch,
  searchPlaceholder,
  filters,
  onCsv,
  onRefresh,
}: {
  search: string
  onSearch: (v: string) => void
  searchPlaceholder: string
  filters: FilterSpec[]
  onCsv: () => void
  onRefresh: () => void
}) {
  const isMobile = useIsMobile()
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeCount = filters.filter(isSpecActive).length

  if (!isMobile) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {filters.map((f, i) =>
            f.kind === 'date' ? (
              <DateRangeFilter key={i} preset={f.preset} customRange={f.customRange} onChange={f.onChange} />
            ) : (
              <MultiSelect key={i} label={f.label} options={f.options} selected={f.selected} onChange={f.onChange} />
            ),
          )}
          <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
        </div>
        <ExportButtons formats={['CSV']} onCsv={onCsv} onRefresh={onRefresh} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
        </div>
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors active:bg-input"
          >
            <SlidersHorizontal className="h-4 w-4 text-muted" />
            Filtros
            {activeCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>
      <ExportButtons formats={['CSV']} onCsv={onCsv} onRefresh={onRefresh} />

      {sheetOpen && (
        <FilterSheet
          filters={filters}
          onClear={() => filters.forEach((f) => (f.kind === 'date' ? f.onChange('all') : f.onChange([])))}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Barra de filtros só-mobile (busca + botão "Filtros" → painel de baixo com chips).
 * É o mesmo esquema do ReportFilters no mobile, porém SEM a barra de exportar —
 * pra telas (ex.: Financeiro › Geral) que no desktop não têm CSV e não devem mudar.
 * O desktop dessas telas continua renderizando seus próprios dropdowns; este
 * componente deve ficar dentro de um wrapper `lg:hidden`.
 */
export function MobileFilters({
  search,
  onSearch,
  searchPlaceholder,
  filters,
}: {
  search: string
  onSearch: (v: string) => void
  searchPlaceholder: string
  filters: FilterSpec[]
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const activeCount = filters.filter(isSpecActive).length

  return (
    <div className="flex items-center gap-2">
      <div className="min-w-0 flex-1">
        <SearchInput value={search} onChange={onSearch} placeholder={searchPlaceholder} />
      </div>
      {filters.length > 0 && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors active:bg-input"
        >
          <SlidersHorizontal className="h-4 w-4 text-muted" />
          Filtros
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
        </button>
      )}

      {sheetOpen && (
        <FilterSheet
          filters={filters}
          onClear={() => filters.forEach((f) => (f.kind === 'date' ? f.onChange('all') : f.onChange([])))}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </div>
  )
}

function FilterGroup({ spec }: { spec: FilterSpec }) {
  if (spec.kind === 'date') {
    return (
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-faint">Período</p>
        <div className="flex flex-wrap gap-2">
          {DATE_PRESETS.map((p) => (
            <button key={p} type="button" onClick={() => spec.onChange(p)} className={chipClass(spec.preset === p)}>
              {PRESET_LABELS[p]}
            </button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-faint">{spec.label}</p>
      <div className="flex flex-wrap gap-2">
        {spec.options.map((opt) => {
          const active = spec.selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => spec.onChange(active ? spec.selected.filter((s) => s !== opt) : [...spec.selected, opt])}
              className={chipClass(active)}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FilterSheet({ filters, onClear, onClose }: { filters: FilterSpec[]; onClear: () => void; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const main = document.querySelector('main')
    const prev = main?.style.overflow
    if (main) main.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev ?? ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end lg:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="scrollbar-thin relative z-10 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-5 pt-3 animate-fade-in"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="sticky top-0 z-10 -mx-5 mb-1 bg-card px-5 pb-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Filtros</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-5 py-1">
          {filters.map((f, i) => (
            <FilterGroup key={i} spec={f} />
          ))}
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onClear}>
            Limpar
          </Button>
          <Button size="md" className="flex-1" onClick={onClose}>
            Ver resultados
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* -------------------------- Card wrapper ------------------------------ */

export function ReportCard({ children }: { children: ReactNode }) {
  return <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">{children}</div>
}
