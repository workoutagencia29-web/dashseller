import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { assinaturas, assinaturasResumo, type Assinatura, type AssinStatus } from '../../data/financeiroData'
import { cn, formatCurrency } from '../../lib/utils'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { StatusBadge, MultiSelect, SearchInput, Drawer, DetailRow, Pagination, GhostRows } from '../reports/reportsPrimitives'
import { Avatar } from '../ui/Avatar'

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

const PER_PAGE = 10

const PRODUCTS = Array.from(new Set(assinaturas.map((a) => a.product)))
const STATUSES: AssinStatus[] = ['Ativa', 'Em Atraso', 'Pausada', 'Cancelada']

function ResumoCard({ label, count, mrr, arr, tone }: { label: string; count: number; mrr: number; arr: number; tone: 'success' | 'warning' }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className={tone === 'warning' ? 'mt-2 text-[32px] font-bold leading-none text-chart-yellow' : 'mt-2 text-[32px] font-bold leading-none text-foreground'}>
        {count}
      </p>
      <div className="mt-4 flex gap-8 border-t border-border pt-4">
        <div>
          <p className="text-xs text-muted">{tone === 'warning' ? 'MRR em atraso' : 'MRR'}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrency(mrr)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">{tone === 'warning' ? 'ARR em atraso' : 'ARR'}</p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrency(arr)}</p>
        </div>
      </div>
    </div>
  )
}

/** Conteúdo completo da assinatura, exibido dentro do drawer de Detalhes. */
/** Card com borda e título (padrão visual do site) usado dentro do drawer. */
function DrawerCard({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card-muted/30 p-5', className)}>
      <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="h-4 w-1.5 shrink-0 rounded-full bg-primary" />
        {title}
      </h4>
      {children}
    </div>
  )
}

function AssinaturaDrawerBody({ sub }: { sub: Assinatura }) {
  const faturasPagas = sub.faturas.filter((f) => f.status === 'Pago').length
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
        <DrawerCard title="Informações da Assinatura">
          <DetailRow label="Produto" value={sub.product} />
          <DetailRow label="Valor" value={formatCurrency(sub.value)} />
          <DetailRow label="Status" value={<StatusBadge status={sub.status} />} />
          <DetailRow label="Data de Início" value={fmtDate(sub.startDate)} />
          <DetailRow label="Próxima Cobrança" value={fmtDate(sub.nextCharge)} />
          <DetailRow label="Último Pagamento" value={fmtDate(sub.lastPayment)} />
          <DetailRow label="Cobrança ID" value={<span className="font-mono">{sub.cobrancaId}</span>} />
        </DrawerCard>

        <DrawerCard title="Faturas Pagas" className="flex flex-1 flex-col justify-center">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">{faturasPagas}</span>
            <span className="text-sm text-muted">{faturasPagas === 1 ? 'fatura paga' : 'faturas pagas'}</span>
          </div>
          <p className="mt-1 text-xs text-muted">de {sub.faturas.length} faturas no total desta assinatura.</p>
        </DrawerCard>
        </div>

        <DrawerCard title="Dados do Cliente">
          <DetailRow label="Nome" value={sub.buyerName} />
          <DetailRow label="E-mail" value={sub.buyerEmail} />
          <DetailRow label={sub.buyerDoc.includes('/') ? 'CNPJ' : 'CPF'} value={sub.buyerDoc} />
          <DetailRow label="Telefone" value={sub.buyerPhone} />
          <DetailRow label="Endereço" value={`${sub.address.rua}, ${sub.address.numero}`} />
          <DetailRow label="Complemento" value={sub.address.complemento} />
          <DetailRow label="Bairro" value={sub.address.bairro} />
          <DetailRow label="Cidade / UF" value={`${sub.address.cidade} / ${sub.address.estado}`} />
          <DetailRow label="CEP" value={sub.address.cep} />
          <DetailRow label="País" value={sub.address.pais} />
        </DrawerCard>
      </div>

      <DrawerCard title="Histórico de Faturas">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[680px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">ID</th>
                <th className="px-3 py-3 font-semibold">Vencimento</th>
                <th className="px-3 py-3 font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Pagamento</th>
                <th className="py-3 pl-3 font-semibold">Método</th>
              </tr>
            </thead>
            <tbody>
              {sub.faturas.map((f) => (
                <tr key={f.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap py-3.5 pr-3 font-mono text-[13px] text-muted">{f.id}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDate(f.vencimento)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">{formatCurrency(f.value)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={f.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{f.pagamento ? fmtDate(f.pagamento) : '—'}</td>
                  <td className="whitespace-nowrap py-3.5 pl-3 text-muted">{f.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DrawerCard>
    </div>
  )
}

export function AssinaturasTab() {
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [products, setProducts] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Assinatura | null>(null)
  const [page, setPage] = useState(1)

  const start = useMemo(() => addDays(startOfDay(new Date()), -90), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start],
  )

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return assinaturas.filter((a) => {
      const matchesSearch = !q || a.buyerName.toLowerCase().includes(q) || a.product.toLowerCase().includes(q)
      const matchesProduct = products.length === 0 || products.includes(a.product)
      const matchesStatus = status.length === 0 || status.includes(a.status)
      const inPeriod = a.lastPayment >= range.from && a.lastPayment <= range.to
      return matchesSearch && matchesProduct && matchesStatus && inPeriod
    })
  }, [search, products, status, range])

  // paginação: 10 por página, card de altura fixa
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  // volta pra página 1 quando muda filtro/busca/período
  useEffect(() => setPage(1), [search, products, status, range])

  return (
    <div className="space-y-6">
      {/* resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResumoCard label="Assinaturas Ativas" count={assinaturasResumo.ativas} mrr={assinaturasResumo.mrr} arr={assinaturasResumo.arr} tone="success" />
        <ResumoCard label="Em Atraso" count={assinaturasResumo.emAtraso} mrr={assinaturasResumo.mrrAtraso} arr={assinaturasResumo.arrAtraso} tone="warning" />
      </div>

      {/* lista */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        {/* título à esquerda + filtros encostados na borda direita */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
            Assinaturas
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <MultiSelect label="Produto" options={PRODUCTS} selected={products} onChange={setProducts} />
            <MultiSelect label="Status" options={STATUSES} selected={status} onChange={setStatus} />
            <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar comprador ou produto" />
          </div>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Comprador</th>
                <th className="px-3 py-3 font-semibold">Produto</th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="py-3 pl-3 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((a) => (
                <tr key={a.id} className="h-[63px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.buyerName} seed={a.avatarSeed} size={32} />
                      <span className="truncate font-medium text-foreground">{a.buyerName}</span>
                    </div>
                  </td>
                  <td className="truncate px-3 py-3.5 text-muted" title={a.product}>{a.product}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{a.method}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">{formatCurrency(a.value)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
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
              <GhostRows count={pageRows.length === 0 ? 0 : PER_PAGE - pageRows.length} colSpan={6} rowClassName="h-[63px]" />
            </tbody>
          </table>
          {rows.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhuma assinatura encontrada para os filtros atuais.</p>}
        </div>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* drawer de detalhes (largo) — toda a informação da assinatura */}
      <Drawer open={!!selected} title="Detalhes da assinatura" onClose={() => setSelected(null)} widthClass="max-w-4xl">
        {selected && <AssinaturaDrawerBody key={selected.id} sub={selected} />}
      </Drawer>
    </div>
  )
}
