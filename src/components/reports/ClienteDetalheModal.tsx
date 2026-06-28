import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Mail } from 'lucide-react'
import { type Client, clientTransactions, clientMetrics } from '../../data/reportsData'
import { formatCurrency, formatNumber } from '../../lib/utils'
import { StatusBadge } from './reportsPrimitives'
import { Button } from '../settings/primitives'

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card-muted/30 px-4 py-3">
      <p className="text-xl font-bold tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  )
}

/**
 * Pop-up com os detalhes do cliente (perfil, métricas e transações).
 * Renderizado via portal pro body, com fundo borrado cobrindo a tela toda.
 */
export function ClienteDetalheModal({ client, onClose }: { client: Client | null; onClose: () => void }) {
  // fecha com ESC + trava a rolagem do fundo enquanto o pop-up está aberto
  useEffect(() => {
    if (!client) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // trava: (1) o <main> (quem rola o conteúdo) e (2) o <html>, matando o
    // bounce/overscroll elástico do documento ao passar sobre o backdrop
    const main = document.querySelector('main')
    const html = document.documentElement
    const prev = {
      mainOverflow: main?.style.overflow ?? '',
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    }
    if (main) main.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    html.style.overscrollBehavior = 'none'

    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev.mainOverflow
      html.style.overflow = prev.htmlOverflow
      html.style.overscrollBehavior = prev.htmlOverscroll
    }
  }, [client, onClose])

  if (!client) return null

  const txs = clientTransactions(client.id)
  const m = clientMetrics(client.id)

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in sm:p-7">
        {/* cabeçalho / perfil */}
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-xl font-bold text-white">
            {initials(client.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">{client.name}</h3>
            <p className="mt-0.5 text-sm text-muted">{client.document}</p>
            <p className="mt-0.5 break-all text-sm text-muted">{client.email}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* métricas */}
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 lg:grid-cols-4">
          <Metric label="Total de Vendas" value={formatCurrency(m.total)} />
          <Metric label="Vendas Aprovadas" value={formatNumber(m.approvedCount)} />
          <Metric label="Ticket Médio" value={formatCurrency(m.ticket)} />
          <Metric label="Conversão" value={`${m.conversion.toFixed(1).replace('.', ',')}%`} />
        </div>

        {/* transações */}
        <div className="mt-6">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="h-4 w-1.5 shrink-0 rounded-full bg-primary" />
            Transações
          </h4>
          <div className="scrollbar-thin overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[460px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-3 font-semibold">Data</th>
                  <th className="px-3 py-3 font-semibold">Produto</th>
                  <th className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtDateTime(t.date)}</td>
                    <td className="px-3 py-3 text-foreground">{t.product}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-foreground">{formatCurrency(t.value)}</td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {txs.length === 0 && <p className="py-8 text-center text-sm text-muted">Sem transações registradas.</p>}
          </div>
        </div>

        {/* ação */}
        <a href={`mailto:${client.email}`} className="mt-6 block">
          <Button className="w-full">
            <Mail className="h-4 w-4" /> Enviar E-mail
          </Button>
        </a>
      </div>
    </div>,
    document.body,
  )
}
