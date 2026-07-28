import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, CalendarDays, Check, ArrowLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useIsMobile } from '../../hooks/useIsMobile'
import { CustomRangeFields } from './CustomRangeFields'
import { BottomSheet } from './BottomSheet'
import {
  PRESET_ORDER,
  PRESET_LABELS,
  formatShort,
  formatDayMonth,
  formatRangeShort,
  type RangePreset,
  type DateRange,
} from '../../lib/date'

interface DateRangeFilterProps {
  preset: RangePreset
  customRange: DateRange | null
  onChange: (preset: RangePreset, custom?: DateRange) => void
  /** Início dos dados da tela — vira o piso navegável do calendário. */
  minDate?: Date
}

const PANEL_W = 320

export function DateRangeFilter({ preset, customRange, onChange, minDate }: DateRangeFilterProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'presets' | 'custom'>('presets')
  const [alignRight, setAlignRight] = useState(false)
  const [openUp, setOpenUp] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  function toggle() {
    if (!open && ref.current) {
      const r = ref.current.getBoundingClientRect()
      setAlignRight(r.left + PANEL_W > window.innerWidth - 8)
    }
    setOpen((o) => !o)
  }

  function fechar(devolveFoco = false) {
    setOpen(false)
    if (devolveFoco) triggerRef.current?.focus()
  }

  // Flip vertical medindo o painel REAL — ele muda de altura entre as duas views
  // (presets ~320px, personalizado ~460px), então um cálculo único na abertura erra.
  useLayoutEffect(() => {
    if (!open || isMobile || !ref.current || !panelRef.current) return
    const gatilho = ref.current.getBoundingClientRect()
    const h = panelRef.current.offsetHeight
    setOpenUp(gatilho.bottom + 8 + h > window.innerHeight - 8 && gatilho.top > h + 16)
  }, [open, view, isMobile])

  useEffect(() => {
    if (!open || isMobile) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') fechar(true)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, isMobile])

  // volta pros presets ao fechar
  useEffect(() => {
    if (!open) setView('presets')
  }, [open])

  // girar o aparelho / cruzar o breakpoint não pode deixar overlay órfão
  useEffect(() => {
    setOpen(false)
  }, [isMobile])

  const label =
    preset === 'custom' && customRange ? formatRangeShort(customRange) : PRESET_LABELS[preset]
  const descricao =
    preset === 'custom' && customRange
      ? `Período personalizado: ${formatShort(customRange.from)} até ${formatShort(customRange.to)}`
      : `Período: ${PRESET_LABELS[preset]}`

  function escolherPreset(p: RangePreset) {
    onChange(p)
    fechar()
  }

  function aplicar(range: DateRange) {
    onChange('custom', range)
    fechar()
  }

  const listaPresets = (
    <>
      {PRESET_ORDER.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => escolherPreset(p)}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
            preset === p
              ? 'bg-primary/10 font-medium text-primary'
              : 'text-foreground hover:bg-card-muted',
          )}
        >
          <span>{PRESET_LABELS[p]}</span>
          {preset === p && <Check className="h-4 w-4 shrink-0" />}
        </button>
      ))}
    </>
  )

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        title={descricao}
        aria-label={descricao}
        aria-expanded={open}
        className={cn(
          'flex max-w-[230px] items-center gap-2 rounded-xl border bg-input/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-input',
          open ? 'border-primary/40' : 'border-border',
        )}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
        <span className="truncate tabular-nums">{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {/* ---------------------------- Celular ---------------------------- */}
      {open && isMobile && (
        <BottomSheet title="Período" onClose={() => setOpen(false)}>
          <div className="space-y-4 py-1">
            <div className="flex flex-wrap gap-2">
              {PRESET_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => escolherPreset(p)}
                  className={cn(
                    'min-h-11 rounded-full border px-3.5 text-sm font-medium transition-colors',
                    preset === p
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-input/60 text-foreground active:bg-input',
                  )}
                >
                  {PRESET_LABELS[p]}
                </button>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-faint">
                Período personalizado
              </p>
              <CustomRangeFields value={customRange} minDate={minDate} touch onApply={aplicar} />
            </div>
          </div>
        </BottomSheet>
      )}

      {/* ---------------------------- Desktop ---------------------------- */}
      {open && !isMobile && (
        <div
          ref={panelRef}
          className={cn(
            // largura fluida: nunca passa da viewport em janelas estreitas
            'scrollbar-thin absolute z-30 max-h-[calc(100vh-5rem)] w-[min(320px,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-border bg-card shadow-xl shadow-black/30 animate-fade-in',
            alignRight ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            openUp ? 'bottom-full mb-2' : 'mt-2',
          )}
        >
          {view === 'presets' ? (
            <div className="p-1.5">
              {listaPresets}

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={() => setView('custom')}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  preset === 'custom'
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-card-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 shrink-0" />
                  <span>
                    Período personalizado
                    {preset !== 'custom' && customRange && (
                      <span className="block text-[11px] font-normal tabular-nums text-faint">
                        Último: {formatDayMonth(customRange.from)} – {formatDayMonth(customRange.to)}
                      </span>
                    )}
                  </span>
                </span>
                {preset === 'custom' ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-faint" />
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
                <button
                  type="button"
                  onClick={() => setView('presets')}
                  aria-label="Voltar aos períodos"
                  className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-semibold text-foreground">Período personalizado</span>
              </div>
              <div className="p-3">
                <CustomRangeFields value={customRange} minDate={minDate} onApply={aplicar} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
