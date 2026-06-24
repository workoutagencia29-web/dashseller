import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { assinaturas, assinaturasResumo } from '../../data/financeiroData'
import { formatCurrency } from '../../lib/utils'
import { Avatar } from '../ui/Avatar'
import { StatusBadge } from '../reports/reportsPrimitives'

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

function ResumoCard({ label, count, mrr, arr, tone }: { label: string; count: number; mrr: number; arr: number; tone: 'success' | 'warning' }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className={tone === 'warning' ? 'mt-2 text-[32px] font-bold leading-none text-negative' : 'mt-2 text-[32px] font-bold leading-none text-foreground'}>
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

export function AssinaturasTab() {
  return (
    <div className="space-y-6">
      {/* resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResumoCard label="Assinaturas Ativas" count={assinaturasResumo.ativas} mrr={assinaturasResumo.mrr} arr={assinaturasResumo.arr} tone="success" />
        <ResumoCard label="Em Atraso" count={assinaturasResumo.emAtraso} mrr={assinaturasResumo.mrrAtraso} arr={assinaturasResumo.arrAtraso} tone="warning" />
      </div>

      {/* lista */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Assinaturas
        </h3>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Comprador</th>
                <th className="px-3 py-3 font-semibold">Produto</th>
                <th className="px-3 py-3 font-semibold">Último Pagamento</th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 text-right font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">Próxima Cobrança</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="py-3 pl-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                  <td className="py-3.5 pr-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={a.buyerName} seed={a.avatarSeed} size={34} />
                      <span className="whitespace-nowrap font-medium text-foreground">{a.buyerName}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{a.product}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDate(a.lastPayment)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{a.method}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-foreground">{formatCurrency(a.value)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDate(a.nextCharge)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                  <td className="py-3.5 pl-3 text-right">
                    <Link
                      to={`/financeiro/assinaturas/${a.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      Ações <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
