import { useEffect, useState, type ReactNode } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Plus, Copy, Check, ExternalLink, Link2, X, type LucideIcon } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Button, Badge, Field, Input, ToggleRow } from '../components/settings/primitives'
import { cn, formatCurrency } from '../lib/utils'
import { useLinks, addLink } from '../data/linkPagamentoStore'
import { linkUrl, type PaymentLink, type LinkStatus, type LinkCobranca, type LinkFreq } from '../data/linkPagamentoData'

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

/* ----------------------------- Status badge --------------------------- */

const STATUS_TONE: Record<LinkStatus, 'success' | 'info' | 'warning' | 'neutral'> = {
  Ativo: 'success',
  Pago: 'info',
  Expirado: 'warning',
  Desativado: 'neutral',
}

/** Resumo do valor: "Valor aberto", "R$ 97,00/mês" (assinatura) ou "R$ 497,00". */
function valorLabel(l: PaymentLink): string {
  if (l.valorAberto) return 'Valor aberto'
  const base = formatCurrency(l.valor)
  if (l.cobranca === 'Assinatura') return `${base}/${l.frequencia === 'Anual' ? 'ano' : 'mês'}`
  return base
}

/* ------------------------------ Card do link -------------------------- */

function LinkCard({ l, onOpen }: { l: PaymentLink; onOpen: () => void }) {
  const { copied, copy } = useCopy()
  const url = linkUrl(l.slug)

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      <button type="button" onClick={onOpen} className="flex w-full items-start gap-4 p-4 text-left transition-colors active:bg-card-muted">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Link2 className="h-6 w-6" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-bold text-foreground">{l.titulo}</p>
            <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
          </div>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{valorLabel(l)}</span>
            <span className="text-xs text-muted">· {l.cobranca}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{l.pagamentos} pagamento(s)</p>
        </div>
      </button>

      {/* link — copiável direto do card */}
      <div className="flex items-center gap-2 border-t border-border/60 bg-card-muted/30 px-4 py-2.5">
        <Link2 className="h-4 w-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-muted">{url}</span>
        <button
          type="button"
          onClick={() => copy(url)}
          aria-label="Copiar link de pagamento"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors active:bg-card-muted"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

/* --------------------------- Sheet: detalhes -------------------------- */

function DetailSheet({ l, onClose }: { l: PaymentLink; onClose: () => void }) {
  const { copied, copy } = useCopy()
  const url = linkUrl(l.slug)
  const metodos = [
    l.metodos.pix && 'Pix',
    l.metodos.cartao && 'Cartão',
    l.metodos.boleto && 'Boleto',
  ].filter(Boolean) as string[]

  return (
    <BottomSheet title="Link de pagamento" onClose={onClose}>
      <div className="flex items-start gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Link2 className="h-7 w-7" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-bold text-foreground">{l.titulo}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{valorLabel(l)}</span>
            <Badge tone={STATUS_TONE[l.status]}>{l.status}</Badge>
          </div>
        </div>
      </div>

      {/* métricas */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          { label: 'Pagamentos', value: String(l.pagamentos) },
          { label: 'Cliques', value: String(l.cliques) },
          { label: 'Criado em', value: l.criadoEm },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border border-border bg-card-muted/30 px-3 py-3 text-center">
            <p className="truncate text-sm font-bold text-foreground">{m.value}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wide text-faint">{m.label}</p>
          </div>
        ))}
      </div>

      {/* métodos */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Formas de pagamento</p>
        <div className="flex flex-wrap gap-2">
          {metodos.map((m) => (
            <Badge key={m} tone="neutral">
              {m}
            </Badge>
          ))}
        </div>
      </div>

      {/* link */}
      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">Link de pagamento</p>
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
    </BottomSheet>
  )
}

/* ------------------------- chip selecionável -------------------------- */

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-2 text-sm font-medium transition-colors',
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-input/60 text-foreground active:bg-input',
      )}
    >
      {children}
    </button>
  )
}

/* --------------------------- Sheet: novo link ------------------------- */

