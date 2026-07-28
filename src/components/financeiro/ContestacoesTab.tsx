import { useEffect, useMemo, useState } from 'react'
import { Eye, ShieldQuestion } from 'lucide-react'
import { contestacoes as contestData, contestacoesResumo, type Contestacao, type ContestStatus } from '../../data/financeiroData'
import { cn, formatCurrency } from '../../lib/utils'
import { SearchInput, MultiSelect, DetailRow, Drawer, DrawerSection, Pagination, GhostRows } from '../reports/reportsPrimitives'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, endOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { Button } from '../settings/primitives'
import { Modal } from './financeiroPrimitives'

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

const PER_PAGE = 10
const STATUS_OPTIONS: ContestStatus[] = ['Aberta', 'Defesa Enviada', 'Aprovada', 'Negada', 'Encerrada']

/** Cada status de contestação com sua própria cor. */
const STATUS_STYLES: Record<ContestStatus, string> = {
  Aberta: 'bg-chart-yellow/15 text-chart-yellow',
  'Defesa Enviada': 'bg-primary/10 text-primary',
  Aprovada: 'bg-emerald-500/15 text-emerald-500',
  Negada: 'bg-negative/10 text-negative',
  Encerrada: 'bg-card-muted text-muted',
}

function ContestStatusBadge({ status }: { status: ContestStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status])}>
      {status}
    </span>
  )
}

function ResumoCard({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{primary}</p>
      <p className="mt-1 text-xs text-muted">{secondary}</p>
    </div>
  )
}

export function ContestacoesTab() {
  const [rows, setRows] = useState<Contestacao[]>(contestData)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState<string[]>([])
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [defesa, setDefesa] = useState<Contestacao | null>(null)
  const [detalhe, setDetalhe] = useState<Contestacao | null>(null)
  const [page, setPage] = useState(1)

  const start = useMemo(() => addDays(startOfDay(new Date()), -90), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start],
  )
  function handleRange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const upper = endOfDay(range.to)
    return rows.filter((c) => {
      const matchesSearch = !q || c.id.toLowerCase().includes(q) || c.txId.toLowerCase().includes(q)
      const matchesStatus = statusF.length === 0 || statusF.includes(c.status)
      const inPeriod = c.date >= range.from && c.date <= upper
      return matchesSearch && matchesStatus && inPeriod
    })
  }, [rows, search, statusF, range])

  // paginação: 10 por página, card de altura fixa (padrão das outras abas)
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  useEffect(() => setPage(1), [search, statusF, range])

  function enviarDefesa() {
    if (defesa) setRows((l) => l.map((c) => (c.id === defesa.id ? { ...c, status: 'Defesa Enviada', defesaEnviada: true, prazo: null } : c)))
    setDefesa(null)
  }

  return (
    <div className="space-y-6">
      {/* resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResumoCard label="Valor em disputa" primary={formatCurrency(contestacoesResumo.totalValor)} secondary={`${contestacoesResumo.qtdAbertas} contestações abertas`} />
        <ResumoCard label="Defesa Enviada" primary={String(contestacoesResumo.defesasEnviadas)} secondary={`${contestacoesResumo.defesasPendentes} pendentes de resposta`} />
        <ResumoCard label="Defesas Aprovadas" primary={String(contestacoesResumo.defesasAprovadas)} secondary={`${formatCurrency(contestacoesResumo.valorLiberado)} liberado`} />
      </div>

      {/* lista */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
            Contestações
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <MultiSelect label="Status" options={STATUS_OPTIONS} selected={statusF} onChange={setStatusF} />
            <DateRangeFilter preset={preset} customRange={customRange} onChange={handleRange} minDate={start} />
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por ID da contestação ou transação" />
          </div>
        </div>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Data</th>
                <th className="px-3 py-3 font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Defesa</th>
                <th className="py-3 pl-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((c) => (
                <tr key={c.id} className="h-[63px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                  <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{fmtDate(c.date)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">{formatCurrency(c.value)}</td>
                  <td className="px-3 py-3.5"><ContestStatusBadge status={c.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                    {c.defesaEnviada ? 'Sim' : c.prazo ? `${c.prazo} restante` : 'Não'}
                  </td>
                  <td className="py-3.5 pl-3">
                    <button
                      onClick={() => setDetalhe(c)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <Eye className="h-3.5 w-3.5" /> Ver
                    </button>
                  </td>
                </tr>
              ))}
              <GhostRows count={pageRows.length === 0 ? 0 : PER_PAGE - pageRows.length} colSpan={5} rowClassName="h-[63px]" />
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhuma contestação encontrada.</p>}
        </div>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* modal de defesa */}
      <Modal
        open={!!defesa}
        title="Enviar defesa"
        onClose={() => setDefesa(null)}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setDefesa(null)}>Cancelar</Button>
            <Button size="sm" onClick={enviarDefesa}>Enviar defesa</Button>
          </>
        }
      >
        {defesa && (
          <div className="space-y-4">
            <div className="rounded-xl bg-card-muted/40 px-3.5 py-3 text-xs text-muted">
              Contestação <span className="font-mono text-foreground">{defesa.id}</span> · {formatCurrency(defesa.value)} · transação{' '}
              <span className="font-mono text-foreground">{defesa.txId}</span>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Descreva sua defesa</label>
              <textarea
                rows={4}
                placeholder="Explique por que a cobrança é legítima e anexe evidências…"
                className="w-full rounded-xl border border-border bg-input/60 px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="text-sm font-medium text-primary hover:opacity-80">+ Anexar evidências</button>
          </div>
        )}
      </Modal>

      {/* drawer de detalhes (botão "Ver") */}
      <Drawer
        open={!!detalhe}
        title="Detalhes da contestação"
        onClose={() => setDetalhe(null)}
        widthClass="max-w-md"
        footer={
          detalhe?.status === 'Aberta' ? (
            <Button
              size="sm"
              className="w-full"
              onClick={() => {
                const c = detalhe
                setDetalhe(null)
                setDefesa(c)
              }}
            >
              <ShieldQuestion className="h-3.5 w-3.5" /> Enviar defesa
            </Button>
          ) : undefined
        }
      >
        {detalhe && (
          <div>
            <DrawerSection title="Contestação">
              <DetailRow label="ID da contestação" value={<span className="font-mono">{detalhe.id}</span>} />
              <DetailRow label="Data" value={fmtDate(detalhe.date)} />
              <DetailRow label="Valor" value={formatCurrency(detalhe.value)} />
              <DetailRow label="ID da transação" value={<span className="font-mono">{detalhe.txId}</span>} />
            </DrawerSection>
            <DrawerSection title="Situação">
              <DetailRow label="Status" value={<ContestStatusBadge status={detalhe.status} />} />
              <DetailRow
                label="Defesa"
                value={detalhe.defesaEnviada ? 'Enviada' : detalhe.prazo ? `${detalhe.prazo} restante` : 'Não enviada'}
              />
            </DrawerSection>
          </div>
        )}
      </Drawer>
    </div>
  )
}
