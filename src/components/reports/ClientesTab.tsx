import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { clients, clientFirstPurchase, clientTransactions, type Client } from '../../data/reportsData'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { SearchInput, ExportButtons, ReportCard, downloadCsv, Pagination, GhostRows } from './reportsPrimitives'
import { ClienteDetalheModal } from './ClienteDetalheModal'

const PER_PAGE = 10

const fmtDate = (d: Date | null) => (d ? d.toLocaleDateString('pt-BR') : '—')

export function ClientesTab() {
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState<Client | null>(null)
  const [page, setPage] = useState(1)

  const start = useMemo(() => addDays(startOfDay(new Date()), -60), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start, tick],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => {
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.document.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      const inPeriod = clientTransactions(c.id).some((t) => t.date >= range.from && t.date <= range.to)
      return matchesSearch && inPeriod
    })
  }, [search, range])

  // paginação: 10 por página
  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paged = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  useEffect(() => setPage(1), [rows]) // volta pra 1 quando o filtro/busca muda

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  function exportCsv() {
    downloadCsv(
      'clientes.csv',
      ['Cliente', 'E-mail', 'CPF/CNPJ', 'Primeira Compra'],
      rows.map((c) => [c.name, c.email, c.document, fmtDate(clientFirstPurchase(c.id))]),
    )
  }

  return (
    <ReportCard>
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar nome, CPF ou CNPJ" />
        </div>
        <ExportButtons formats={['CSV']} onCsv={exportCsv} onRefresh={() => setTick((t) => t + 1)} />
      </div>

      {/* tabela */}
      <div className="scrollbar-thin mt-5 overflow-x-auto">
        <table className="w-full min-w-[680px] table-fixed border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-3 font-semibold">Cliente</th>
              <th className="px-3 py-3 font-semibold">E-mail</th>
              <th className="px-3 py-3 font-semibold">CPF / CNPJ</th>
              <th className="px-3 py-3 font-semibold">Primeira Compra</th>
              <th className="py-3 pl-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((c) => (
              <tr key={c.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-card-muted/40">
                <td className="whitespace-nowrap py-3.5 pr-3">
                  <span className="font-medium text-foreground">{c.name}</span>
                </td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{c.email}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{c.document}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDate(clientFirstPurchase(c.id))}</td>
                <td className="py-3.5 pl-3">
                  <button
                    onClick={() => setSelected(c)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    Ações <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            <GhostRows count={paged.length === 0 ? 0 : PER_PAGE - paged.length} colSpan={5} />
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhum cliente encontrado para os filtros atuais.</p>}
      </div>

      <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />

      <p className="mt-4 border-t border-border pt-4 text-sm text-muted">
        <span className="font-semibold text-foreground">{rows.length}</span> cliente(s) no período
      </p>

      {/* pop-up de detalhes do cliente */}
      <ClienteDetalheModal client={selected} onClose={() => setSelected(null)} />
    </ReportCard>
  )
}
