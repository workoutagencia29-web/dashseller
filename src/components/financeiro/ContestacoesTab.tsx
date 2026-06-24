import { useMemo, useState } from 'react'
import { Eye, ShieldQuestion } from 'lucide-react'
import { contestacoes as contestData, contestacoesResumo, type Contestacao } from '../../data/financeiroData'
import { formatCurrency } from '../../lib/utils'
import { StatusBadge, SearchInput } from '../reports/reportsPrimitives'
import { Button } from '../settings/primitives'
import { Modal } from './financeiroPrimitives'

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

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
  const [defesa, setDefesa] = useState<Contestacao | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((c) => !q || c.id.toLowerCase().includes(q) || c.txId.toLowerCase().includes(q))
  }, [rows, search])

  function enviarDefesa() {
    if (defesa) setRows((l) => l.map((c) => (c.id === defesa.id ? { ...c, status: 'Defesa Enviada', defesaEnviada: true, prazo: null } : c)))
    setDefesa(null)
  }

  return (
    <div className="space-y-6">
      {/* resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResumoCard label="Total de Contestações" primary={formatCurrency(contestacoesResumo.totalValor)} secondary={`${contestacoesResumo.qtdAbertas} contestações abertas`} />
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
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar por ID da contestação" />
        </div>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Data</th>
                <th className="px-3 py-3 text-right font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">ID da Transação</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Defesa</th>
                <th className="py-3 pl-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                  <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{fmtDate(c.date)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-foreground">{formatCurrency(c.value)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 font-mono text-[13px] text-muted">{c.txId}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={c.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">
                    {c.defesaEnviada ? 'Sim' : c.prazo ? `${c.prazo} restante` : 'Não'}
                  </td>
                  <td className="py-3.5 pl-3 text-right">
                    {c.status === 'Aberta' ? (
                      <Button size="sm" onClick={() => setDefesa(c)}>
                        <ShieldQuestion className="h-3.5 w-3.5" /> Enviar defesa
                      </Button>
                    ) : (
                      <button className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                        <Eye className="mr-1 inline h-3.5 w-3.5" /> Ver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhuma contestação encontrada.</p>}
        </div>
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
    </div>
  )
}