function NovoLinkSheet({ onClose, onCreated }: { onClose: () => void; onCreated: (l: PaymentLink) => void }) {
  const [titulo, setTitulo] = useState('')
  const [valor, setValor] = useState('')
  const [cobranca, setCobranca] = useState<LinkCobranca>('Única')
  const [frequencia, setFrequencia] = useState<LinkFreq>('Mensal')
  const [metodos, setMetodos] = useState({ pix: true, cartao: true, boleto: false })

  const valorNum = Math.max(0, parseFloat(valor.replace(',', '.')) || 0)
  const algumMetodo = metodos.pix || metodos.cartao || metodos.boleto
  const canSave = titulo.trim().length > 0 && valorNum > 0 && algumMetodo

  function toggleMetodo(k: keyof typeof metodos) {
    setMetodos((m) => ({ ...m, [k]: !m[k] }))
  }

  function save() {
    if (!canSave) return
    const novo = addLink({
      titulo: titulo.trim(),
      valor: valorNum,
      cobranca,
      frequencia: cobranca === 'Assinatura' ? frequencia : undefined,
      metodos,
    })
    onCreated(novo)
  }

  return (
    <BottomSheet
      title="Novo link de pagamento"
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button size="md" className="flex-1" onClick={save} disabled={!canSave}>
            Criar link
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Título da cobrança">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Curso de Tráfego Pago" autoFocus />
        </Field>

        <Field label="Valor (R$)">
          <Input value={valor} onChange={(e) => setValor(e.target.value)} inputMode="decimal" placeholder="0,00" />
        </Field>

        <Field label="Cobrança">
          <div className="flex flex-wrap gap-2">
            <Chip active={cobranca === 'Única'} onClick={() => setCobranca('Única')}>
              Única
            </Chip>
            <Chip active={cobranca === 'Assinatura'} onClick={() => setCobranca('Assinatura')}>
              Assinatura
            </Chip>
          </div>
        </Field>

        {cobranca === 'Assinatura' && (
          <Field label="Frequência">
            <div className="flex flex-wrap gap-2">
              <Chip active={frequencia === 'Mensal'} onClick={() => setFrequencia('Mensal')}>
                Mensal
              </Chip>
              <Chip active={frequencia === 'Anual'} onClick={() => setFrequencia('Anual')}>
                Anual
              </Chip>
            </div>
          </Field>
        )}

        <div className="rounded-2xl border border-border px-4">
          <ToggleRow label="Pix" checked={metodos.pix} onChange={() => toggleMetodo('pix')} />
          <div className="border-t border-border/60" />
          <ToggleRow label="Cartão de crédito" description="Parcela em até 12x." checked={metodos.cartao} onChange={() => toggleMetodo('cartao')} />
          <div className="border-t border-border/60" />
          <ToggleRow label="Boleto" checked={metodos.boleto} onChange={() => toggleMetodo('boleto')} />
        </div>
        {!algumMetodo && <p className="text-xs text-negative">Selecione ao menos uma forma de pagamento.</p>}

        <p className="text-xs text-muted">O link é gerado automaticamente ao criar (pay.nummo.cloud/l/…).</p>
      </div>
    </BottomSheet>
  )
}

/* =============================== Página =============================== */

export default function LinkPagamento() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const links = useLinks()

  const [detailId, setDetailId] = useState<number | null>(null)
  const [novo, setNovo] = useState(false)

  const detail = links.find((l) => l.id === detailId) ?? null
  const ativos = links.filter((l) => l.status === 'Ativo').length

  const HeaderIcon: LucideIcon = Link2

  return (
    <>
      <Header title="Links de pagamento" subtitle="Crie e compartilhe links de cobrança." onOpenMobile={onOpenMobile} />

      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{links.length}</span> link(s) · {ativos} ativo(s)
        </p>
        <Button size="sm" onClick={() => setNovo(true)}>
          <Plus className="h-4 w-4" /> Novo link
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-card-muted text-muted">
            <HeaderIcon className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Nenhum link ainda</p>
          <p className="mt-1 max-w-xs text-sm text-muted">Crie seu primeiro link de pagamento para começar a receber.</p>
          <Button size="sm" className="mt-5" onClick={() => setNovo(true)}>
            <Plus className="h-4 w-4" /> Novo link
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((l) => (
            <LinkCard key={l.id} l={l} onOpen={() => setDetailId(l.id)} />
          ))}
        </div>
      )}

      {detail && <DetailSheet l={detail} onClose={() => setDetailId(null)} />}

      {novo && (
        <NovoLinkSheet
          onClose={() => setNovo(false)}
          onCreated={(l) => {
            setNovo(false)
            setDetailId(l.id) // abre o detalhe do link recém-criado (pronto pra copiar)
          }}
        />
      )}
    </>
  )
}
