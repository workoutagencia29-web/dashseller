import { useEffect, useMemo, useState } from 'react'
import {
  Link2,
  Plus,
  Copy,
  Check,
  Power,
  Percent,
  QrCode,
  CreditCard,
  Barcode,
  MessageCircle,
} from 'lucide-react'
import { cn, formatCurrency, formatNumber } from '../../lib/utils'
import { Button, Field, Input, Select, Switch } from '../settings/primitives'
import {
  SearchInput,
  MultiSelect,
  Drawer,
  DrawerSection,
  DetailRow,
  Pagination,
  GhostRows,
} from '../reports/reportsPrimitives'
import {
  linksSeed,
  PRODUTOS,
  NEXT_LINK_ID,
  linkUrl,
  randomSlug,
  formatLinkDate,
  type PaymentLink,
  type LinkTipo,
  type LinkCobranca,
  type LinkFreq,
  type LinkStatus,
} from '../../data/linkPagamentoData'

const PER_PAGE = 10
const STATUS_OPTIONS: LinkStatus[] = ['Ativo', 'Pago', 'Expirado', 'Desativado']
const TIPO_OPTIONS: LinkTipo[] = ['Avulso', 'Produto']

const STATUS_STYLES: Record<LinkStatus, string> = {
  Ativo: 'bg-primary/10 text-primary',
  Pago: 'bg-emerald-500/15 text-emerald-500',
  Expirado: 'bg-chart-yellow/15 text-chart-yellow',
  Desativado: 'bg-card-muted text-muted',
}

function StatusBadge({ status }: { status: LinkStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', STATUS_STYLES[status])}>
      {status}
    </span>
  )
}

/** "Pix · Cartão · Boleto" a partir dos métodos ativos. */
function methodsLabel(m: PaymentLink['metodos']): string {
  const out: string[] = []
  if (m.pix) out.push('Pix')
  if (m.cartao) out.push('Cartão')
  if (m.boleto) out.push('Boleto')
  return out.length ? out.join(' · ') : '—'
}

const valorLabel = (l: PaymentLink) =>
  l.valorAberto ? 'Valor livre' : `${formatCurrency(l.valor)}${l.cobranca === 'Assinatura' ? `/${l.frequencia === 'Anual' ? 'ano' : 'mês'}` : ''}`

function parseBRL(s: string): number {
  const n = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.'))
  return isFinite(n) ? n : 0
}

/* --------------------------- Cards de resumo -------------------------- */

function ResumoCard({ label, primary, secondary }: { label: string; primary: string; secondary: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{primary}</p>
      <p className="mt-1 text-xs text-muted">{secondary}</p>
    </div>
  )
}

/* =============================== Aba ================================= */

