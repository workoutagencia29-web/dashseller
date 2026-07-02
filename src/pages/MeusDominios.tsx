import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import {
  Globe,
  Plus,
  Star,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  Info,
  Settings2,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Button, Field, Badge } from '../components/settings/primitives'
import { Drawer, DrawerSection, DetailRow } from '../components/reports/reportsPrimitives'
import { cn } from '../lib/utils'
import {
  dominiosSeed,
  CNAME_TARGET,
  NEXT_DOMINIO_ID,
  formatDominioDate,
  type Dominio,
  type DominioStatus,
} from '../data/dominiosData'

/* ---------------------------- Status badge ---------------------------- */

const STATUS_META: Record<DominioStatus, { tone: 'success' | 'warning' | 'danger'; icon: LucideIcon; hint: string }> = {
  Ativo: { tone: 'success', icon: CheckCircle2, hint: 'DNS propagado. O checkout já responde neste domínio.' },
  Verificando: { tone: 'warning', icon: Loader2, hint: 'Aguardando a propagação do CNAME. Pode levar alguns minutos.' },
  Erro: { tone: 'danger', icon: AlertTriangle, hint: 'Não encontramos o registro CNAME. Confira a configuração no seu provedor.' },
}

function DomStatusBadge({ status }: { status: DominioStatus }) {
  const { tone, icon: Icon } = STATUS_META[status]
  return (
    <Badge tone={tone}>
      <Icon className={cn('h-3 w-3', status === 'Verificando' && 'animate-spin')} />
      {status}
    </Badge>
  )
}

/* =============================== Página =============================== */

