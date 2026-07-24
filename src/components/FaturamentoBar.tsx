import { Bookmark, Info } from 'lucide-react'
import { stats } from '../data/mockData'

/**
 * "Prêmios" — indicador estático (NÃO clicável) no topo direito, à esquerda do
 * sino. Duas linhas: em cima o label + `R$ atual / R$ alvo`; embaixo a barra de
 * progresso rumo ao próximo prêmio (ex: R$ 575.000,00 / R$ 1M).
 *
 * O valor vem de "Total de Vendas" (mockData). Pra dado real: <FaturamentoBar total={...} />.
 */

/** Marcos de premiação (o alvo é o próximo marco acima do faturamento atual). */
const PRIZES = [1_000_000, 5_000_000, 10_000_000, 20_000_000, 30_000_000, 40_000_000, 50_000_000, 100_000_000]

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** "1M" · "100M" — rótulo compacto do alvo. */
function compact(v: number): string {
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M`
  if (v >= 1_000) return `${+(v / 1_000).toFixed(0)}k`
  return String(v)
}
const compactBRL = (v: number) => `R$ ${compact(v)}`
const moneyFull = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function FaturamentoBar({ total: totalProp }: { total?: number }) {
  const total = totalProp ?? stats.find((s) => s.id === 'total')?.value ?? 0

  const passed = PRIZES.filter((m) => m <= total)
  const prevPrize = passed.length ? passed[passed.length - 1] : 0
  const nextPrize = PRIZES.find((m) => m > total) ?? PRIZES[PRIZES.length - 1]
  const progress = clamp((total - prevPrize) / (nextPrize - prevPrize), 0, 1)
  const faltam = Math.max(nextPrize - total, 0)

  return (
    <div className="hidden select-none flex-col gap-1.5 lg:flex">
      {/* linha de cima: label + valor */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 shrink-0 text-primary" fill="currentColor" />
          <span className="text-[13px] font-semibold text-foreground">Prêmios</span>
          <span
            className="flex text-muted"
            title={`Faturamento rumo ao próximo prêmio. Faltam ${moneyFull(faltam)} para ${compactBRL(nextPrize)}.`}
            aria-label={`Faturamento rumo ao próximo prêmio. Faltam ${moneyFull(faltam)} para ${compactBRL(nextPrize)}.`}
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
          </span>
        </span>
        <span className="text-[13px] font-semibold tabular-nums text-foreground">
          {moneyFull(total)}
          <span className="ml-1 font-medium text-muted">/ {compactBRL(nextPrize)}</span>
        </span>
      </div>

      {/* linha de baixo: barra de progresso (largura total) */}
      <span className="h-1.5 w-full overflow-hidden rounded-full bg-card-muted">
        <span
          className="block h-full rounded-full bg-primary"
          style={{ width: `${Math.max(progress * 100, 4)}%` }}
        />
      </span>
    </div>
  )
}
