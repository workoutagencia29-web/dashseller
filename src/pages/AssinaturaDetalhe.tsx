import { useState, type ReactNode } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, type LucideIcon } from 'lucide-react'
import type { LayoutContext } from '../components/Layout'
import { assinaturas } from '../data/financeiroData'
import { formatCurrency } from '../lib/utils'
import { StatusBadge } from '../components/reports/reportsPrimitives'
import { Button, Switch, Badge } from '../components/settings/primitives'

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

function DetailCard({ title, icon: Icon, children, className }: { title: string; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-card p-6 ${className ?? ''}`}>
      <h3 className="mb-4 flex items-center gap-2.5 text-base font-bold text-foreground">
        <span className="h-4 w-1.5 shrink-0 rounded-full bg-primary" />
        {Icon && <Icon className="h-4 w-4 text-muted" />}
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-2.5 last:border-0">
      <span className="shrink-0 text-sm text-muted">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

export default function AssinaturaDetalhe() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const { id } = useParams()
  const sub = assinaturas.find((a) => a.id === Number(id))

  const [methods, setMethods] = useState(sub?.methodsEnabled ?? { pix: true, cartao: true, boleto: false })

  if (!sub) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted">Assinatura não encontrada.</p>
        <Link to="/financeiro/assinaturas" className="mt-3 inline-block text-sm font-medium text-primary">
          ← Voltar para Assinaturas
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Link
          to="/financeiro/assinaturas"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Assinaturas
        </Link>
        <button onClick={onOpenMobile} className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden" aria-label="Abrir menu">
          ☰
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">{sub.product}</h1>
        <StatusBadge status={sub.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Card 1 — Informações da Assinatura */}
        <DetailCard title="Informações da Assinatura">
          <Row label="Produto" value={sub.product} />
          <Row label="Valor" value={formatCurrency(sub.value)} />
          <Row label="Data de Início" value={fmtDate(sub.startDate)} />
          <Row label="Próxima Cobrança" value={fmtDate(sub.nextCharge)} />
          <Row label="Último Pagamento" value={fmtDate(sub.lastPayment)} />
          <Row label="Cobrança ID" value={<span className="font-mono">{sub.cobrancaId}</span>} />
        </DetailCard>

        {/* Card 2 — Métodos de Pagamento */}
        <DetailCard title="Métodos de Pagamento">
          <p className="mb-3 text-sm text-muted">Habilite ou desabilite métodos para esta assinatura.</p>
          <div className="divide-y divide-border">
            {(
              [
                { key: 'pix', label: 'Pix' },
                { key: 'cartao', label: 'Cartão de Crédito' },
                { key: 'boleto', label: 'Boleto' },
              ] as const
            ).map((m) => (
              <div key={m.key} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">{m.label}</span>
                <Switch checked={methods[m.key]} onChange={(v) => setMethods((s) => ({ ...s, [m.key]: v }))} />
              </div>
            ))}
          </div>
        </DetailCard>

        {/* Card 3 — Dados do Cliente */}
        <DetailCard title="Dados do Cliente">
          <Row label="Nome" value={sub.buyerName} />
          <Row label="E-mail" value={sub.buyerEmail} />
          <Row label="Documento" value={sub.buyerDoc} />
          <Row label="Telefone" value={sub.buyerPhone} />
          <Row label="Endereço" value={`${sub.address.rua}, ${sub.address.numero}`} />
          <Row label="Complemento" value={sub.address.complemento} />
          <Row label="Bairro" value={sub.address.bairro} />
          <Row label="Cidade / UF" value={`${sub.address.cidade} / ${sub.address.estado}`} />
          <Row label="CEP" value={sub.address.cep} />
          <Row label="País" value={sub.address.pais} />
        </DetailCard>

        {/* Card 4 — Descontos */}
        <DetailCard title="Descontos">
          <p className="mb-3 text-sm text-muted">Desconto aplicado por método de pagamento.</p>
          <Row label="Desconto Pix" value={sub.descontos.pix} />
          <Row label="Desconto Boleto" value={sub.descontos.boleto} />
          <Row label="Desconto Cartão" value={sub.descontos.cartao} />
        </DetailCard>

        {/* Card 5 — Datas de Notificação */}
        <DetailCard
          title="Datas de Notificação"
        >
          <p className="mb-3 text-sm text-muted">Lembretes automáticos enviados ao cliente antes do vencimento.</p>
          <div className="space-y-2">
            {sub.notificacoes.map((n) => (
              <div key={n.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{n.descricao}</p>
                  <p className="text-xs text-muted">
                    <span className="font-mono">{n.id}</span> · criado em {fmtDate(n.criadoEm)}
                  </p>
                </div>
                <Badge tone={n.status === 'Ativa' ? 'success' : 'neutral'}>{n.status}</Badge>
              </div>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4" /> Adicionar lembrete
            </Button>
          </div>
        </DetailCard>
      </div>

      {/* Card 6 — Histórico de Faturas (largura total) */}
      <div className="mt-6 rounded-3xl border border-border bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2.5 text-base font-bold text-foreground">
          <span className="h-4 w-1.5 shrink-0 rounded-full bg-primary" />
          Histórico de Faturas
        </h3>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-3 font-semibold">ID</th>
                <th className="px-3 py-3 font-semibold">Vencimento</th>
                <th className="px-3 py-3 text-right font-semibold">Valor</th>
                <th className="px-3 py-3 font-semibold">Status</th>
                <th className="px-3 py-3 font-semibold">Pagamento</th>
                <th className="py-3 pl-3 font-semibold">Método</th>
              </tr>
            </thead>
            <tbody>
              {sub.faturas.map((f) => (
                <tr key={f.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap py-3.5 pr-3 font-mono text-[13px] text-muted">{f.id}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDate(f.vencimento)}</td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium text-foreground">{formatCurrency(f.value)}</td>
                  <td className="px-3 py-3.5"><StatusBadge status={f.status} /></td>
                  <td className="whitespace-nowrap px-3 py-3.5 text-muted">{f.pagamento ? fmtDate(f.pagamento) : '—'}</td>
                  <td className="whitespace-nowrap py-3.5 pl-3 text-muted">{f.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
