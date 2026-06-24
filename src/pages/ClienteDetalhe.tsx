import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import type { LayoutContext } from '../components/Layout'
import { clients, clientTransactions, clientMetrics } from '../data/reportsData'
import { formatCurrency, formatNumber } from '../lib/utils'
import { StatusBadge } from '../components/reports/reportsPrimitives'
import { Button } from '../components/settings/primitives'

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card-muted/30 px-5 py-4">
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  )
}

export default function ClienteDetalhe() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const client = clients.find((c) => c.id === Number(id))

  if (!client) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Cliente não encontrado.</p>
        <Link to="/relatorio/clientes" className="mt-3 inline-block text-sm font-medium text-primary">
          ← Voltar para Clientes
        </Link>
      </div>
    )
  }

  const txs = clientTransactions(client.id)
  const m = clientMetrics(client.id)

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/relatorio/clientes"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Clientes
        </Link>
        <button onClick={onOpenMobile} className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden" aria-label="Abrir menu">
          ☰
        </button>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">{client.name}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Detalhe do cliente e histórico de transações.</p>

      {/* métricas */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Total de Vendas" value={formatCurrency(m.total)} />
        <Metric label="Vendas Aprovadas" value={formatNumber(m.approvedCount)} />
        <Metric label="Ticket Médio" value={formatCurrency(m.ticket)} />
        <Metric label="Conversão" value={`${m.conversion.toFixed(1).replace('.', ',')}%`} />
      </div>

      {/* duas colunas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* transações */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
            Transações
          </h2>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[460px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3 font-semibold">Data</th>
                  <th className="px-3 py-3 font-semibold">Produto</th>
                  <th className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th className="py-3 pl-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{fmtDateTime(t.date)}</td>
                    <td className="px-3 py-3.5 text-foreground">{t.product}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-foreground">{formatCurrency(t.value)}</td>
                    <td className="py-3.5 pl-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {txs.length === 0 && <p className="py-10 text-center text-sm text-muted">Sem transações registradas.</p>}
          </div>
        </div>

        {/* perfil */}
        <div className="rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-2xl font-bold text-white">
              {initials(client.name)}
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{client.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{client.document}</p>
          </div>
          <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
            <div>
              <p className="text-xs text-muted">E-mail</p>
              <p className="mt-0.5 break-all font-medium text-foreground">{client.email}</p>
            </div>
          </div>
          <a href={`mailto:${client.email}`} className="mt-6 block">
            <Button className="w-full">
              <Mail className="h-4 w-4" /> Enviar E-mail
            </Button>
          </a>
        </div>
      </div>
    </>
  )
}
