import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { QrCode, CreditCard, Barcode, Wallet, type LucideIcon } from 'lucide-react'
import { totalEmployeeData, totalEmployeeCount, methodConversions, type MethodConversion } from '../data/mockData'
import { formatNumber, formatCurrency } from '../lib/utils'

const METHOD_ICONS: Record<MethodConversion['icon'], LucideIcon> = {
  pix: QrCode,
  card: CreditCard,
  boleto: Barcode,
  other: Wallet,
}

/** Aro circular com a taxa de conversão no centro, preenchido na cor do método. */
function ConversionRing({ percent, color }: { percent: number; color: string }) {
  const size = 60
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.max(0, Math.min(100, percent)) / 100)
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}33`} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-foreground">
        {Math.round(percent)}%
      </span>
    </div>
  )
}

export function TotalEmployeeDonut() {
  return (
    <div className="flex h-full flex-col">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Conversões por método
        </h2>
      </div>

      {/* donut */}
      <div className="relative mx-auto mt-4 h-[200px] w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={totalEmployeeData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={66}
              outerRadius={92}
              startAngle={90}
              endAngle={-270}
              paddingAngle={3}
              cornerRadius={8}
              stroke="none"
              isAnimationActive={false}
            >
              {totalEmployeeData.map((seg) => (
                <Cell key={seg.label} fill={seg.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* glow + center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[32px] font-bold leading-none text-foreground">
            {formatNumber(totalEmployeeCount)}
          </span>
          <span className="mt-1 text-xs text-muted">Total</span>
        </div>
      </div>

      {/* conversão por método */}
      <div className="mt-6 divide-y divide-border">
        {methodConversions.map((m) => {
          const Icon = METHOD_ICONS[m.icon]
          return (
            <div key={m.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <ConversionRing percent={m.conversion} color={m.color} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">{m.label}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-base font-bold text-foreground">{formatCurrency(m.value)}</span>
                  <span
                    className="rounded-md px-1.5 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: `${m.color}22`, color: m.color }}
                  >
                    {m.conversion}%
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {m.count > 0 ? `${m.count} transações` : 'Sem transações'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
