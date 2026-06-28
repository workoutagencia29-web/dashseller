import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  type TooltipProps,
} from 'recharts'
import { salesData, salesDataStart } from '../data/mockData'
import { DateRangeFilter } from './ui/DateRangeFilter'
import {
  presetRange,
  isHourly,
  formatHour,
  formatDayMonth,
  startOfDay,
  endOfDay,
  type RangePreset,
  type DateRange,
} from '../lib/date'

interface ChartRow {
  label: string
  vendas: number
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl shadow-black/20">
      <p className="mb-1 text-xs font-semibold text-foreground">{label}</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-muted">Vendas</span>
        <span className="ml-auto font-semibold text-foreground">{payload[0].value?.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  )
}

export function TeamPerformanceChart() {
  const [preset, setPreset] = useState<RangePreset>('today')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)

  const range: DateRange = useMemo(() => {
    if (preset === 'custom' && customRange) return customRange
    return presetRange(preset, salesDataStart)
  }, [preset, customRange])

  const hourly = isHourly(preset)

  const data: ChartRow[] = useMemo(() => {
    // modo por hora (Hoje/Ontem): mostra o dia inteiro fixo (00h–23h),
    // independente da hora atual; senão usa o range do preset (até agora)
    const fromT = (hourly ? startOfDay(range.from) : range.from).getTime()
    const toT = (hourly ? endOfDay(range.from) : range.to).getTime()
    const pts = salesData.filter((p) => {
      const t = p.date.getTime()
      return t >= fromT && t <= toT
    })

    if (hourly) {
      return pts.map((p) => ({ label: formatHour(p.date), vendas: p.projectTeam + p.productTeam }))
    }

    // aggregate hourly points into daily totals
    const byDay = new Map<number, ChartRow>()
    for (const p of pts) {
      const key = startOfDay(p.date).getTime()
      const v = p.projectTeam + p.productTeam
      const existing = byDay.get(key)
      if (existing) {
        existing.vendas += v
      } else {
        byDay.set(key, { label: formatDayMonth(p.date), vendas: v })
      }
    }
    return Array.from(byDay.values())
  }, [range, hourly])

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  return (
    <div className="flex h-full flex-col">
      {/* header — puxado um pouco pra cima (sem alterar o card; o gráfico flex-1 absorve a folga) */}
      <div className="-mt-2 flex flex-wrap items-center justify-between gap-4 sm:-mt-3">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Desempenho de vendas
        </h2>
        <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
      </div>

      {/* eixo Y = quantidade de vendas · eixo X = horas (hoje/ontem) ou datas */}
      <div className="chart-themed mt-4 h-[240px] w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical horizontal={false} strokeDasharray="0" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              fontSize={12}
              minTickGap={hourly ? 0 : 28}
              // por hora: 1 tick sim, 1 não → 00h, 02h, 04h... (de 2 em 2)
              interval={hourly ? 1 : 'preserveStartEnd'}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              fontSize={12}
              width={40}
              allowDecimals={false}
              tickFormatter={(v: number) => v.toLocaleString('pt-BR')}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgb(148 163 184 / 0.25)', strokeWidth: 28 }} />
            <Line
              type="monotone"
              dataKey="vendas"
              stroke="#2f6bff"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
              activeDot={{ r: 5, strokeWidth: 3, stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
