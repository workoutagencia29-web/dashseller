import { QrCode, Code2, CreditCard, Wallet, Barcode, Check, type LucideIcon } from 'lucide-react'
import { taxas } from '../../data/financeiroData'

/* -------------------------------------------------------------------------- */
/* Cards de taxa — SÓ no desktop (lg+). No mobile mantém a tabela de sempre.   */
/* Modelo: retângulo vertical (cabeçalho + número grande + botão + detalhes).  */
/* -------------------------------------------------------------------------- */

interface TaxaCard {
  method: string
  icon: LucideIcon
  /** taxa principal em destaque (número grande) */
  rate: string
  /** complemento do número (ex.: faixa de parcelas) */
  rateNote?: string
  /** parte fixa / por transação */
  fixed: string
  bullets: string[]
}

const TAXA_CARDS: TaxaCard[] = [
  {
    method: 'Pix',
    icon: QrCode,
    rate: '0,5%',
    fixed: '+ R$ 0,00 por venda',
    bullets: ['Liquidação imediata', 'Sem taxa fixa por transação', 'Menor custo que cartão'],
  },
  {
    method: 'API Pix',
    icon: Code2,
    rate: '0,4%',
    fixed: '+ R$ 0,00 por venda',
    bullets: ['Cobranças automatizadas via API', 'Liquidação imediata', 'A menor taxa da plataforma'],
  },
  {
    method: 'Cartão de Crédito',
    icon: CreditCard,
    rate: '2,99%',
    rateNote: 'até 3,99% em 12x',
    fixed: '+ R$ 0,50 por venda',
    bullets: ['Parcelamento em até 12x', 'Taxa varia conforme as parcelas', 'Antecipação de recebíveis disponível'],
  },
  {
    method: 'Cartão de Débito',
    icon: Wallet,
    rate: '1,49%',
    fixed: '+ R$ 0,00 por venda',
    bullets: ['Liquidação em D+1', 'Sem parcelamento', 'Aprovação na hora'],
  },
  {
    method: 'Boleto',
    icon: Barcode,
    rate: '1,5%',
    fixed: '+ R$ 3,50 por boleto',
    bullets: ['Cobrado por boleto gerado', 'Compensação em 1–2 dias úteis', 'Ideal para tickets mais altos'],
  },
]

function TaxaCardTile({ c }: { c: TaxaCard }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-primary/40">
      {/* cabeçalho — banda com ícone + método */}
      <div className="flex items-center gap-2.5 border-b border-border bg-card-muted/40 px-4 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <c.icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <p className="truncate text-sm font-bold text-foreground">{c.method}</p>
      </div>

      {/* corpo */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-6">
        {/* número grande (altura fixa p/ alinhar os botões entre os cards) */}
        <div className="flex min-h-[104px] flex-col justify-center text-center">
          <p className="text-[40px] font-bold leading-none tracking-tight text-foreground">{c.rate}</p>
          {c.rateNote && <p className="mt-2 text-sm font-semibold text-primary">{c.rateNote}</p>}
          <p className="mt-2 text-sm text-muted">{c.fixed}</p>
        </div>

        {/* detalhes */}
        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-faint">Detalhes</p>
        <ul className="mt-3 space-y-2.5">
          {c.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-sm text-muted">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function TaxasTab() {
  return (
    <div className="space-y-6">
      {/* ===== DESKTOP: 5 cards verticais (substitui a tabela) ===== */}
      <div className="hidden lg:block">
        <h3 className="mb-5 flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Taxas por método de pagamento
        </h3>

        <div className="grid grid-cols-5 gap-4">
          {TAXA_CARDS.map((c) => (
            <TaxaCardTile key={c.method} c={c} />
          ))}
        </div>

        <p className="mt-5 text-xs text-faint">
          Na Nummo suas taxas são personalizáveis de acordo com seu business, entre em contato com seu gerente para negociá-las!
        </p>
      </div>

      {/* ===== MOBILE: tabela de sempre (inalterada) ===== */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:hidden">
        <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
          Taxas por método de pagamento
        </h3>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold">Formato da Taxa</th>
                <th className="px-3 py-3 font-semibold">Taxa Real</th>
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
          Na Nummo suas taxas são personalizáveis de acordo com seu business, entre em contato com seu gerente para negociá-las!
        </p>
      </div>
    </div>
  )
}
