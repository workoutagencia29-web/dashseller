import { useEffect, useRef, useState } from 'react'
import { ChevronDown, CalendarDays, Check, ArrowLeft } from 'lucide-react'
import { DayPicker, type DateRange as RdpRange } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { cn } from '../../lib/utils'
import {
  PRESET_LABELS,
  formatShort,
  startOfDay,
  endOfDay,
  type RangePreset,
  type DateRange,
} from '../../lib/date'

const PRESETS: RangePreset[] = [
  'today',
  'yesterday',
  'last7',
  'last15',
  'last30',
  'thisMonth',
  'all',
]

interface DateRangeFilterProps {
  preset: RangePreset
  customRange: DateRange | null
  onChange: (preset: RangePreset, custom?: DateRange) => void
}

export function DateRangeFilter({ preset, customRange, onChange }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'presets' | 'calendar'>('presets')
  const [sel, setSel] = useState<RdpRange | undefined>(undefined)
  const ref = useRef<HTMLDivElement>(null)

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

  // reset to presets view whenever the popover closes
  useEffect(() => {
    if (!open) setView('presets')
  }, [open])

  const label =
    preset === 'custom' && customRange
      ? `${formatShort(customRange.from)} – ${formatShort(customRange.to)}`
      : PRESET_LABELS[preset]

  function choosePreset(p: RangePreset) {
    onChange(p)
    setOpen(false)
  }

  function openCustom() {
    setSel(customRange ? { from: customRange.from, to: customRange.to } : undefined)
    setView('calendar')
  }

  function applyCustom() {
    if (sel?.from && sel?.to) {
      onChange('custom', { from: startOfDay(sel.from), to: endOfDay(sel.to) })
      setOpen(false)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-border bg-input/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-input"
      >
        <CalendarDays className="h-4 w-4 text-muted" />
        <span className="truncate">{label}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 origin-top-right overflow-hidden rounded-xl border border-border bg-card shadow-xl shadow-black/30 animate-fade-in">
          {view === 'presets' ? (
            <div className="w-52 p-1.5">
              {PRESETS.map((p) => {
                const selected = preset === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => choosePreset(p)}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      selected
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-foreground hover:bg-card-muted',
                    )}
                  >
                    <span>{PRESET_LABELS[p]}</span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                )
              })}

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onClick={openCustom}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  preset === 'custom'
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-card-muted',
                )}
              >
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Período personalizado
                </span>
                {preset === 'custom' && <Check className="h-4 w-4 shrink-0" />}
              </button>
            </div>
          ) : (
            <div className="w-[326px]">
              <button
                type="button"
                onClick={() => setView('presets')}
                className="flex w-full items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

              <div className="flex justify-center px-3 pt-2">
                <DayPicker
                  mode="range"
                  locale={ptBR}
                  selected={sel}
                  onSelect={setSel}
                  numberOfMonths={1}
                  defaultMonth={sel?.from ?? new Date()}
                  disabled={{ after: new Date() }}
                />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
                <span className="text-xs text-muted">
                  {sel?.from ? formatShort(sel.from) : '--/--'} –{' '}
                  {sel?.to ? formatShort(sel.to) : '--/--'}
                </span>
                <button
                  type="button"
                  disabled={!sel?.from || !sel?.to}
                  onClick={applyCustom}
                  className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
