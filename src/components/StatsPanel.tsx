import { ArrowUpRight, ArrowDownRight, Banknote } from 'lucide-react'
import { DollarCircle, HomeSale, Wallet, LotOfCash } from 'iconoir-react'
import { stats, type Stat } from '../data/mockData'
import { cn, formatNumber, formatCurrency } from '../lib/utils'

const ICONS = {
  employees: DollarCircle, // Total de Vendas  → iconoir-dollar-circle
  applicants: HomeSale, // Vendas Aprovadas → iconoir-home-sale
  new: LotOfCash, // Ticket Médio     → iconoir-lot-of-cash
  resigned: Wallet, // Saldo Disponível → iconoir-wallet
} as const

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : '-'
  return `${sign}${Math.abs(delta).toString().replace('.', ',')}%`
}

function StatBlock({ stat }: { stat: Stat }) {
  const Icon = ICONS[stat.icon]
  const positive = stat.delta >= 0

  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card-muted text-muted">
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        {stat.action && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Banknote className="h-4 w-4" />
            {stat.action}
          </button>
        )}
      </div>
      <div>
        <div className="text-[24px] font-bold leading-none tracking-tight text-foreground sm:text-[28px]">
          {stat.format === 'currency' ? formatCurrency(stat.value) : formatNumber(stat.value)}
        </div>
        <div className="mt-2.5">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-semibold',
              positive ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative',
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {formatDelta(stat.delta)}
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">{stat.label}</p>
      </div>
    </div>
  )
}

export function StatsPanel() {
  return (
    <div className="grid h-full grid-cols-1 sm:grid-cols-2">
      {stats.map((stat, i) => (
        <div
          key={stat.id}
          className={cn(
            'relative',
            // vertical divider between columns
            i % 2 === 0 && 'sm:border-r sm:border-border',
            // horizontal divider between rows
            i >= 2 && 'border-t border-border',
            // on mobile every block except first gets a top border
            i >= 1 && i < 2 && 'border-t border-border sm:border-t-0',
          )}
        >
          <StatBlock stat={stat} />
        </div>
      ))}
    </div>
  )
}
