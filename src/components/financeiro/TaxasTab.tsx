import { Lock, Info } from 'lucide-react'
import { taxas } from '../../data/financeiroData'

export function TaxasTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Taxas por método de pagamento
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <Lock className="h-3.5 w-3.5" /> Somente leitura — as taxas são definidas pelo admin do gateway nummo.
        </p>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold">Formato da Taxa</th>
                <th className="px-3 py-3 font-semibold">Exemplo Ilustrativo</th>
                <th className="py-3 pl-3 font-semibold">Observação</th>
              </tr>
            </thead>
            <tbody>
              {taxas.map((t) => (
                <tr key={t.method} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap py-4 pr-3 font-semibold text-foreground">{t.method}</td>
                  <td className="px-3 py-4 text-muted">{t.format}</td>
                  <td className="px-3 py-4">
                    <span className="inline-block rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-[13px] font-medium text-primary">
                      {t.example}
                    </span>
                  </td>
                  <td className="py-4 pl-3 text-muted">{t.obs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-faint">
          Os valores acima são ilustrativos. As taxas reais podem variar por seller, volume e contrato.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card-muted/30 p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Info className="h-4 w-4 text-primary" /> Informações complementares
        </p>
        <ul className="space-y-2 text-sm text-muted">
          <li>• Todas as taxas são exibidas em modo somente leitura para o seller.</li>
          <li>• Para contestar ou renegociar taxas, entre em contato com o suporte nummo.</li>
          <li>• Alterações de taxa são de responsabilidade exclusiva do admin do gateway.</li>
          <li>• Versões futuras poderão exibir um simulador de taxa por valor de transação.</li>
        </ul>
      </div>
    </div>
  )
}
