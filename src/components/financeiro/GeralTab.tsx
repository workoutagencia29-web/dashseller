import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Wallet, Clock, ShieldCheck, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, X, Download } from 'lucide-react'
import {
  balances,
  movimentacoes,
  saques as saquesData,
  antecipacoes as antecipacoesData,
  type Saque,
  type SaqueStatus,
  type Antecipacao,
  type AntecipStatus,
  type Movimentacao,
} from '../../data/financeiroData'
import { bankAccounts } from '../../data/settingsData'
import { DateRangeFilter } from '../ui/DateRangeFilter'
import { presetRange, addDays, startOfDay, type RangePreset, type DateRange } from '../../lib/date'
import { cn, formatCurrency } from '../../lib/utils'
import { Button, Field, Input, Select } from '../settings/primitives'
import { StatusBadge, TypeBadge, Drawer, DetailRow, DrawerSection, Pagination, GhostRows, MultiSelect, SearchInput } from '../reports/reportsPrimitives'
import { BalanceCard, InternalTabs, Modal } from './financeiroPrimitives'

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

const PER_PAGE = 10
const SAQUE_STATUSES: SaqueStatus[] = ['Concluído', 'Pendente', 'Em Revisão', 'Negado']
const ANTECIP_STATUSES: AntecipStatus[] = ['Aprovada', 'Pendente', 'Negada']
const CONTA_OPTIONS = Array.from(new Set(saquesData.map((s) => s.bankAccount)))
const MOV_TIPOS = Array.from(new Set(movimentacoes.map((m) => m.type)))
/** Conta de recebimento padrão no saque: a conta principal cadastrada em Configurações. */
const DEFAULT_CONTA = String(bankAccounts.find((a) => a.primary)?.id ?? bankAccounts[0]?.id ?? '')

const movId = (m: Movimentacao) => `MOV${String(m.id).padStart(4, '0')}`
const saqueId = (s: Saque) => `SAQ${String(s.id).padStart(4, '0')}`
const antecipId = (a: Antecipacao) => `ANT${String(a.id).padStart(4, '0')}`