export default function MeusDominios() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [dominios, setDominios] = useState<Dominio[]>(dominiosSeed)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const selected = dominios.find((d) => d.id === selectedId) ?? null
  const deleting = dominios.find((d) => d.id === confirmDeleteId) ?? null

  function setPrimary(id: number) {
    setDominios((list) => list.map((d) => ({ ...d, primary: d.id === id })))
  }

  /** Simula a reverificação do DNS: entra em "Verificando" e volta "Ativo". */
  function reverificar(id: number) {
    setDominios((list) => list.map((d) => (d.id === id ? { ...d, status: 'Verificando' } : d)))
    setTimeout(() => {
      setDominios((list) => list.map((d) => (d.id === id ? { ...d, status: 'Ativo' } : d)))
    }, 1800)
  }

  function removeDominio(id: number) {
    setDominios((list) => list.filter((d) => d.id !== id))
    setConfirmDeleteId(null)
    if (selectedId === id) setSelectedId(null)
  }

  function addDominio(domain: string) {
    const novo: Dominio = {
      id: NEXT_DOMINIO_ID + dominios.length,
      domain,
      status: 'Verificando',
      primary: dominios.length === 0,
      addedAt: formatDominioDate(new Date()),
    }
    setDominios((list) => [novo, ...list])
    setAddOpen(false)
    // simula a propagação do DNS do domínio recém-adicionado
    setTimeout(() => {
      setDominios((list) => list.map((d) => (d.id === novo.id ? { ...d, status: 'Ativo' } : d)))
    }, 2200)
  }

  return (
    <>
      <Header
        title="Meus domínios"
        subtitle="Gerencie os domínios de checkout apontados para a Nummo."
        onOpenMobile={onOpenMobile}
      />

      {/* barra de ação */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {dominios.length} {dominios.length === 1 ? 'domínio conectado' : 'domínios conectados'}
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar domínio
        </Button>
      </div>

      {/* lista de domínios */}
      {dominios.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-muted text-muted">
            <Globe className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Nenhum domínio conectado</p>
          <p className="mt-1 max-w-xs text-sm text-muted">
            Adicione um domínio próprio para personalizar o endereço do seu checkout.
          </p>
          <Button onClick={() => setAddOpen(true)} className="mt-5">
            <Plus className="h-4 w-4" />
            Adicionar domínio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {dominios.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Globe className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-mono text-sm font-semibold text-foreground">pay.{d.domain}</p>
                    {d.primary && (
                      <Badge tone="info">
                        <Star className="h-3 w-3 fill-current" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <DomStatusBadge status={d.status} />
                    <span className="text-xs text-muted">Adicionado em {d.addedAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!d.primary && (
                  <Button variant="outline" size="sm" onClick={() => setPrimary(d.id)}>
                    <Star className="h-3.5 w-3.5" />
                    Tornar principal
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedId(d.id)}>
                  <Settings2 className="h-3.5 w-3.5" />
                  Gerenciar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* drawer de gerenciamento */}
      <Drawer open={!!selected} title="Gerenciar domínio" onClose={() => setSelectedId(null)} widthClass="max-w-lg">
        {selected && (
          <DominioDrawerBody
            d={selected}
            onReverificar={() => reverificar(selected.id)}
            onSetPrimary={() => setPrimary(selected.id)}
            onDelete={() => setConfirmDeleteId(selected.id)}
          />
        )}
      </Drawer>

      {/* modal de adicionar */}
      {addOpen && (
        <AddDomainModal
          existing={dominios.map((d) => d.domain)}
          onClose={() => setAddOpen(false)}
          onAdd={addDominio}
        />
      )}

      {/* confirmação de exclusão */}
      {deleting && (
        <ConfirmDialog
          title="Excluir domínio"
          message={`Tem certeza que deseja remover pay.${deleting.domain}? O checkout deixará de responder neste endereço.`}
          confirmLabel="Excluir"
          onConfirm={() => removeDominio(deleting.id)}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </>
  )
}

/* ========================= Drawer: corpo ============================== */

function DominioDrawerBody({
  d,
  onReverificar,
  onSetPrimary,
  onDelete,
}: {
  d: Dominio
  onReverificar: () => void
  onSetPrimary: () => void
  onDelete: () => void
}) {
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  return (
    <div>
      {/* identidade */}
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Globe className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-mono text-sm font-semibold text-foreground">pay.{d.domain}</p>
            {d.primary && (
              <Badge tone="info">
                <Star className="h-3 w-3 fill-current" />
                Principal
              </Badge>
            )}
          </div>
          <div className="mt-2">
            <DomStatusBadge status={d.status} />
          </div>
        </div>
      </div>

      {/* status */}
      <DrawerSection title="Status do DNS">
        <div
          className={cn(
            'flex gap-3 rounded-2xl border p-4',
            d.status === 'Ativo' && 'border-positive/20 bg-positive/5',
            d.status === 'Verificando' && 'border-chart-yellow/20 bg-chart-yellow/5',
            d.status === 'Erro' && 'border-negative/20 bg-negative/5',
          )}
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          <p className="text-sm leading-relaxed text-muted">{STATUS_META[d.status].hint}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onReverificar} className="mt-3" disabled={d.status === 'Verificando'}>
          <RefreshCw className={cn('h-3.5 w-3.5', d.status === 'Verificando' && 'animate-spin')} />
          {d.status === 'Verificando' ? 'Verificando…' : 'Reverificar DNS'}
        </Button>
      </DrawerSection>

      {/* endereço */}
      <DrawerSection title="Endereço do checkout">
        <DetailRow label="Domínio" value={<span className="font-mono">pay.{d.domain}</span>} />
        <DetailRow label="Adicionado em" value={d.addedAt} />
      </DrawerSection>

      {/* registro CNAME */}
      <DrawerSection title="Registro CNAME">
        <p className="mb-3 text-sm text-muted">
          Confira se o registro abaixo está configurado no seu provedor de DNS.
        </p>
        <div className="rounded-2xl border border-border bg-card-muted/30 p-4">
          <CnameRow label="Tipo" value="CNAME" copied={copied === 'tipo'} onCopy={() => copy('CNAME', 'tipo')} />
          <CnameRow label="Nome" value="pay" copied={copied === 'nome'} onCopy={() => copy('pay', 'nome')} />
          <CnameRow label="Destino" value={CNAME_TARGET} copied={copied === 'destino'} onCopy={() => copy(CNAME_TARGET, 'destino')} />
        </div>
      </DrawerSection>

      {/* ações */}
      <DrawerSection title="Ações">
        <div className="space-y-2.5">
          {!d.primary && (
            <button
              onClick={onSetPrimary}
              className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-card-muted"
            >
              <Star className="h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Definir como principal</p>
                <p className="mt-0.5 text-xs text-muted">Usar este domínio como endereço padrão do checkout.</p>
              </div>
            </button>
          )}
          <button
            onClick={onDelete}
            className="flex w-full items-center gap-3 rounded-2xl border border-negative/20 p-4 text-left transition-colors hover:bg-negative/10"
          >
            <Trash2 className="h-4 w-4 shrink-0 text-negative" />
            <div>
              <p className="text-sm font-semibold text-negative">Excluir domínio</p>
              <p className="mt-0.5 text-xs text-muted">Remove o domínio e desativa o checkout neste endereço.</p>
            </div>
          </button>
        </div>
      </DrawerSection>
    </div>
  )
}

/* ---------------------- Linha copiável do CNAME ----------------------- */

function CnameRow({
  label,
  value,
  copied,
  onCopy,
}: {
  label: string
  value: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border/60 py-3 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-0.5 break-all font-mono text-sm text-foreground">{value}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onCopy} className="shrink-0">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-positive" /> Copiado
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copiar
          </>
        )}
      </Button>
    </div>
  )
}

/* ========================= Modal: adicionar ========================== */

function AddDomainModal({
  existing,
  onClose,
  onAdd,
}: {
  existing: string[]
  onClose: () => void
  onAdd: (domain: string) => void
}) {
  const [value, setValue] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const clean = value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/^pay\./, '').replace(/\/.*$/, '')
  const duplicate = clean !== '' && existing.includes(clean)
  const valid = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(clean) && !duplicate

  function submit() {
    if (!valid) return
    onAdd(clean)
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl animate-fade-in sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Adicionar domínio
            </h3>
            <p className="mt-1.5 text-sm text-muted">Informe o domínio que você apontou para a Nummo via CNAME.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Field label="Domínio">
          <div className="flex items-stretch overflow-hidden rounded-xl border border-border bg-input/60 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
            <span className="flex shrink-0 items-center gap-1.5 border-r border-border bg-card-muted/50 px-3.5 text-sm font-medium text-muted">
              <Globe className="h-4 w-4" />
              pay.
            </span>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="seudominio.com"
              className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint focus:outline-none"
            />
          </div>
        </Field>

        {duplicate ? (
          <p className="mt-2 text-xs text-negative">Este domínio já está na sua lista.</p>
        ) : (
          <p className="mt-2 text-xs text-muted">
            Seu checkout ficará em <span className="font-mono text-foreground">pay.{clean || 'seudominio.com'}</span>
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={submit} disabled={!valid}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ========================= Confirmação ============================== */

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
