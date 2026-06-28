import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { saidas, type Saida } from '../../data/reportsData'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { formatCurrency } from '../../lib/utils'
import { Button } from '../settings/primitives'
import {
  MultiSelect,
  SearchInput,
  ExportButtons,
  ReportCard,
  StatusBadge,
  TypeBadge,
  Drawer,
  DetailRow,
  DrawerSection,
  Timeline,
  downloadCsv,
} from './reportsPrimitives'

const STATUSES = ['Aprovado', 'Em Análise', 'Cancelado']
const TYPES = ['Cashout', 'Multa', 'Retirada Manual', 'MED', 'Chargeback']

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

function timelineFor(status: string): { steps: string[]; current: number } {
  if (status === 'Aprovado') return { steps: ['Solicitado', 'Em Análise', 'Aprovado'], current: 2 }
  if (status === 'Cancelado') return { steps: ['Solicitado', 'Em Análise', 'Cancelado'], current: 2 }
  return { steps: ['Solicitado', 'Em Análise'], current: 1 }
}

function baixarComprovante(s: Saida) {
  const txt = `COMPROVANTE DE SAÍDA — nummo\n\nID: ${s.txId}\nData: ${fmtDateTime(s.date)}\nTipo: ${s.type}\nDestinatário: ${s.recipient}\nBanco: ${s.bank} · Ag. ${s.agency} · Conta ${s.account} (${s.accountType})\nValor Bruto: ${formatCurrency(s.valorBruto)}\nValor Líquido: ${formatCurrency(s.valorLiquido)}\nStatus: ${s.status}\n`
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `comprovante-${s.txId}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export function SaidasTab() {
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [status, setStatus] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [tick, setTick] = useState(0)
  const [selected, setSelected] = useState<Saida | null>(null)

  const start = useMemo(() => addDays(startOfDay(new Date()), -60), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start, tick],
  )

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return saidas.filter((s) => {
      const inPeriod = s.date >= range.from && s.date <= range.to
      const matchesStatus = status.length === 0 || status.includes(s.status)
      const matchesType = types.length === 0 || types.includes(s.type)
      const matchesSearch =
        !q || s.recipient.toLowerCase().includes(q) || s.txId.toLowerCase().includes(q)
      return inPeriod && matchesStatus && matchesType && matchesSearch
    })
  }, [range, status, types, search])

  function exportCsv() {
    downloadCsv(
      'saidas.csv',
      ['Data', 'Destinatário', 'Valor Bruto', 'Valor Líquido', 'Status', 'Tipo', 'ID'],
      rows.map((s) => [
        fmtDateTime(s.date),
        s.recipient,
        s.valorBruto.toFixed(2),
        s.valorLiquido.toFixed(2),
        s.status,
        s.type,
        s.txId,
      ]),
    )
  }

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const totalLiquido = rows.reduce((acc, s) => acc + (s.status === 'Aprovado' ? s.valorLiquido : 0), 0)

  return (
    <ReportCard>
      {/* filtros */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
          <MultiSelect label="Tipo de operação" options={TYPES} selected={types} onChange={setTypes} />
          <MultiSelect label="Status" options={STATUSES} selected={status} onChange={setStatus} />
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar destinatário ou ID" />
        </div>
        <ExportButtons formats={['CSV']} onCsv={exportCsv} onRefresh={() => setTick((t) => t + 1)} />
      </div>

      {/* tabela */}
      <div className="scrollbar-thin mt-5 overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="py-3 pr-3 font-semibold">Data</th>
              <th className="px-3 py-3 font-semibold">Destinatário</th>
              <th className="px-3 py-3 font-semibold">Valor</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">ID</th>
              <th className="py-3 pl-3 font-semibold">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-card-muted/40">
                <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{fmtDateTime(s.date)}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">{s.recipient}</td>
                <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-foreground">{formatCurrency(s.valorLiquido)}</td>
                <td className="px-3 py-3.5"><StatusBadge status={s.status} /></td>
                <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">{s.txId}</td>
                <td className="py-3.5 pl-3">
                  <button onClick={() => setSelected(s)} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhuma saída encontrada para os filtros atuais.</p>}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-sm text-muted">
        <span><span className="font-semibold text-foreground">{rows.length}</span> saída(s)</span>
        <span>Líquido aprovado: <span className="font-semibold text-foreground">{formatCurrency(totalLiquido)}</span></span>
      </div>

      {/* drawer */}
      <Drawer
        open={!!selected}
        title="Detalhes da saída"
        onClose={() => setSelected(null)}
        footer={
          selected?.status === 'Aprovado' ? (
            <Button className="w-full" onClick={() => baixarComprovante(selected)}>
              <Download className="h-4 w-4" /> Baixar comprovante
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <>
            <DrawerSection title="Operação">
              <DetailRow label="ID" value={<span className="font-mono">{selected.txId}</span>} />
              <DetailRow label="Data" value={fmtDateTime(selected.date)} />
              <DetailRow label="Tipo" value={<TypeBadge type={selected.type} />} />
              <DetailRow label="Status" value={<StatusBadge status={selected.status} />} />
              <DetailRow label="Valor bruto" value={formatCurrency(selected.valorBruto)} />
              <DetailRow label="Valor líquido" value={formatCurrency(selected.valorLiquido)} />
            </DrawerSection>

            <DrawerSection title="Destino">
              <DetailRow label="Destinatário" value={selected.recipient} />
              <DetailRow label="Banco" value={selected.bank} />
              <DetailRow label="Agência" value={selected.agency} />
              <DetailRow label="Conta" value={`${selected.account} (${selected.accountType})`} />
              {selected.pixKey && <DetailRow label="Chave Pix" value={selected.pixKey} />}
            </DrawerSection>

            {selected.motivo && (
              <DrawerSection title="Motivo">
                <p className="rounded-xl bg-card-muted/40 px-3.5 py-3 text-sm text-foreground">{selected.motivo}</p>
              </DrawerSection>
            )}

            <DrawerSection title="Linha do tempo">
              <Timeline {...timelineFor(selected.status)} />
            </DrawerSection>
          </>
        )}
      </Drawer>
    </ReportCard>
  )
}
