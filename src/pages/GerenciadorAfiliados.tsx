import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Menu,
  Plus,
  Users,
  Hourglass,
  Send,
  Ban,
  PackagePlus,
  Link2,
  StickyNote,
  Pause,
  Play,
  ShieldCheck,
  Trash2,
  X,
  User,
  Mail,
  Copy,
  Check,
  Ticket,
  Pencil,
  type LucideIcon,
} from 'lucide-react'
import type { LayoutContext } from '../components/Layout'
import { DateRangeFilter } from '../components/ui/DateRangeFilter'
import { Button, Input, Select, Textarea, Field } from '../components/settings/primitives'
import {
  SearchInput,
  MultiSelect,
  StatusBadge,
  Drawer,
  DrawerSection,
  DetailRow,
  Pagination,
  GhostRows,
} from '../components/reports/reportsPrimitives'
import {
  afiliadosGerenciados,
  PRODUCT_POOL,
  STATUS_OPTIONS,
  NEXT_AFILIADO_ID,
  referralFor,
  type AfiliadoGerenciado,
  type CommissionType,
  type Vinculo,
} from '../data/gerenciadorAfiliadosData'
import { cn, formatCurrency } from '../lib/utils'
import { presetRange, addDays, startOfDay, endOfDay, type RangePreset, type DateRange } from '../lib/date'

const PER_PAGE = 10
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')
const nf = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
const fmtCommission = (type: CommissionType, value: number) =>
  type === 'percent' ? `${nf(value)}%` : formatCurrency(value)
const parseCommission = (s: string) => Math.round(parseFloat(s.replace(',', '.')) * 100) / 100

/** Resumo da comissão para a coluna da tabela. */
function comissaoResumo(a: AfiliadoGerenciado): string {
  if (a.vinculos.length === 0) return '—'
  const set = new Set(a.vinculos.map((v) => fmtCommission(v.commissionType, v.commissionValue)))
  return set.size === 1 ? [...set][0] : 'Variável'
}

/* ------------------------------ KPI card ------------------------------ */

const KPI_TONES: Record<string, string> = {
  success: 'bg-positive/10 text-positive',
  warning: 'bg-chart-yellow/15 text-chart-yellow',
  info: 'bg-primary/10 text-primary',
  danger: 'bg-negative/10 text-negative',
}

function KpiCard({ label, value, icon: Icon, tone }: { label: string; value: string; icon: LucideIcon; tone: keyof typeof KPI_TONES }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
      <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', KPI_TONES[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 truncate text-[22px] font-bold leading-none tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

/* ------------------------- Comissão (inputs) -------------------------- */

function CommissionTypeToggle({ value, onChange }: { value: CommissionType; onChange: (t: CommissionType) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card-muted/40 p-0.5 text-sm">
      {([['percent', '%'], ['fixed', 'R$']] as const).map(([t, lbl]) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={cn(
            'rounded-md px-3 py-1 font-semibold transition-colors',
            value === t ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
          )}
        >
          {lbl}
        </button>
      ))}
    </div>
  )
}

