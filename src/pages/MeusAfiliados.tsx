import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Users, DollarSign, Hourglass, BarChart3, RefreshCw, type LucideIcon } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Button, Badge } from '../components/settings/primitives'
import { SearchInput, Drawer, DetailRow, DrawerSection, Pagination, GhostRows } from '../components/reports/reportsPrimitives'
import { afiliados, afiliadosResumo, type Afiliado } from '../data/afiliadosData'
import { cn, formatCurrency } from '../lib/utils'

const PER_PAGE = 10
const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

/* ------------------------------ KPI card ------------------------------ */

function KpiCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string
  value: string
  icon: LucideIcon
  tone?: 'default' | 'warning'
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl border bg-card p-5',
        tone === 'warning' ? 'border-chart-yellow/40' : 'border-border',
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
          tone === 'warning' ? 'bg-chart-yellow/15 text-chart-yellow' : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 truncate text-[22px] font-bold leading-none tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

/* ---------------------------- Drawer body ----------------------------- */

function AfiliadoDrawerBody({ a }: { a: Afiliado }) {
  return (
    <div>
      <div className="mb-6">
        <p className="truncate text-base font-bold text-foreground">{a.name}</p>
        <p className="truncate text-sm text-muted">{a.email}</p>
      </div>

      <DrawerSection title="Dados do afiliado">
        <DetailRow label="CPF / CNPJ" value={<span className="font-mono">{a.document}</span>} />
        <DetailRow label="Afiliado desde" value={fmtDate(a.since)} />
      </DrawerSection>

      <DrawerSection title="Desempenho">
        <DetailRow label="Transações" value={a.transactions} />
        <DetailRow label="Comissão gerada" value={<span className="font-semibold text-primary">{formatCurrency(a.commission)}</span>} />
        <DetailRow
          label="Comissão pendente"
          value={
            a.pending > 0 ? (
              <span className="font-semibold text-chart-yellow">{formatCurrency(a.pending)}</span>
            ) : (
              <span className="text-muted">{formatCurrency(0)}</span>
            )
          }
        />
      </DrawerSection>

      <DrawerSection title={`Produtos (${a.products.length})`}>
        <div className="flex flex-wrap gap-2">
          {a.products.map((p) => (
            <Badge key={p} tone="info">
              {p}
            </Badge>
          ))}
        </div>
      </DrawerSection>
    </div>
  )
}

/* =============================== Página =============================== */

export default function MeusAfiliados() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState<Afiliado | null>(null)
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return afiliados
    return afiliados.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q))
    // tick força recomputo no "Atualizar"
  }, [search, tick])

  // paginação: 10 por página, card de altura fixa
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  useEffect(() => setPage(1), [search]) // volta pra 1 quando a busca muda

  const kpis: { label: string; value: string; icon: LucideIcon; tone?: 'warning' }[] = [
    { label: 'Total de afiliados', value: String(afiliadosResumo.total), icon: Users },
    { label: 'Total comissões', value: formatCurrency(afiliadosResumo.comissaoTotal), icon: DollarSign },
    { label: 'Comissão pendente', value: formatCurrency(afiliadosResumo.comissaoPendente), icon: Hourglass, tone: 'warning' },
    { label: 'Total de transações', value: String(afiliadosResumo.transacoes), icon: BarChart3 },
  ]

  return (
    <>
      <Header
        title="Meus Afiliados"
        subtitle={`Veja os ${afiliadosResumo.total} afiliados associados aos seus produtos.`}
        onOpenMobile={onOpenMobile}
      />

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} label={k.label} value={k.value} icon={k.icon} tone={k.tone} />
          ))}
        </div>

        {/* lista */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Afiliados
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por e-mail ou nome" />
              <Button variant="outline" onClick={() => setTick((t) => t + 1)}>
                <RefreshCw className="h-4 w-4" /> Atualizar
              </Button>
            </div>
          </div>

          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-[22%] py-3 pr-3 font-semibold">Nome</th>
                  <th className="w-[26%] px-3 py-3 font-semibold">E-mail</th>
                  <th className="w-[18%] px-3 py-3 font-semibold">CPF / CNPJ</th>
                  <th className="w-[13%] px-3 py-3 font-semibold">Transações</th>
                  <th className="w-[14%] px-3 py-3 font-semibold">Comissão gerada</th>
                  <th className="w-[7%] py-3 pl-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <tr key={a.id} className="h-[68px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="truncate py-3.5 pr-3 font-medium text-foreground" title={a.name}>{a.name}</td>
                    <td className="truncate px-3 py-3.5 text-muted" title={a.email}>{a.email}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">{a.document}</td>
                    <td className="px-3 py-3.5 text-foreground">{a.transactions}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-primary">{formatCurrency(a.commission)}</td>
                    <td className="py-3.5 pl-3">
                      <button
                        onClick={() => setSelected(a)}
                        className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                <GhostRows count={pageRows.length === 0 ? 0 : PER_PAGE - pageRows.length} colSpan={6} rowClassName="h-[68px]" />
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="py-12 text-center text-sm text-muted">Nenhum afiliado encontrado para a busca.</p>
            )}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* drawer de detalhes do afiliado */}
      <Drawer open={!!selected} title="Detalhes do afiliado" onClose={() => setSelected(null)} widthClass="max-w-lg">
        {selected && <AfiliadoDrawerBody key={selected.id} a={selected} />}
      </Drawer>
    </>
  )
}
