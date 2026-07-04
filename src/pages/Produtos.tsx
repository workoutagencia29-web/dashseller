import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Plus,
  Copy,
  Check,
  ExternalLink,
  Pencil,
  Trash2,
  Link2,
  GraduationCap,
  BookOpen,
  Sparkles,
  Users,
  Headphones,
  Briefcase,
  Package,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Button, Badge, Field, Input, Select, Textarea, ToggleRow } from '../components/settings/primitives'
import { cn, formatCurrency } from '../lib/utils'
import { useProdutos, addProduto, updateProduto, removeProduto, toggleProduto } from '../data/produtosStore'
import { TIPOS, checkoutUrl, slugify, type Produto, type ProdutoTipo } from '../data/produtosData'

/* -------------------- Ícone/cor por tipo de produto ------------------- */

const TIPO_META: Record<ProdutoTipo, { icon: LucideIcon; wrap: string }> = {
  Curso: { icon: GraduationCap, wrap: 'bg-sky-500/15 text-sky-400' },
  Ebook: { icon: BookOpen, wrap: 'bg-violet-500/15 text-violet-400' },
  Mentoria: { icon: Sparkles, wrap: 'bg-primary/15 text-primary' },
  Comunidade: { icon: Users, wrap: 'bg-emerald-500/15 text-emerald-400' },
  Consultoria: { icon: Headphones, wrap: 'bg-chart-yellow/15 text-chart-yellow' },
  Serviço: { icon: Briefcase, wrap: 'bg-rose-500/15 text-rose-400' },
  Outro: { icon: Package, wrap: 'bg-card-muted text-muted' },
}

/* --------------------------- copiar p/ clipboard ---------------------- */

function useCopy() {
  const [copied, setCopied] = useState(false)
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return { copied, copy }
}

/* ------------------------------ Bottom sheet -------------------------- */

function BottomSheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const main = document.querySelector('main')
    const prev = main?.style.overflow
    if (main) main.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev ?? ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="scrollbar-thin relative z-10 max-h-[88vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card px-5 pt-3 animate-fade-in"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.25rem)' }}
      >
        <div className="sticky top-0 z-10 -mx-5 mb-1 bg-card px-5 pb-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="py-1">{children}</div>

        {footer && <div className="mt-5 flex gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ----------------------------- Status pill ---------------------------- */

function StatusPill({ ativo }: { ativo: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-card-muted text-muted',
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', ativo ? 'bg-emerald-400' : 'bg-faint')} />
      {ativo ? 'Ativo' : 'Pausado'}
    </span>
  )
}

/* ------------------------------ Card do produto ----------------------- */

function ProdutoCard({ p, onOpen }: { p: Produto; onOpen: () => void }) {
  const { icon: Icon, wrap } = TIPO_META[p.tipo]
  const { copied, copy } = useCopy()
  const url = checkoutUrl(p.slug)

  return (
    <div className={cn('overflow-hidden rounded-3xl border bg-card transition-colors', p.ativo ? 'border-border' : 'border-border opacity-75')}>
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-4 p-4 text-left transition-colors active:bg-card-muted">
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', wrap)}>
          <Icon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-bold text-foreground">{p.nome}</p>
            <StatusPill ativo={p.ativo} />
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone="info">{p.tipo}</Badge>
            <span className="text-xs text-muted">{p.vendas} vendas</span>
          </div>
          <p className="mt-2 text-lg font-bold tracking-tight text-foreground">{formatCurrency(p.preco)}</p>
        </div>
      </button>

      {/* link do checkout — copiável direto do card */}
      <div className="flex items-center gap-2 border-t border-border/60 bg-card-muted/30 px-4 py-2.5">
        <Link2 className="h-4 w-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted">{url}</span>
        <button
          type="button"
          onClick={() => copy(url)}
          aria-label="Copiar link do checkout"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors active:bg-card-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

/* -------------------------- Sheet: gerenciar -------------------------- */

function ManageSheet({ p, onClose, onEdit, onDelete }: { p: Produto; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const { icon: Icon, wrap } = TIPO_META[p.tipo]
  const { copied, copy } = useCopy()
  const url = checkoutUrl(p.slug)

  return (
    <BottomSheet title="Produto" onClose={onClose}>
      {/* identidade */}
      <div className="flex items-start gap-4">
        <span className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', wrap)}>
          <Icon className="h-7 w-7" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground">{p.nome}</p>
          {p.descricao && <p className="mt-0.5 text-sm text-muted">{p.descricao}</p>}
          <div className="mt-2 flex items-center gap-2">
            <Badge tone="info">{p.tipo}</Badge>
            <StatusPill ativo={p.ativo} />
          </div>
        </div>
      </div>

      {/* métricas */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Preço', value: formatCurrency(p.preco) },
          { label: 'Vendas', value: String(p.vendas) },
          { label: 'Criado em', value: p.criadoEm },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card-muted/30 px-3 py-3 text-center">
            <p className="truncate text-sm font-bold text-foreground">{m.value}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-faint">{m.label}</p>
          </div>
        ))}
      </div>

      {/* link do checkout */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Link do checkout</p>
        <div className="rounded-2xl border border-border bg-card-muted/30 p-4">
          <p className="break-all font-mono text-sm text-foreground">{url}</p>
          <div className="mt-3 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => copy(url)} className="flex-1">
              {copied ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copiado' : 'Copiar link'}
            </Button>
            <a href={`https://${url}`} target="_blank" rel="noopener noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <ExternalLink className="h-3.5 w-3.5" /> Abrir
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* ativar/pausar */}
      <div className="mt-3 rounded-2xl border border-border px-4">
        <ToggleRow
          label={p.ativo ? 'Produto ativo' : 'Produto pausado'}
          description={p.ativo ? 'O checkout está respondendo.' : 'O checkout está desativado.'}
          checked={p.ativo}
          onChange={() => toggleProduto(p.id)}
        />
      </div>

      {/* ações */}
      <div className="mt-5 flex gap-3">
        <Button variant="outline" size="md" onClick={onEdit} className="flex-1">
          <Pencil className="h-4 w-4" /> Editar
        </Button>
        <Button variant="danger" size="md" onClick={onDelete} className="flex-1">
          <Trash2 className="h-4 w-4" /> Excluir
        </Button>
      </div>
    </BottomSheet>
  )
}

/* --------------------------- Sheet: formulário ------------------------ */

function FormSheet({ produto, onClose }: { produto: Produto | 'new'; onClose: () => void }) {
  const editing = produto !== 'new'
  const base = editing ? produto : null
  const [nome, setNome] = useState(base?.nome ?? '')
  const [preco, setPreco] = useState(base ? String(base.preco) : '')
  const [tipo, setTipo] = useState<ProdutoTipo>(base?.tipo ?? 'Curso')
  const [descricao, setDescricao] = useState(base?.descricao ?? '')

  const slug = useMemo(() => slugify(nome) || 'meu-produto', [nome])
  const precoNum = Math.max(0, parseFloat(preco.replace(',', '.')) || 0)
  const canSave = nome.trim().length > 0

  function save() {
    if (!canSave) return
    if (editing) {
      updateProduto(base!.id, { nome: nome.trim(), descricao: descricao.trim(), preco: precoNum, tipo, slug })
    } else {
      addProduto({ nome: nome.trim(), descricao: descricao.trim(), preco: precoNum, tipo, slug, ativo: true })
    }
    onClose()
  }

  return (
    <BottomSheet
      title={editing ? 'Editar produto' : 'Novo produto'}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="md" className="flex-1" onClick={save} disabled={!canSave}>
            {editing ? 'Salvar' : 'Criar produto'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome do produto">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Mentoria Premium" autoFocus />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (R$)">
            <Input value={preco} onChange={(e) => setPreco(e.target.value)} inputMode="decimal" placeholder="0,00" />
          </Field>
          <Field label="Tipo">
            <Select value={tipo} onChange={(e) => setTipo(e.target.value as ProdutoTipo)}>
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Descrição" hint="Aparece no checkout (opcional).">
          <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Uma linha curta sobre o produto." />
        </Field>

        <Field label="Link do checkout">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card-muted/30 px-3.5 py-2.5">
            <Link2 className="h-4 w-4 shrink-0 text-muted" />
            <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted">{checkoutUrl(slug)}</span>
          </div>
        </Field>
      </div>
    </BottomSheet>
  )
}

/* ----------------------------- Confirmação --------------------------- */

function ConfirmDialog({ title, message, onConfirm, onCancel }: { title: string; message: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* =============================== Página =============================== */

export default function Produtos() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const produtos = useProdutos()

  const [manageId, setManageId] = useState<number | null>(null)
  const [form, setForm] = useState<Produto | 'new' | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const manage = produtos.find((p) => p.id === manageId) ?? null
  const deleting = produtos.find((p) => p.id === confirmId) ?? null
  const ativos = produtos.filter((p) => p.ativo).length

  return (
    <>
      <Header title="Produtos" subtitle="Gerencie seus produtos e links de checkout." onOpenMobile={onOpenMobile} />

      {/* resumo + novo produto */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{produtos.length}</span> produto(s) · {ativos} ativo(s)
        </p>
        <Button size="sm" onClick={() => setForm('new')}>
          <Plus className="h-4 w-4" /> Novo produto
        </Button>
      </div>

      {produtos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-muted text-muted">
            <Package className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Nenhum produto ainda</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Crie seu primeiro produto para gerar um link de checkout.</p>
          <Button size="sm" className="mt-5" onClick={() => setForm('new')}>
            <Plus className="h-4 w-4" /> Novo produto
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {produtos.map((p) => (
            <ProdutoCard key={p.id} p={p} onOpen={() => setManageId(p.id)} />
          ))}
        </div>
      )}

      {/* gerenciar */}
      {manage && (
        <ManageSheet
          p={manage}
          onClose={() => setManageId(null)}
          onEdit={() => {
            setForm(manage)
            setManageId(null)
          }}
          onDelete={() => {
            setConfirmId(manage.id)
            setManageId(null)
          }}
        />
      )}

      {/* criar / editar */}
      {form && <FormSheet produto={form} onClose={() => setForm(null)} />}

      {/* confirmação de exclusão */}
      {deleting && (
        <ConfirmDialog
          title="Excluir produto"
          message={`Tem certeza que deseja excluir "${deleting.nome}"? O link do checkout deixará de funcionar.`}
          onConfirm={() => {
            removeProduto(deleting.id)
            setConfirmId(null)
          }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </>
  )
}
