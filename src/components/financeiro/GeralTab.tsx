import { useMemo, useState } from 'react'
import { Wallet, Clock, ShieldCheck, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Eye, X } from 'lucide-react'
import {
  balances,
  movimentacoes,
  saques as saquesData,
  antecipacoes,
  type Saque,
} from '../../data/financeiroData'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { formatCurrency } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { Button, Field, Input } from '../settings/primitives'
import { StatusBadge } from '../reports/reportsPrimitives'
import { BalanceCard, InternalTabs, Modal } from './financeiroPrimitives'

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

export function GeralTab() {
  const [internal, setInternal] = useState('Extrato')
  const [modal, setModal] = useState<null | 'depositar' | 'saque' | 'antecipar'>(null)
  const [saques, setSaques] = useState<Saque[]>(saquesData)

  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const start = useMemo(() => addDays(startOfDay(new Date()), -90), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start],
  )
  const inRange = (d: Date) => d >= range.from && d <= range.to

  function handleChange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const mov = movimentacoes.filter((m) => inRange(m.date))
  const saq = saques.filter((s) => inRange(s.date))
  const ant = antecipacoes.filter((a) => inRange(a.date))

  return (
    <div className="space-y-6">
      {/* cards de saldo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BalanceCard label="Disponível para Saque" value={balances.disponivel} obs="Base para ações de saque" icon={Wallet} />
        <BalanceCard
          label="A Receber"
          value={balances.aReceber}
          obs="Valores com D+ ainda não liberados"
          icon={Clock}
          action={
            <Button size="sm" variant="outline" onClick={() => setInternal('Antecipações')}>
              Solicitar Antecipação
            </Button>
          }
        />
        <BalanceCard label="Reserva Financeira" value={balances.reserva} obs="Liberado conforme contrato" icon={ShieldCheck} />
        <BalanceCard label="Saldo em Protesto" value={balances.protesto} obs="Desbloqueado após resolução" icon={AlertTriangle} />
      </div>

      {/* ações */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setModal('depositar')}>
          <ArrowDownToLine className="h-4 w-4" /> Depositar
        </Button>
        <Button variant="outline" onClick={() => setModal('saque')}>
          <ArrowUpFromLine className="h-4 w-4" /> Saque
        </Button>
      </div>

      {/* abas internas */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InternalTabs tabs={['Extrato', 'Saques', 'Antecipações']} active={internal} onChange={setInternal} />
          <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
        </div>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          {internal === 'Extrato' && (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3 font-semibold">Tipo</th>
                  <th className="px-3 py-3 font-semibold">Descrição</th>
                  <th className="px-3 py-3 font-semibold">Categoria</th>
                  <th className="px-3 py-3 font-semibold">Data</th>
                  <th className="px-3 py-3 text-right font-semibold">Valor</th>
                  <th className="py-3 pl-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mov.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-3 font-medium text-foreground">{m.type}</td>
                    <td className="px-3 py-3.5 text-muted">{m.description}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{m.category}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDateTime(m.date)}</td>
                    <td className={cn('whitespace-nowrap px-3 py-3.5 text-right font-semibold', m.value >= 0 ? 'text-positive' : 'text-negative')}>
                      {m.value >= 0 ? '+' : '−'} {formatCurrency(Math.abs(m.value))}
                    </td>
                    <td className="py-3.5 pl-3 text-right">
                      <button className="rounded-lg p-1.5 text-muted transition-colors hover:bg-card-muted hover:text-foreground" aria-label="Ver comprovante">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {internal === 'Saques' && (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3 text-right font-semibold">Valor</th>
                  <th className="px-3 py-3 font-semibold">Chave Pix</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Data de Solicitação</th>
                  <th className="py-3 pl-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {saq.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-3 text-right font-semibold text-foreground">{formatCurrency(s.value)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{s.pixKey}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{fmtDateTime(s.date)}</td>
                    <td className="py-3.5 pl-3 text-right">
                      {(s.status === 'Pendente' || s.status === 'Em Revisão') && (
                        <Button size="sm" variant="ghost" onClick={() => setSaques((l) => l.filter((x) => x.id !== s.id))}>
                          <X className="h-3.5 w-3.5" /> Cancelar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {internal === 'Antecipações' && (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3 text-right font-semibold">Valor Bruto</th>
                  <th className="px-3 py-3 font-semibold">Taxa</th>
                  <th className="px-3 py-3 text-right font-semibold">Líquido</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="py-3 pl-3 font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>
                {ant.map((a) => (
                  <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-3 text-right text-muted">{formatCurrency(a.bruto)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{a.taxa.toString().replace('.', ',')}% a.m.</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-right font-semibold text-foreground">{formatCurrency(a.liquido)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="whitespace-nowrap py-3.5 pl-3 text-muted">{a.date.toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {((internal === 'Extrato' && mov.length === 0) ||
            (internal === 'Saques' && saq.length === 0) ||
            (internal === 'Antecipações' && ant.length === 0)) && (
            <p className="py-12 text-center text-sm text-muted">Nada encontrado para o período.</p>
          )}
        </div>
      </div>

      {/* ---- Modais (mockup, sem mover dinheiro) ---- */}
      <Modal
        open={modal === 'depositar'}
        title="Depositar"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModal(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => setModal(null)}>Gerar Pix de depósito</Button>
          </>
        }
      >
        <Field label="Valor do depósito">
          <Input placeholder="R$ 0,00" inputMode="numeric" />
        </Field>
        <p className="mt-3 rounded-xl bg-card-muted/40 px-3.5 py-2.5 text-xs text-muted">
          Geramos um Pix copia-e-cola pra você adicionar saldo à conta nummo.
        </p>
      </Modal>

      <Modal
        open={modal === 'saque'}
        title="Solicitar saque"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModal(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => setModal(null)}>Solicitar saque</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Valor do saque" hint={`Disponível: ${formatCurrency(balances.disponivel)}`}>
            <Input placeholder="R$ 0,00" inputMode="numeric" />
          </Field>
          <Field label="Chave Pix de destino">
            <Input placeholder="CPF, CNPJ, e-mail, telefone ou aleatória" />
          </Field>
        </div>
      </Modal>

      <Modal
        open={modal === 'antecipar'}
        title="Solicitar antecipação"
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModal(null)}>Cancelar</Button>
            <Button size="sm" onClick={() => setModal(null)}>Solicitar</Button>
          </>
        }
      >
        <Field label="Valor a antecipar" hint={`A receber: ${formatCurrency(balances.aReceber)} · Taxa: 2,5% a.m.`}>
          <Input placeholder="R$ 0,00" inputMode="numeric" />
        </Field>
      </Modal>
    </div>
  )
}