function baixarTxt(filename: string, txt: string) {
  const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function baixarComprovante(m: Movimentacao) {
  const sinal = m.value >= 0 ? '+' : '−'
  baixarTxt(
    `comprovante-${movId(m)}.txt`,
    `COMPROVANTE DE MOVIMENTAÇÃO — nummo\n\nID: ${movId(m)}\nData: ${fmtDateTime(m.date)}\nTipo: ${m.type}\nCategoria: ${m.category}\nDescrição: ${m.description}\nValor: ${sinal} ${formatCurrency(Math.abs(m.value))}\n`,
  )
}

function baixarComprovanteSaque(s: Saque) {
  baixarTxt(
    `comprovante-${saqueId(s)}.txt`,
    `COMPROVANTE DE SAQUE — nummo\n\nID: ${saqueId(s)}\nData de solicitação: ${fmtDateTime(s.date)}\nValor: ${formatCurrency(s.value)}\nConta bancária: ${s.bankAccount}\nStatus: ${s.status}\n`,
  )
}

function baixarComprovanteAntecip(a: Antecipacao) {
  baixarTxt(
    `comprovante-${antecipId(a)}.txt`,
    `COMPROVANTE DE ANTECIPAÇÃO — nummo\n\nID: ${antecipId(a)}\nData: ${fmtDateTime(a.date)}\nValor bruto: ${formatCurrency(a.bruto)}\nTaxa: ${a.taxa.toString().replace('.', ',')}% a.m.\nValor líquido: ${formatCurrency(a.liquido)}\nStatus: ${a.status}\n`,
  )
}

export function GeralTab() {
  const location = useLocation()
  const navigate = useNavigate()
  const [internal, setInternal] = useState('Extrato')
  const [modal, setModal] = useState<null | 'depositar' | 'saque' | 'antecipar'>(null)
  const [saques, setSaques] = useState<Saque[]>(saquesData)
  const [antecipacoes, setAntecipacoes] = useState<Antecipacao[]>(antecipacoesData)
  const [selected, setSelected] = useState<Movimentacao | null>(null)
  const [selectedSaque, setSelectedSaque] = useState<Saque | null>(null)
  const [selectedAntecip, setSelectedAntecip] = useState<Antecipacao | null>(null)
  const [movTipo, setMovTipo] = useState<string[]>([])
  const [saqueStatus, setSaqueStatus] = useState<string[]>([])
  const [saqueConta, setSaqueConta] = useState<string[]>([])
  const [antecipStatus, setAntecipStatus] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // vindo do card "Meu saldo disponível" do dashboard: já abre o modal de saque
  useEffect(() => {
    if ((location.state as { openSaque?: boolean } | null)?.openSaque) {
      setModal('saque')
      navigate(location.pathname, { replace: true, state: null }) // limpa pra não reabrir
    }
  }, [location.state, location.pathname, navigate])

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

  const q = search.trim().toLowerCase()
  const mov = movimentacoes.filter(
    (m) =>
      inRange(m.date) &&
      (movTipo.length === 0 || movTipo.includes(m.type)) &&
      (!q ||
        m.description.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        movId(m).toLowerCase().includes(q)),
  )
  const saq = saques.filter(
    (s) =>
      inRange(s.date) &&
      (saqueStatus.length === 0 || saqueStatus.includes(s.status)) &&
      (saqueConta.length === 0 || saqueConta.includes(s.bankAccount)) &&
      (!q || s.bankAccount.toLowerCase().includes(q) || saqueId(s).toLowerCase().includes(q)),
  )
  const ant = antecipacoes.filter(
    (a) =>
      inRange(a.date) &&
      (antecipStatus.length === 0 || antecipStatus.includes(a.status)) &&
      (!q || antecipId(a).toLowerCase().includes(q)),
  )

  // paginação: 10 por página na aba interna ativa, card de altura fixa
  const activeLen = internal === 'Extrato' ? mov.length : internal === 'Saques' ? saq.length : ant.length
  const totalPages = Math.max(1, Math.ceil(activeLen / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PER_PAGE
  const to = safePage * PER_PAGE
  const movPaged = mov.slice(from, to)
  const saqPaged = saq.slice(from, to)
  const antPaged = ant.slice(from, to)
  // volta pra página 1 quando troca de aba interna, muda o período/filtro ou busca
  useEffect(() => setPage(1), [internal, range, movTipo, saqueStatus, saqueConta, antecipStatus, search])
  // limpa a busca ao trocar de aba interna (cada aba busca campos diferentes)
  useEffect(() => setSearch(''), [internal])

  return (
    <div className="space-y-6">
      {/* cards de saldo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <BalanceCard label="Disponível para Saque" value={balances.disponivel} icon={Wallet} />
        <BalanceCard
          label="A Receber"
          value={balances.aReceber}
          icon={Clock}
          action={
            <Button size="sm" variant="outline" onClick={() => setModal('antecipar')}>
              Solicitar Antecipação
            </Button>
          }
        />
        <BalanceCard label="Reserva Financeira" value={balances.reserva} icon={ShieldCheck} />
        <BalanceCard label="Saldo em Protesto" value={balances.protesto} icon={AlertTriangle} />
      </div>

      {/* ações — mesma grade dos cards: Depositar cobre 2 cards (até A Receber), Saque os outros 2 (até Protesto) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Button onClick={() => setModal('depositar')} className="w-full sm:col-span-2">
          <ArrowDownToLine className="h-4 w-4" /> Depositar
        </Button>
        <Button variant="outline" onClick={() => setModal('saque')} className="w-full sm:col-span-2">
          <ArrowUpFromLine className="h-4 w-4" /> Saque
        </Button>
      </div>

      {/* abas internas */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InternalTabs tabs={['Extrato', 'Saques', 'Antecipações']} active={internal} onChange={setInternal} />
          <div className="flex flex-wrap items-center gap-2.5">
            {internal === 'Extrato' && (
              <MultiSelect label="Tipo" options={MOV_TIPOS} selected={movTipo} onChange={setMovTipo} />
            )}
            {internal === 'Saques' && (
              <>
                <MultiSelect label="Conta bancária" options={CONTA_OPTIONS} selected={saqueConta} onChange={setSaqueConta} />
                <MultiSelect label="Status" options={SAQUE_STATUSES} selected={saqueStatus} onChange={setSaqueStatus} />
              </>
            )}
            {internal === 'Antecipações' && (
              <MultiSelect label="Status" options={ANTECIP_STATUSES} selected={antecipStatus} onChange={setAntecipStatus} />
            )}
            <DateRangeFilter preset={preset} customRange={customRange} onChange={handleChange} />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder={internal === 'Saques' ? 'Buscar conta ou ID' : internal === 'Antecipações' ? 'Buscar ID' : 'Buscar descrição, tipo ou ID'}
            />
          </div>
        </div>

        <div className="scrollbar-thin mt-5 overflow-x-auto">
          {internal === 'Extrato' && (
            <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-5 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="py-3 pl-5 font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {movPaged.map((m) => (
                  <tr key={m.id} className="h-[63px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-5 text-muted">{m.date.toLocaleDateString('pt-BR')}</td>
                    <td className={cn('whitespace-nowrap px-5 py-3.5 font-semibold', m.value >= 0 ? 'text-positive' : 'text-negative')}>
                      {m.value >= 0 ? '+' : '−'} {formatCurrency(Math.abs(m.value))}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{m.type}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{m.category}</td>
                    <td className="py-3.5 pl-5">
                      <button onClick={() => setSelected(m)} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                <GhostRows count={movPaged.length === 0 ? 0 : PER_PAGE - movPaged.length} colSpan={5} rowClassName="h-[63px]" />
              </tbody>
            </table>
          )}

          {internal === 'Saques' && (
            <table className="w-full min-w-[1000px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-5 font-semibold">Data de Solicitação</th>
                  <th className="px-5 py-3 font-semibold">Valor</th>
                  <th className="px-5 py-3 font-semibold">Conta Bancária</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Ações</th>
                  <th className="py-3 pl-5 font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {saqPaged.map((s) => (
                  <tr key={s.id} className="h-[63px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-5 text-muted">{s.date.toLocaleDateString('pt-BR')}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 font-semibold text-foreground">{formatCurrency(s.value)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{s.bankAccount}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={s.status} /></td>
                    <td className="px-5 py-3.5">
                      {(s.status === 'Pendente' || s.status === 'Em Revisão') && (
                        <button
                          onClick={() => setSaques((l) => l.filter((x) => x.id !== s.id))}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-negative/50 hover:text-negative"
                        >
                          <X className="h-3.5 w-3.5" /> Cancelar
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 pl-5">
                      <button onClick={() => setSelectedSaque(s)} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                <GhostRows count={saqPaged.length === 0 ? 0 : PER_PAGE - saqPaged.length} colSpan={6} rowClassName="h-[63px]" />
              </tbody>
            </table>
          )}

          {internal === 'Antecipações' && (
            <table className="w-full min-w-[900px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3 font-semibold">Data</th>
                  <th className="px-3 py-3 font-semibold">Valor Bruto</th>
                  <th className="px-3 py-3 font-semibold">Taxa</th>
                  <th className="px-3 py-3 font-semibold">Líquido</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Ações</th>
                  <th className="py-3 pl-3 font-semibold">Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {antPaged.map((a) => (
                  <tr key={a.id} className="h-[63px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="whitespace-nowrap py-3.5 pr-3 text-muted">{a.date.toLocaleDateString('pt-BR')}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-foreground">{formatCurrency(a.bruto)}</td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-muted">{a.taxa.toString().replace('.', ',')}% a.m.</td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-semibold text-foreground">{formatCurrency(a.liquido)}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-3.5">
                      {a.status === 'Pendente' && (
                        <button
                          onClick={() => setAntecipacoes((l) => l.filter((x) => x.id !== a.id))}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-negative/50 hover:text-negative"
                        >
                          <X className="h-3.5 w-3.5" /> Cancelar
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 pl-3">
                      <button onClick={() => setSelectedAntecip(a)} className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                <GhostRows count={antPaged.length === 0 ? 0 : PER_PAGE - antPaged.length} colSpan={7} rowClassName="h-[63px]" />
              </tbody>
            </table>
          )}

          {((internal === 'Extrato' && mov.length === 0) ||
            (internal === 'Saques' && saq.length === 0) ||
            (internal === 'Antecipações' && ant.length === 0)) && (
            <p className="py-12 text-center text-sm text-muted">Nada encontrado para o período.</p>
          )}
        </div>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
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
          <Field label="Conta de destino" hint="Taxa de saque: R$ 3,99">
            <Select defaultValue={DEFAULT_CONTA}>
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank} · Conta {a.account} · Pix {a.pixType}
                </option>
              ))}
            </Select>
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

      {/* drawer de detalhes da movimentação (olhinho do Extrato) */}
      <Drawer
        open={!!selected}
        title="Detalhes da movimentação"
        onClose={() => setSelected(null)}
        footer={
          selected ? (
            <Button className="w-full" onClick={() => baixarComprovante(selected)}>
              <Download className="h-4 w-4" /> Baixar comprovante
            </Button>
          ) : undefined
        }
      >
        {selected && (
          <>
            <DrawerSection title="Lançamento">
              <DetailRow label="ID" value={<span className="font-mono">{movId(selected)}</span>} />
              <DetailRow label="Data" value={fmtDateTime(selected.date)} />
              <DetailRow label="Tipo" value={<TypeBadge type={selected.type} />} />
              <DetailRow label="Categoria" value={selected.category} />
              <DetailRow
                label="Valor"
                value={
                  <span className={cn('font-semibold', selected.value >= 0 ? 'text-positive' : 'text-negative')}>
                    {selected.value >= 0 ? '+' : '−'} {formatCurrency(Math.abs(selected.value))}
                  </span>
                }
              />
            </DrawerSection>

            <DrawerSection title="Descrição">
              <p className="rounded-xl bg-card-muted/40 px-3.5 py-3 text-sm text-foreground">{selected.description}</p>
            </DrawerSection>
          </>
        )}
      </Drawer>

      {/* drawer de detalhes do saque (botão Ver em Saques) */}
      <Drawer
        open={!!selectedSaque}
        title="Detalhes do saque"
        onClose={() => setSelectedSaque(null)}
        footer={
          selectedSaque?.status === 'Concluído' ? (
            <Button className="w-full" onClick={() => baixarComprovanteSaque(selectedSaque)}>
              <Download className="h-4 w-4" /> Baixar comprovante
            </Button>
          ) : undefined
        }
      >
        {selectedSaque && (
          <>
            <DrawerSection title="Saque">
              <DetailRow label="ID" value={<span className="font-mono">{saqueId(selectedSaque)}</span>} />
              <DetailRow label="Data de solicitação" value={fmtDateTime(selectedSaque.date)} />
              <DetailRow label="Valor" value={formatCurrency(selectedSaque.value)} />
              <DetailRow label="Status" value={<StatusBadge status={selectedSaque.status} />} />
            </DrawerSection>

            <DrawerSection title="Destino">
              <DetailRow label="Conta bancária" value={selectedSaque.bankAccount} />
            </DrawerSection>

            {selectedSaque.status === 'Negado' && selectedSaque.motivo && (
              <DrawerSection title="Motivo da negação">
                <p className="rounded-xl bg-card-muted/40 px-3.5 py-3 text-sm text-foreground">{selectedSaque.motivo}</p>
              </DrawerSection>
            )}
          </>
        )}
      </Drawer>

      {/* drawer de detalhes da antecipação (botão Ver em Antecipações) */}
      <Drawer
        open={!!selectedAntecip}
        title="Detalhes da antecipação"
        onClose={() => setSelectedAntecip(null)}
        footer={
          selectedAntecip?.status === 'Aprovada' ? (
            <Button className="w-full" onClick={() => baixarComprovanteAntecip(selectedAntecip)}>
              <Download className="h-4 w-4" /> Baixar comprovante
            </Button>
          ) : undefined
        }
      >
        {selectedAntecip && (
          <>
            <DrawerSection title="Antecipação">
              <DetailRow label="ID" value={<span className="font-mono">{antecipId(selectedAntecip)}</span>} />
              <DetailRow label="Data" value={fmtDateTime(selectedAntecip.date)} />
              <DetailRow label="Valor bruto" value={formatCurrency(selectedAntecip.bruto)} />
              <DetailRow label="Taxa" value={`${selectedAntecip.taxa.toString().replace('.', ',')}% a.m.`} />
              <DetailRow label="Valor líquido" value={formatCurrency(selectedAntecip.liquido)} />
              <DetailRow label="Status" value={<StatusBadge status={selectedAntecip.status} />} />
            </DrawerSection>

            {selectedAntecip.status === 'Negada' && selectedAntecip.motivo && (
              <DrawerSection title="Motivo da negação">
                <p className="rounded-xl bg-card-muted/40 px-3.5 py-3 text-sm text-foreground">{selectedAntecip.motivo}</p>
              </DrawerSection>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}
