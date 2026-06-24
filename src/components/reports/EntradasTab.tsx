import { useMemo, useState } from 'react'
import { clients, entradas, type Entrada } from '../../data/reportsData'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { formatCurrency } from '../../lib/utils'
import { MultiSelect, SearchInput, ExportButtons, ReportCard, StatusBadge, downloadCsv } from './reportsPrimitives'
import { EntradaDrawer } from './EntradaDrawer'

const PAY_METHODS = ['Pix', 'Cartão', 'Boleto', 'Outro']
const STATUSES = ['Aprovado', 'Pendente', 'Estornado', 'Bloqueado', 'Chargeback']

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

export function EntradasTab() {
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [search, setSearch] = useState('')
  const [pay, setPay] = useState<string[]>([])
  const [status, setStatus] = useState<string[]>([])
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState<Entrada | null>(null)

  const clientById = useMemo(() => Object.fromEntries(clients.map((c) => [c.id, c])), [])
  const start = useMemo(() => addDays(startOfDay(new Date()), -60), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start, tick],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return entradas.filter((e) => {
      const c = clientById[e.clientId]
      const matchesSearch =
        !q || c.name.toLowerCase().includes(q) || c.document.toLowerCase().includes(q)
      const inPeriod = e.date >= range.from && e.date <= range.to
      const matchesPay = pay.length === 0 || pay.includes(e.method)
      const matchesStatus = status.length === 0 || status.includes(e.status)
      return matchesSearch && inPeriod && matchesPay && matchesStatus
    })
  }, [search, range, pay, status, clientById])

  function exportCsv() {
    downloadCsv(
      'entradas.csv',
      ['Cliente', 'Data', 'ID Transação', 'Tipo', 'Método', 'Status', 'Valor', 'Comissão'],
      rows.map((e) => [
        clientById[e.clientId].name,
        fmtDateTime(e.date),
        e.txId,
        e.type,
        e.method,
        e.status,
        e.value.toFixed(2),
        e.commission.toFixed(2),
      ]),
    )
  }

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const total = rows.reduce((s, e) => s + (e.status === 'Aprovado' ? e.value : 0), 0)

  return (
    <ReportCard>
      {/* filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
          <MultiSelect label="Forma de pagamento" options={PAY_METHODS} selected={pay} onChange={setPay} />
          <MultiSelect label="Status" options={STATUSES} selected={status} onChange={setStatus} />
        </div>
        <ExportButtons formats={['CSV']} onCsv={exportCsv} onRefresh={() => setTick((t) => t + 1)} />
      </div>
      <div className="mt-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar nome, CPF ou CNPJ" />
      </div>

      {/* tabela */}
      <div className="scrollbar-thin mt-5 overflow-x-auto">
        <table className="w-full min-w-[940px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-3 font-semibold">Cliente</th>
              <th className="px-3 py-3 font-semibold">Data</th>
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="px-3 py-3 font-semibold">Tipo</th>
              <th className="px-3 py-3 font-semibold">Método</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 text-right font-semibold">Valor</th>
              <th className="px-3 py-3 text-right font-semibold">Comissão</th>
              <th className="py-3 pl-3 text-right font-semibold">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-card-muted/40">
                <td className="whitespace-nowrap py-3.5 pr-3 font-medium text-foreground">{clientById[e.clientId].name}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDateTime(e.date)}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">{e.txId}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{e.type}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-muted">{e.method}</td>
                <td className="px-3 py-3.5"><StatusBadge status={e.status} /></td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-foreground">{formatCurrency(e.value)}</td>
                <td className="whitespace-nowrap px-3 py-3.5 text-right text-muted">{formatCurrency(e.commission)}</td>
                <td className="py-3.5 pl-3 text-right">
                  <button onClick={() => setSelected(e)} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhuma entrada encontrada para os filtros atuais.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm text-muted">
        <span><span className="font-semibold text-foreground">{rows.length}</span> entrada(s)</span>
        <span>Total aprovado: <span className="font-semibold text-foreground">{formatCurrency(total)}</span></span>
      </div>

      {/* drawer */}
      <EntradaDrawer entrada={selected} onClose={() => setSelected(null)} />
    </ReportCard>
  )
}
