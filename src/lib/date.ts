/* Date helpers + period presets for the performance chart filter. */

export interface DateRange {
  from: Date
  to: Date
}

export type RangePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last15'
  | 'last30'
  | 'thisMonth'
  | 'all'
  | 'custom'

/** Ordem canônica dos presets — fonte única pro desktop e pro mobile (sem 'custom'). */
export const PRESET_ORDER: RangePreset[] = [
  'today',
  'yesterday',
  'last7',
  'last15',
  'last30',
  'thisMonth',
  'all',
]

export const PRESET_LABELS: Record<RangePreset, string> = {
  today: 'Hoje',
  yesterday: 'Ontem',
  last7: 'Últimos 7 dias',
  last15: 'Últimos 15 dias',
  last30: 'Últimos 30 dias',
  thisMonth: 'Este mês',
  all: 'Todo período',
  custom: 'Período personalizado',
}

/** Presets rendered by hour (00h–23h) instead of by day. */
export function isHourly(preset: RangePreset): boolean {
  return preset === 'today' || preset === 'yesterday'
}

export function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export function endOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

export function startOfMonth(d: Date): Date {
  const x = new Date(d)
  x.setDate(1)
  x.setHours(0, 0, 0, 0)
  return x
}

const pad = (n: number) => String(n).padStart(2, '0')

/** "dd/MM" */
export function formatDayMonth(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

/** "00h" */
export function formatHour(d: Date): string {
  return `${pad(d.getHours())}h`
}

/** "dd/MM/yy" */
export function formatShort(d: Date): string {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}`
}

/** Contagem inclusiva de dias: 12/07–19/07 = "8 dias"; 12/07–12/07 = "1 dia". */
export function rangeDays(r: DateRange): string {
  const n =
    Math.round((startOfDay(r.to).getTime() - startOfDay(r.from).getTime()) / 86_400_000) + 1
  return n === 1 ? '1 dia' : `${n} dias`
}

/** "12/07/26 – 19/07/26" */
export function formatRangeShort(r: DateRange): string {
  return `${formatShort(r.from)} – ${formatShort(r.to)}`
}

/** Resolve a preset into an absolute [from, to] range relative to now. */
export function presetRange(preset: RangePreset, dataStart: Date): DateRange {
  const now = new Date()
  const today = startOfDay(now)
  switch (preset) {
    case 'today':
      return { from: today, to: now }
    case 'yesterday': {
      const y = addDays(today, -1)
      return { from: y, to: endOfDay(y) }
    }
    case 'last7':
      return { from: addDays(today, -6), to: now }
    case 'last15':
      return { from: addDays(today, -14), to: now }
    case 'last30':
      return { from: addDays(today, -29), to: now }
    case 'thisMonth':
      return { from: startOfMonth(today), to: now }
    case 'all':
      return { from: dataStart, to: now }
    case 'custom':
      return { from: today, to: now }
  }
}