function CommissionValueInput({ type, value, onChange, className }: { type: CommissionType; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn('relative', className)}>
      {type === 'fixed' && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">R$</span>}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ''))}
        inputMode="decimal"
        placeholder={type === 'fixed' ? '0,00' : '0'}
        className={type === 'fixed' ? 'pl-9' : 'pr-8'}
      />
      {type === 'percent' && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">%</span>}
    </div>
  )
}

/* =============================== Página =============================== */

export default function GerenciadorAfiliados() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [list, setList] = useState<AfiliadoGerenciado[]>(afiliadosGerenciados)
  const idRef = useRef(NEXT_AFILIADO_ID)

  // filtros
  const [search, setSearch] = useState('')
  const [statusF, setStatusF] = useState<string[]>([])
  const [productF, setProductF] = useState<string[]>([])
  const [preset, setPreset] = useState<RangePreset>('all')
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [page, setPage] = useState(1)

  // overlays
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [drawerFocus, setDrawerFocus] = useState<'produtos' | 'notas' | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [confirm, setConfirm] = useState<{ kind: 'block' | 'remove'; id: number; name: string } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const start = useMemo(() => addDays(startOfDay(new Date()), -800), [])
  const range = useMemo(
    () => (preset === 'custom' && customRange ? customRange : presetRange(preset, start)),
    [preset, customRange, start],
  )
  function handleRange(next: RangePreset, custom?: DateRange) {
    setPreset(next)
    if (next === 'custom' && custom) setCustomRange(custom)
  }

  const selected = selectedId == null ? null : list.find((a) => a.id === selectedId) ?? null

  /* ----------------------------- feedback ----------------------------- */
  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2600)
  }

  /* ----------------------------- mutações ----------------------------- */
  const today = fmtDate(new Date())

  function addHistory(a: AfiliadoGerenciado, action: string) {
    const id = a.history.reduce((m, h) => Math.max(m, h.id), 0) + 1
    return [{ id, action, date: today }, ...a.history]
  }

  function changeStatus(id: number, status: AfiliadoGerenciado['status'], action: string, msg: string) {
    setList((l) => l.map((a) => (a.id === id ? { ...a, status, lastActivity: new Date(), history: addHistory(a, action) } : a)))
    showToast(msg)
  }

  function changeVinculos(id: number, vinculos: Vinculo[], action?: string) {
    setList((l) =>
      l.map((a) =>
        a.id === id ? { ...a, vinculos, lastActivity: new Date(), history: action ? addHistory(a, action) : a.history } : a,
      ),
    )
  }

  function addNote(id: number, text: string) {
    setList((l) =>
      l.map((a) => {
        if (a.id !== id) return a
        const nid = a.notes.reduce((m, n) => Math.max(m, n.id), 0) + 1
        return { ...a, notes: [{ id: nid, author: 'Você', text, date: today }, ...a.notes] }
      }),
    )
    showToast('Nota interna adicionada')
  }

  function removeAfiliado(id: number) {
    setList((l) => l.filter((a) => a.id !== id))
    if (selectedId === id) setSelectedId(null)
    showToast('Afiliado removido')
  }

  function openProfile(a: AfiliadoGerenciado, focus: 'produtos' | 'notas' | null = null) {
    setDrawerFocus(focus)
    setSelectedId(a.id)
  }

  function handleInvite(payload: { name: string; email: string; vinculos: { product: string; commissionType: CommissionType; commissionValue: number }[] }) {
    const id = idRef.current++
    const now = new Date()
    const aff: AfiliadoGerenciado = {
      id,
      name: payload.name,
      email: payload.email,
      document: '—',
      phone: '—',
      seed: (id * 7 + 3) % 70,
      status: 'Convite enviado',
      link: referralFor(id, 'afiliado'),
      vinculos: payload.vinculos.map((v) => ({ ...v, link: referralFor(id, v.product) })),
      entryDate: now,
      lastActivity: now,
      history: [{ id: 1, action: 'Convite de afiliado enviado', date: today }],
      notes: [],
    }
    setList((l) => [aff, ...l])
    setInviteOpen(false)
    showToast(`Convite enviado para ${payload.email}`)
  }

  /* ------------------------------- linhas ----------------------------- */
  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    // limite superior no fim do dia para incluir itens criados em runtime (ex.: convites de hoje)
    const upper = endOfDay(range.to)
    return list.filter((a) => {
      const matchesSearch = !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)
      const matchesStatus = statusF.length === 0 || statusF.includes(a.status)
      const matchesProduct = productF.length === 0 || a.vinculos.some((v) => productF.includes(v.product))
      const inPeriod = a.entryDate >= range.from && a.entryDate <= upper
      return matchesSearch && matchesStatus && matchesProduct && inPeriod
    })
  }, [list, search, statusF, productF, range])

  const totalPages = Math.max(1, Math.ceil(rows.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageRows = rows.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)
  useEffect(() => setPage(1), [search, statusF, productF, range])

  const counts = useMemo(
    () => ({
      ativos: list.filter((a) => a.status === 'Ativo').length,
      pendentes: list.filter((a) => a.status === 'Pendente').length,
      convites: list.filter((a) => a.status === 'Convite enviado').length,
      pausadosBloqueados: list.filter((a) => a.status === 'Pausado' || a.status === 'Bloqueado').length,
    }),
    [list],
  )

  return (
    <>
      {/* cabeçalho com CTA principal */}
      <div className="mb-6 flex flex-wrap items-start gap-4">
        <button
          onClick={onOpenMobile}
          className="rounded-lg border border-border bg-card p-2 text-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Gerenciar Afiliados</h1>
          <p className="mt-1 text-sm text-muted">
            Convide parceiros, aprove solicitações e controle os produtos que cada afiliado pode divulgar.
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" /> Convidar afiliado
        </Button>
      </div>

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Afiliados ativos" value={String(counts.ativos)} icon={Users} tone="success" />
          <KpiCard label="Solicitações pendentes" value={String(counts.pendentes)} icon={Hourglass} tone="warning" />
          <KpiCard label="Convites enviados" value={String(counts.convites)} icon={Send} tone="info" />
          <KpiCard label="Pausados ou bloqueados" value={String(counts.pausadosBloqueados)} icon={Ban} tone="danger" />
        </div>

        {/* lista */}
        <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Afiliados
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <DateRangeFilter preset={preset} customRange={customRange} onChange={handleRange} />
              <MultiSelect label="Status" options={STATUS_OPTIONS} selected={statusF} onChange={setStatusF} />
              <MultiSelect label="Produto" options={PRODUCT_POOL} selected={productF} onChange={setProductF} />
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou e-mail" />
            </div>
          </div>

          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                  <th className="w-[24%] py-3 pr-3 font-semibold">Afiliado</th>
                  <th className="w-[28%] px-3 py-3 font-semibold">E-mail</th>
                  <th className="w-[13%] px-3 py-3 font-semibold">Status</th>
                  <th className="w-[14%] px-3 py-3 font-semibold">Produtos</th>
                  <th className="w-[14%] px-3 py-3 font-semibold">Comissão definida</th>
                  <th className="w-[7%] py-3 pl-3 font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((a) => (
                  <tr key={a.id} className="h-[68px] border-b border-border/60 last:border-0 hover:bg-card-muted/40">
                    <td className="truncate py-3.5 pr-3 font-medium text-foreground" title={a.name}>{a.name}</td>
                    <td className="truncate px-3 py-3.5 text-muted" title={a.email}>{a.email}</td>
                    <td className="px-3 py-3.5"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-3.5 text-foreground" title={a.vinculos.map((v) => v.product).join(', ')}>
                      {a.vinculos.length} {a.vinculos.length === 1 ? 'produto' : 'produtos'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 font-medium text-foreground">{comissaoResumo(a)}</td>
                    <td className="py-3.5 pl-3">
                      <button
                        onClick={() => openProfile(a)}
                        className="rounded-lg border border-border px-3 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                <GhostRows count={pageRows.length === 0 ? 0 : PER_PAGE - pageRows.length} colSpan={6} rowClassName="h-[68px]" />
              </tbody>
            </table>
            {rows.length === 0 && (
              <p className="py-12 text-center text-sm text-muted">Nenhum afiliado encontrado para os filtros atuais.</p>
            )}
          </div>

          <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      {/* drawer de perfil */}
      <Drawer open={!!selected} title="Perfil do afiliado" onClose={() => setSelectedId(null)} widthClass="max-w-xl">
        {selected && (
          <ProfileDrawerBody
            key={selected.id}
            a={selected}
            focus={drawerFocus}
            onChangeVinculos={(v, action) => changeVinculos(selected.id, v, action)}
            onAddNote={(text) => addNote(selected.id, text)}
            onPause={() => changeStatus(selected.id, 'Pausado', 'Afiliado pausado', 'Afiliado pausado')}
            onReactivate={() => changeStatus(selected.id, 'Ativo', 'Afiliado reativado', 'Afiliado reativado')}
            onBlock={() => setConfirm({ kind: 'block', id: selected.id, name: selected.name })}
            onUnblock={() => changeStatus(selected.id, 'Ativo', 'Afiliado desbloqueado', 'Afiliado desbloqueado')}
            onRemove={() => setConfirm({ kind: 'remove', id: selected.id, name: selected.name })}
          />
        )}
      </Drawer>

      {/* modal de convite */}
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onSubmit={handleInvite} />}

      {/* confirmação de ações destrutivas */}
      {confirm && (
        <ConfirmDialog
          title={confirm.kind === 'block' ? 'Bloquear afiliado' : 'Remover afiliado'}
          message={
            confirm.kind === 'block'
              ? `Tem certeza que deseja bloquear ${confirm.name}? Ele não poderá divulgar seus produtos enquanto estiver bloqueado.`
              : `Tem certeza que deseja remover ${confirm.name}? Esta ação não pode ser desfeita.`
          }
          confirmLabel={confirm.kind === 'block' ? 'Bloquear' : 'Remover'}
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm.kind === 'block') changeStatus(confirm.id, 'Bloqueado', 'Afiliado bloqueado', 'Afiliado bloqueado')
            else removeAfiliado(confirm.id)
            setConfirm(null)
          }}
        />
      )}

      {/* toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-2xl animate-fade-in">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">{toast}</p>
        </div>
      )}
    </>
  )
}

/* ============================ Drawer: perfil ========================== */

interface ProfileProps {
  a: AfiliadoGerenciado
  focus: 'produtos' | 'notas' | null
  onChangeVinculos: (vinculos: Vinculo[], action?: string) => void
  onAddNote: (text: string) => void
  onPause: () => void
  onReactivate: () => void
  onBlock: () => void
  onUnblock: () => void
  onRemove: () => void
}

function ProfileDrawerBody({ a, focus, onChangeVinculos, onAddNote, onPause, onReactivate, onBlock, onUnblock, onRemove }: ProfileProps) {
  const produtosRef = useRef<HTMLDivElement>(null)
  const notasRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  // adicionar produto
  const available = PRODUCT_POOL.filter((p) => !a.vinculos.some((v) => v.product === p))
  const [newProduct, setNewProduct] = useState('')
  const [newType, setNewType] = useState<CommissionType>('percent')
  const [newVal, setNewVal] = useState('')

  // rola até a seção pedida pela ação do menu
  useEffect(() => {
    const target = focus === 'produtos' ? produtosRef.current : focus === 'notas' ? notasRef.current : null
    if (target) {
      const t = setTimeout(() => target.scrollIntoView({ block: 'start', behavior: 'smooth' }), 80)
      return () => clearTimeout(t)
    }
  }, [focus])

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* ignore */
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  function addProduct() {
    const num = parseCommission(newVal)
    if (!newProduct || !num || num <= 0) return
    const vinc: Vinculo = { product: newProduct, commissionType: newType, commissionValue: num, link: referralFor(a.id, newProduct) }
    onChangeVinculos([...a.vinculos, vinc], `Produto “${newProduct}” vinculado`)
    setNewProduct('')
    setNewType('percent')
    setNewVal('')
  }

  function submitNote() {
    const t = noteText.trim()
    if (!t) return
    onAddNote(t)
    setNoteText('')
  }

  const blocked = a.status === 'Bloqueado'
  const paused = a.status === 'Pausado'

  return (
    <div>
      {/* identidade */}
      <div className="mb-6 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold text-foreground">{a.name}</p>
          <p className="truncate text-sm text-muted">{a.email}</p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* dados cadastrais */}
      <DrawerSection title="Dados cadastrais">
        <DetailRow label="E-mail" value={a.email} />
        <DetailRow label="CPF / CNPJ" value={<span className="font-mono">{a.document}</span>} />
        <DetailRow label="Telefone" value={a.phone} />
        <DetailRow label="Data de entrada" value={fmtDate(a.entryDate)} />
        <DetailRow label="Última atividade" value={fmtDate(a.lastActivity)} />
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-medium text-foreground">Link de afiliado</p>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card-muted/30 px-3 py-2.5">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted" title={a.link}>{a.link}</span>
            <button
              onClick={() => copy(a.link, 'aff-link')}
              aria-label="Copiar link de afiliado"
              title="Copiar link de afiliado"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            >
              {copied === 'aff-link' ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </DrawerSection>

      {/* status + ações */}
      <DrawerSection title="Status">
        <div className="flex flex-wrap items-center gap-2.5">
          {!blocked &&
            (paused ? (
              <Button variant="outline" size="sm" onClick={onReactivate}>
                <Play className="h-4 w-4" /> Reativar
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-4 w-4" /> Pausar
              </Button>
            ))}
          {blocked ? (
            <Button variant="outline" size="sm" onClick={onUnblock}>
              <ShieldCheck className="h-4 w-4" /> Desbloquear
            </Button>
          ) : (
            <Button variant="danger" size="sm" onClick={onBlock}>
              <Ban className="h-4 w-4" /> Bloquear
            </Button>
          )}
        </div>
      </DrawerSection>

      {/* produtos vinculados */}
      <div ref={produtosRef} className="scroll-mt-4">
        <DrawerSection title={`Produtos vinculados (${a.vinculos.length})`}>
          {a.vinculos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted">
              Nenhum produto vinculado. Adicione um abaixo.
            </p>
          ) : (
            <div className="space-y-2.5">
              {a.vinculos.map((v) => (
                <VinculoRow
                  key={v.product}
                  v={v}
                  copied={copied}
                  onCopy={copy}
                  onSave={(updated) =>
                    onChangeVinculos(
                      a.vinculos.map((x) => (x.product === updated.product ? updated : x)),
                      `Comissão de “${updated.product}” ajustada`,
                    )
                  }
                  onRemove={() =>
                    onChangeVinculos(a.vinculos.filter((x) => x.product !== v.product), `Produto “${v.product}” removido`)
                  }
                />
              ))}
            </div>
          )}

          {/* vincular novo produto */}
          {available.length > 0 && (
            <div className="mt-3 rounded-2xl border border-dashed border-border p-3.5">
              <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                <PackagePlus className="h-3.5 w-3.5" /> Vincular produto
              </p>
              <div className="space-y-2.5">
                <Select value={newProduct} onChange={(e) => setNewProduct(e.target.value)}>
                  <option value="" disabled>
                    Selecione o produto
                  </option>
                  {available.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <div className="flex items-center gap-2.5">
                  <CommissionTypeToggle value={newType} onChange={setNewType} />
                  <CommissionValueInput type={newType} value={newVal} onChange={setNewVal} className="flex-1" />
                </div>
                <Button size="sm" onClick={addProduct} disabled={!newProduct || !parseCommission(newVal)} className="w-full">
                  <Plus className="h-4 w-4" /> Vincular produto
                </Button>
              </div>
            </div>
          )}
        </DrawerSection>
      </div>

      {/* histórico */}
      <DrawerSection title="Histórico de alterações">
        {a.history.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma alteração registrada.</p>
        ) : (
          <div className="space-y-2">
            {a.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card-muted/30 px-3.5 py-2.5">
                <span className="text-sm text-foreground">{h.action}</span>
                <span className="shrink-0 text-xs text-muted">{h.date}</span>
              </div>
            ))}
          </div>
        )}
      </DrawerSection>

      {/* notas internas */}
      <div ref={notasRef} className="scroll-mt-4">
        <DrawerSection title="Notas internas">
          <div className="space-y-2.5">
            <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Escreva uma nota interna sobre este afiliado..." />
            <div className="flex justify-end">
              <Button size="sm" onClick={submitNote} disabled={!noteText.trim()}>
                <StickyNote className="h-4 w-4" /> Adicionar nota
              </Button>
            </div>
          </div>

          {a.notes.length > 0 && (
            <div className="mt-3 space-y-2">
              {a.notes.map((n) => (
                <div key={n.id} className="rounded-xl border border-border bg-card-muted/30 px-3.5 py-2.5">
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="mt-1 text-xs text-muted">
                    {n.author} · {n.date}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DrawerSection>
      </div>

      {/* remover afiliado */}
      <div className="mt-6 border-t border-border pt-5">
        <Button variant="danger" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" /> Remover afiliado
        </Button>
      </div>
    </div>
  )
}

/* --------------------------- Linha de vínculo ------------------------- */

function VinculoRow({
  v,
  copied,
  onCopy,
  onSave,
  onRemove,
}: {
  v: Vinculo
  copied: string | null
  onCopy: (text: string, key: string) => void
  onSave: (updated: Vinculo) => void
  onRemove: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [type, setType] = useState<CommissionType>(v.commissionType)
  const [val, setVal] = useState('')

  function startEdit() {
    setType(v.commissionType)
    setVal(String(v.commissionValue).replace('.', ','))
    setEditing(true)
  }
  function save() {
    const num = parseCommission(val)
    if (!num || num <= 0) return
    onSave({ ...v, commissionType: type, commissionValue: num })
    setEditing(false)
  }

  return (
    <div className="rounded-2xl border border-border bg-card-muted/30 p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{v.product}</p>
          {!editing && (
            <p className="mt-0.5 text-xs text-muted">
              Comissão: <span className="font-medium text-primary">{fmtCommission(v.commissionType, v.commissionValue)}</span>
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!editing && (
            <button
              onClick={startEdit}
              aria-label="Editar comissão"
              title="Editar comissão"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onRemove}
            aria-label="Remover produto"
            title="Remover produto"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative/10 hover:text-negative"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2.5">
          <CommissionTypeToggle value={type} onChange={setType} />
          <CommissionValueInput type={type} value={val} onChange={setVal} className="min-w-[120px] flex-1" />
          <Button size="sm" onClick={save} disabled={!parseCommission(val)}>
            Salvar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancelar
          </Button>
        </div>
      )}

      {/* link individual + cupom */}
      <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 shrink-0 text-muted" />
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted" title={v.link}>{v.link}</span>
          <button
            onClick={() => onCopy(v.link, `link-${v.product}`)}
            aria-label="Copiar link"
            title="Copiar link"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
          >
            {copied === `link-${v.product}` ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Ticket className="h-3.5 w-3.5 shrink-0 text-muted" />
          {v.coupon ? (
            <>
              <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{v.coupon}</span>
              <button
                onClick={() => onCopy(v.coupon!, `coupon-${v.product}`)}
                aria-label="Copiar cupom"
                title="Copiar cupom"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
              >
                {copied === `coupon-${v.product}` ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </>
          ) : (
            <span className="flex-1 text-xs text-faint">Sem cupom</span>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================ Modal: convite ========================== */

interface InviteDraft {
  product: string
  commissionType: CommissionType
  commissionValue: string
}

function InviteModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void
  onSubmit: (payload: { name: string; email: string; vinculos: { product: string; commissionType: CommissionType; commissionValue: number }[] }) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [drafts, setDrafts] = useState<InviteDraft[]>([])

  // ESC + trava rolagem do fundo
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const main = document.querySelector('main')
    const html = document.documentElement
    const prev = { m: main?.style.overflow ?? '', h: html.style.overflow }
    if (main) main.style.overflow = 'hidden'
    html.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev.m
      html.style.overflow = prev.h
    }
  }, [onClose])

  const available = PRODUCT_POOL.filter((p) => !drafts.some((d) => d.product === p))

  function addProduct(product: string) {
    if (!product) return
    setDrafts((d) => [...d, { product, commissionType: 'percent', commissionValue: '' }])
  }
  function patchDraft(product: string, patch: Partial<InviteDraft>) {
    setDrafts((d) => d.map((x) => (x.product === product ? { ...x, ...patch } : x)))
  }
  function removeDraft(product: string) {
    setDrafts((d) => d.filter((x) => x.product !== product))
  }

  const nameValid = name.trim().length >= 2
  const emailValid = EMAIL_RE.test(email.trim())
  const draftsValid = drafts.length > 0 && drafts.every((d) => !!parseCommission(d.commissionValue) && parseCommission(d.commissionValue) > 0)
  const canSend = nameValid && emailValid && draftsValid

  function send() {
    if (!canSend) return
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      vinculos: drafts.map((d) => ({ product: d.product, commissionType: d.commissionType, commissionValue: parseCommission(d.commissionValue) })),
    })
  }

  return createPortal(
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Convidar afiliado
            </h3>
            <p className="mt-1.5 text-sm text-muted">Defina os produtos que o parceiro poderá divulgar e a comissão de cada um.</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <Field label="Nome">
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Maria Oliveira" className="pl-9" />
            </div>
          </Field>

          <Field label="E-mail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="parceiro@email.com" className="pl-9" />
            </div>
          </Field>

          {/* produtos + comissão */}
          <div>
            <p className="mb-1.5 block text-sm font-medium text-foreground">Produtos que poderá divulgar</p>
            {drafts.length > 0 && (
              <div className="mb-2.5 space-y-2.5">
                {drafts.map((d) => (
                  <div key={d.product} className="rounded-2xl border border-border bg-card-muted/30 p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-foreground">{d.product}</span>
                      <button
                        onClick={() => removeDraft(d.product)}
                        aria-label="Remover produto"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative/10 hover:text-negative"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <CommissionTypeToggle value={d.commissionType} onChange={(t) => patchDraft(d.product, { commissionType: t })} />
                      <CommissionValueInput type={d.commissionType} value={d.commissionValue} onChange={(val) => patchDraft(d.product, { commissionValue: val })} className="flex-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Select value="" onChange={(e) => addProduct(e.target.value)} disabled={available.length === 0}>
              <option value="" disabled>
                {available.length === 0 ? 'Todos os produtos adicionados' : 'Adicionar produto...'}
              </option>
              {available.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-muted">Defina o tipo (porcentagem ou valor fixo) e o valor da comissão de cada produto.</p>
          </div>

          <Field label="Mensagem (opcional)">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escreva uma mensagem para acompanhar o convite..." />
          </Field>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="text-xs text-muted">Ambiente de demonstração: o convite é simulado.</p>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={send} disabled={!canSend}>
                <Send className="h-4 w-4" /> Enviar convite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ========================== Modal: confirmação ======================== */

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return createPortal(
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