export function LinkPagamentoTab() {
  const [links, setLinks] = useState<PaymentLink[]>(linksSeed)
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState<string[]>([])
  const [tipoF, setTipoF] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const selected = links.find((l) => l.id === selectedId) ?? null

  const resumo = useMemo(() => {
    const ativos = links.filter((l) => l.status === 'Ativo').length
    const recebido = links.reduce((s, l) => s + l.pagamentos * l.valor, 0)
    const pagamentos = links.reduce((s, l) => s + l.pagamentos, 0)
    const cliques = links.reduce((s, l) => s + l.cliques, 0)
    return { ativos, recebido, pagamentos, cliques }
  }, [links])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return links.filter((l) => {
      const matchesSearch = !q || l.titulo.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q)
      const matchesStatus = statusF.length === 0 || statusF.includes(l.status)
      const matchesTipo = tipoF.length === 0 || tipoF.includes(l.tipo)
      return matchesSearch && matchesStatus && matchesTipo
    })
  }, [links, search, statusF, tipoF])

  useEffect(() => setPage(1), [search, statusF, tipoF])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  function toggleStatus(id: number) {
    setLinks((list) =>
      list.map((l) =>
        l.id === id ? { ...l, status: l.status === 'Desativado' ? 'Ativo' : 'Desativado' } : l,
      ),
    )
  }

  function addLink(novo: PaymentLink) {
    // id sequencial garantido a partir do maior id atual (evita colisão)
    setLinks((list) => [{ ...novo, id: list.reduce((m, l) => Math.max(m, l.id), 0) + 1 }, ...list])
    setCreateOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ResumoCard label="Links ativos" primary={String(resumo.ativos)} secondary={`${links.length} links no total`} />
        <ResumoCard label="Recebido via links" primary={formatCurrency(resumo.recebido)} secondary={`${formatNumber(resumo.pagamentos)} pagamentos`} />
        <ResumoCard label="Cliques" primary={formatNumber(resumo.cliques)} secondary={`${resumo.cliques ? Math.round((resumo.pagamentos / resumo.cliques) * 100) : 0}% de conversão`} />
      </div>

      {/* lista */}
      <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
            Links de pagamento
          </h3>
          <div className="flex flex-wrap items-center gap-2.5">
            <MultiSelect label="Tipo" options={TIPO_OPTIONS} selected={tipoF} onChange={setTipoF} />
            <MultiSelect label="Status" options={STATUS_OPTIONS} selected={statusF} onChange={setStatusF} />
            <SearchInput value={search} onChange={setSearch} placeholder="Buscar por título ou código" />
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Criar link
            </Button>
          </div>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="py-3 pr-5 font-semibold">Link</th>
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Valor</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="py-3 pl-5 font-semibold">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((l) => (
                <tr key={l.id} className="h-[65px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                  <td className="py-3.5 pr-5">
                    <p className="truncate font-medium text-foreground">{l.titulo}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-foreground">{l.tipo}</p>
                    <p className="text-xs text-muted">{l.cobranca === 'Assinatura' ? `Assinatura · ${l.frequencia}` : 'Única'}</p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 font-medium text-foreground">{valorLabel(l)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={l.status} /></td>
                  <td className="py-3.5 pl-5">
                    <button
                      onClick={() => setSelectedId(l.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
              <GhostRows count={pageRows.length === 0 ? 0 : PER_PAGE - pageRows.length} colSpan={5} rowClassName="h-[65px]" />
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted">Nenhum link encontrado.</p>}
        </div>

        <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>

      {/* drawer de detalhes */}
      <Drawer open={!!selected} title="Detalhes do link" onClose={() => setSelectedId(null)} widthClass="max-w-lg">
        {selected && (
          <LinkDetailBody
            l={selected}
            copied={copied}
            onCopy={copy}
            onToggle={() => toggleStatus(selected.id)}
          />
        )}
      </Drawer>

      {/* drawer de criar */}
      {createOpen && <CreateLinkDrawer onClose={() => setCreateOpen(false)} onCreate={addLink} />}
    </div>
  )
}

/* ========================= Drawer: detalhes ========================== */

function LinkDetailBody({
  l,
  copied,
  onCopy,
  onToggle,
}: {
  l: PaymentLink
  copied: string | null
  onCopy: (text: string, key: string) => void
  onToggle: () => void
}) {
  const url = linkUrl(l.slug)
  const full = `https://${url}`
  const conv = l.cliques ? Math.round((l.pagamentos / l.cliques) * 100) : 0

  return (
    <div>
      {/* URL + compartilhar */}
      <DrawerSection title="Link do checkout">
        <div className="flex items-stretch gap-2">
          <div className="flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl border border-border bg-input/60 px-3.5 py-2.5">
            <span className="whitespace-nowrap font-mono text-sm text-foreground">{url}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onCopy(full, 'detail')} className="shrink-0">
            {copied === 'detail' ? <><Check className="h-3.5 w-3.5 text-positive" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Pague com segurança: ${full}`)}`, '_blank', 'noopener,noreferrer')}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Compartilhar no WhatsApp
          </Button>
        </div>
      </DrawerSection>

      {/* métricas */}
      <DrawerSection title="Desempenho">
        <div className="grid grid-cols-3 gap-3">
          {[
            { k: 'Cliques', v: formatNumber(l.cliques) },
            { k: 'Pagamentos', v: formatNumber(l.pagamentos) },
            { k: 'Conversão', v: `${conv}%` },
          ].map((m) => (
            <div key={m.k} className="rounded-2xl border border-border bg-card-muted/30 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{m.v}</p>
              <p className="mt-0.5 text-xs text-muted">{m.k}</p>
            </div>
          ))}
        </div>
      </DrawerSection>

      {/* configuração */}
      <DrawerSection title="Configuração">
        <DetailRow label="Tipo" value={l.tipo === 'Produto' ? `Produto · ${l.produto}` : 'Cobrança avulsa'} />
        <DetailRow label="Cobrança" value={l.cobranca === 'Assinatura' ? `Assinatura · ${l.frequencia}` : 'Única'} />
        <DetailRow label="Valor" value={l.valorAberto ? 'Definido pelo cliente' : formatCurrency(l.valor)} />
        <DetailRow label="Métodos" value={methodsLabel(l.metodos)} />
        {l.metodos.cartao && <DetailRow label="Parcelamento" value={l.parcelas > 1 ? `até ${l.parcelas}x` : 'à vista'} />}
        <DetailRow label="Validade" value={l.validade ?? 'Sem validade'} />
        <DetailRow label="Limite de usos" value={l.limiteUsos != null ? `${l.limiteUsos} pagamento(s)` : 'Ilimitado'} />
        <DetailRow label="Cupom" value={l.cupom ?? '—'} />
        <DetailRow label="Redirecionamento" value={l.redirect ?? '—'} />
        <DetailRow label="Order bump" value={l.orderBump ? `${l.orderBump.produto} · ${formatCurrency(l.orderBump.valor)}` : '—'} />
        <DetailRow label="Criado em" value={l.criadoEm} />
        <DetailRow label="Status" value={<StatusBadge status={l.status} />} />
      </DrawerSection>

      {/* ação: ativar/desativar */}
      <DrawerSection title="Ações">
        <button
          onClick={onToggle}
          className={cn(
            'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
            l.status === 'Desativado'
              ? 'border-border hover:bg-card-muted'
              : 'border-negative/20 hover:bg-negative/10',
          )}
        >
          <Power className={cn('h-4 w-4 shrink-0', l.status === 'Desativado' ? 'text-primary' : 'text-negative')} />
          <div>
            <p className={cn('text-sm font-semibold', l.status === 'Desativado' ? 'text-foreground' : 'text-negative')}>
              {l.status === 'Desativado' ? 'Reativar link' : 'Desativar link'}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {l.status === 'Desativado' ? 'Volta a aceitar pagamentos.' : 'O link para de aceitar pagamentos imediatamente.'}
            </p>
          </div>
        </button>
      </DrawerSection>
    </div>
  )
}

/* ========================== Drawer: criar =========================== */

interface FormState {
  tipo: LinkTipo
  produto: string
  titulo: string
  valor: string
  valorAberto: boolean
  cobranca: LinkCobranca
  frequencia: LinkFreq
  pix: boolean
  cartao: boolean
  boleto: boolean
  parcelas: number
  validade: string
  limiteUsos: string
  cupom: string
  redirect: string
  orderBumpOn: boolean
  orderBumpProduto: string
}

function CreateLinkDrawer({ onClose, onCreate }: { onClose: () => void; onCreate: (l: PaymentLink) => void }) {
  const [f, setF] = useState<FormState>({
    tipo: 'Avulso',
    produto: PRODUTOS[0].nome,
    titulo: '',
    valor: '',
    valorAberto: false,
    cobranca: 'Única',
    frequencia: 'Mensal',
    pix: true,
    cartao: true,
    boleto: false,
    parcelas: 12,
    validade: '',
    limiteUsos: '',
    cupom: '',
    redirect: '',
    orderBumpOn: false,
    orderBumpProduto: PRODUTOS[0].nome,
  })
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }))

  const isProd = f.tipo === 'Produto'
  const prodValor = PRODUTOS.find((p) => p.nome === f.produto)?.valor ?? 0
  const valorNum = f.valorAberto ? 0 : isProd ? prodValor : parseBRL(f.valor)
  const anyMethod = f.pix || f.cartao || f.boleto
  const nomeOk = isProd ? !!f.produto : f.titulo.trim().length > 0
  const valorOk = f.valorAberto || valorNum > 0
  const canSubmit = nomeOk && valorOk && anyMethod

  function submit() {
    if (!canSubmit) return
    const novo: PaymentLink = {
      id: NEXT_LINK_ID, // provisório — addLink reatribui um id sequencial único
      slug: randomSlug(),
      titulo: isProd ? f.produto : f.titulo.trim(),
      tipo: f.tipo,
      produto: isProd ? f.produto : undefined,
      cobranca: f.cobranca,
      frequencia: f.cobranca === 'Assinatura' ? f.frequencia : undefined,
      valor: valorNum,
      valorAberto: f.valorAberto,
      metodos: { pix: f.pix, cartao: f.cartao, boleto: f.boleto },
      parcelas: f.cartao ? f.parcelas : 1,
      validade: f.validade ? formatLinkDate(new Date(`${f.validade}T00:00:00`)) : null,
      limiteUsos: f.limiteUsos ? Number(f.limiteUsos) : null,
      cupom: f.cupom.trim() || null,
      redirect: f.redirect.trim() || null,
      orderBump: f.orderBumpOn
        ? { produto: f.orderBumpProduto, valor: PRODUTOS.find((p) => p.nome === f.orderBumpProduto)?.valor ?? 0 }
        : null,
      cliques: 0,
      pagamentos: 0,
      criadoEm: formatLinkDate(new Date()),
      status: 'Ativo',
    }
    onCreate(novo)
  }

  return (
    <Drawer
      open
      title="Criar link de pagamento"
      onClose={onClose}
      widthClass="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={submit} disabled={!canSubmit}>
            <Link2 className="h-4 w-4" /> Gerar link
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* tipo */}
        <DrawerSection title="Tipo de link">
          <Segmented
            options={['Avulso', 'Produto'] as const}
            value={f.tipo}
            onChange={(v) => set('tipo', v)}
            labels={{ Avulso: 'Cobrança avulsa', Produto: 'Vincular produto' }}
          />
          {isProd ? (
            <Field label="Produto" className="mt-4">
              <Select value={f.produto} onChange={(e) => set('produto', e.target.value)}>
                {PRODUTOS.map((p) => (
                  <option key={p.nome} value={p.nome}>{p.nome} — {formatCurrency(p.valor)}</option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="Título / descrição" className="mt-4">
              <Input value={f.titulo} onChange={(e) => set('titulo', e.target.value)} placeholder="Ex: Consultoria avulsa" />
            </Field>
          )}
        </DrawerSection>

        {/* valor + cobrança */}
        <DrawerSection title="Valor e cobrança">
          {!isProd && (
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Cliente escolhe o valor</p>
                <p className="mt-0.5 text-xs text-muted">Ideal para doações ou "pague quanto quiser".</p>
              </div>
              <Switch checked={f.valorAberto} onChange={(v) => set('valorAberto', v)} />
            </div>
          )}
          {!f.valorAberto && (
            <Field label="Valor">
              {isProd ? (
                <Input value={formatCurrency(prodValor)} disabled />
              ) : (
                <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-input/60 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="flex shrink-0 items-center border-r border-border bg-card-muted/50 px-3.5 text-sm font-medium text-muted">R$</span>
                  <input
                    value={f.valor}
                    onChange={(e) => set('valor', e.target.value)}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint focus:outline-none"
                  />
                </div>
              )}
            </Field>
          )}
          <div className="mt-4">
            <p className="mb-1.5 block text-sm font-medium text-foreground">Formato de cobrança</p>
            <Segmented
              options={['Única', 'Assinatura'] as const}
              value={f.cobranca}
              onChange={(v) => set('cobranca', v)}
            />
          </div>
          {f.cobranca === 'Assinatura' && (
            <Field label="Frequência" className="mt-4">
              <Segmented
                options={['Mensal', 'Anual'] as const}
                value={f.frequencia}
                onChange={(v) => set('frequencia', v)}
              />
            </Field>
          )}
        </DrawerSection>

        {/* métodos */}
        <DrawerSection title="Métodos de pagamento">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {([
              { k: 'pix', label: 'Pix', icon: QrCode },
              { k: 'cartao', label: 'Cartão', icon: CreditCard },
              { k: 'boleto', label: 'Boleto', icon: Barcode },
            ] as const).map((m) => {
              const on = f[m.k]
              return (
                <button
                  key={m.k}
                  onClick={() => set(m.k, !on)}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors',
                    on ? 'border-primary bg-primary/5 text-foreground' : 'border-border text-muted hover:bg-card-muted/50',
                  )}
                >
                  <span className="flex items-center gap-2"><m.icon className="h-4 w-4" /> {m.label}</span>
                  <span className={cn('flex h-4 w-4 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>
          {!anyMethod && <p className="mt-2 text-xs text-negative">Selecione ao menos um método.</p>}
          {f.cartao && f.cobranca === 'Única' && (
            <Field label="Parcelamento máximo (cartão)" className="mt-4">
              <Select value={String(f.parcelas)} onChange={(e) => set('parcelas', Number(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n === 1 ? 'À vista (1x)' : `até ${n}x`}</option>
                ))}
              </Select>
            </Field>
          )}
        </DrawerSection>

        {/* opções avançadas */}
        <DrawerSection title="Opções">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Validade" hint="Deixe vazio para não expirar.">
              <Input type="date" value={f.validade} onChange={(e) => set('validade', e.target.value)} />
            </Field>
            <Field label="Limite de pagamentos" hint="Vazio = ilimitado.">
              <Input value={f.limiteUsos} onChange={(e) => set('limiteUsos', e.target.value.replace(/\D/g, ''))} inputMode="numeric" placeholder="Ex: 100" />
            </Field>
            <Field label="Cupom de desconto">
              <div className="relative">
                <Percent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input value={f.cupom} onChange={(e) => set('cupom', e.target.value.toUpperCase())} placeholder="Ex: PROMO10" className="pl-9" />
              </div>
            </Field>
            <Field label="Redirecionar após pagar">
              <Input value={f.redirect} onChange={(e) => set('redirect', e.target.value)} placeholder="https://obrigado.seusite.com" />
            </Field>
          </div>

          {/* order bump */}
          <div className="mt-4 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Order bump</p>
                <p className="mt-0.5 text-xs text-muted">Oferta extra com 1 clique no checkout.</p>
              </div>
              <Switch checked={f.orderBumpOn} onChange={(v) => set('orderBumpOn', v)} />
            </div>
            {f.orderBumpOn && (
              <Field label="Produto do bump" className="mt-3">
                <Select value={f.orderBumpProduto} onChange={(e) => set('orderBumpProduto', e.target.value)}>
                  {PRODUTOS.map((p) => (
                    <option key={p.nome} value={p.nome}>{p.nome} — {formatCurrency(p.valor)}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </DrawerSection>
      </div>
    </Drawer>
  )
}

/* ---------------------------- Segmented ------------------------------ */

function Segmented<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[]
  value: T
  onChange: (v: T) => void
  labels?: Partial<Record<T, string>>
}) {
  return (
    <div className="flex w-full rounded-xl border border-border bg-card-muted/40 p-1 text-sm">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'flex-1 rounded-lg px-3 py-1.5 text-center font-medium transition-colors',
            value === opt ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
          )}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  )
}
