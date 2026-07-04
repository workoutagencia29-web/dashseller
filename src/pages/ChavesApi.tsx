import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { KeyRound, Copy, Check, Eye, EyeOff, RefreshCw, AlertTriangle, X } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { SettingsCard, Button, Badge } from '../components/settings/primitives'
import { cn } from '../lib/utils'

/* ---------------------------- Mock de chaves --------------------------- */
/* Front-end apenas — o dev integra a geração/rotação real no backend.     */

type Env = 'test' | 'live'

interface KeyPair {
  pk: string
  sk: string
  createdAt: string
}

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const hoje = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const ALFA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
function randKey(prefix: string) {
  let s = ''
  for (let i = 0; i < 24; i++) s += ALFA[Math.floor(Math.random() * ALFA.length)]
  return `${prefix}${s}`
}

const INITIAL: Record<Env, KeyPair> = {
  // valores fake só para exibição (sem backend); prefixos com "EXEMPLO" p/ não parecerem chaves reais
  test: { pk: 'pk_test_EXEMPLO_CHAVE_FICTICIA_TESTE', sk: 'sk_test_EXEMPLO_CHAVE_FICTICIA_TESTE', createdAt: '12 mar 2026' },
  live: { pk: 'pk_live_EXEMPLO_CHAVE_FICTICIA_PROD', sk: 'sk_live_EXEMPLO_CHAVE_FICTICIA_PROD', createdAt: '04 fev 2026' },
}

/** Máscara: mantém o prefixo (pk_test_/sk_live_…) e esconde o resto. */
const mask = (key: string) => {
  const i = key.indexOf('_', key.indexOf('_') + 1) // 2º underscore
  const prefix = i >= 0 ? key.slice(0, i + 1) : key.slice(0, 8)
  return prefix + '•'.repeat(Math.max(0, key.length - prefix.length))
}

/* ------------------------------ Linha da chave ------------------------- */

function KeyField({
  label,
  badge,
  value,
  secret = false,
  revealed,
  onToggleReveal,
  copied,
  onCopy,
}: {
  label: string
  badge: string
  value: string
  secret?: boolean
  revealed?: boolean
  onToggleReveal?: () => void
  copied: boolean
  onCopy: () => void
}) {
  const shown = secret && !revealed ? mask(value) : value
  return (
    <div className="rounded-2xl border border-border bg-card-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <Badge tone={secret ? 'warning' : 'info'}>{badge}</Badge>
      </div>
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl border border-border bg-input/60 px-3.5 py-2.5">
          <span className="whitespace-nowrap font-mono text-sm text-foreground">{shown}</span>
        </div>
        {secret && (
          <Button variant="outline" size="sm" onClick={onToggleReveal} className="shrink-0" aria-label={revealed ? 'Ocultar' : 'Revelar'}>
            {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {/* texto só no desktop; no mobile fica só o ícone */}
            <span className="hidden lg:inline">{revealed ? 'Ocultar' : 'Revelar'}</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onCopy} className="shrink-0" aria-label={copied ? 'Copiado' : 'Copiar'}>
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-positive" />
              <span className="hidden lg:inline">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">Copiar</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

/* =============================== Página =============================== */

export default function ChavesApi() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [env, setEnv] = useState<Env>('test')
  const [keys, setKeys] = useState<Record<Env, KeyPair>>(INITIAL)
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmRegen, setConfirmRegen] = useState(false)

  const current = keys[env]

  function switchEnv(next: Env) {
    setEnv(next)
    setRevealed(false)
  }

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  function regenerate() {
    setKeys((k) => ({
      ...k,
      [env]: {
        pk: randKey(env === 'test' ? 'pk_test_' : 'pk_live_'),
        sk: randKey(env === 'test' ? 'sk_test_' : 'sk_live_'),
        createdAt: hoje(),
      },
    }))
    setRevealed(false)
    setConfirmRegen(false)
  }

  return (
    <>
      <Header
        title="Chaves de API"
        subtitle="Credenciais para autenticar suas requisições à API da Nummo."
        onOpenMobile={onOpenMobile}
      />

      <SettingsCard
        title="Chaves de API"
        description="Use a chave pública no checkout e a secreta no seu backend."
        action={
          <div className="inline-flex rounded-xl border border-border bg-card-muted/40 p-1 text-sm">
            {(['test', 'live'] as const).map((e) => (
              <button
                key={e}
                onClick={() => switchEnv(e)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-medium transition-colors',
                  env === e ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
                )}
              >
                {e === 'test' ? 'Teste' : 'Produção'}
              </button>
            ))}
          </div>
        }
      >
        {/* aviso de segurança */}
        <div className="flex gap-3 rounded-2xl border border-chart-yellow/20 bg-chart-yellow/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-yellow" />
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-semibold text-foreground">Mantenha sua chave secreta em segurança.</span> Use apenas no
            backend — nunca a exponha no front-end.
          </p>
        </div>

        {/* chaves */}
        <div className="mt-5 space-y-4">
          <KeyField
            label="Chave pública"
            badge="Publishable"
            value={current.pk}
            copied={copied === 'pk'}
            onCopy={() => copy(current.pk, 'pk')}
          />
          <KeyField
            label="Chave secreta"
            badge="Secret"
            value={current.sk}
            secret
            revealed={revealed}
            onToggleReveal={() => setRevealed((r) => !r)}
            copied={copied === 'sk'}
            onCopy={() => copy(current.sk, 'sk')}
          />
        </div>

        {/* regenerar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-sm text-muted">
            Criadas em <span className="font-medium text-foreground">{current.createdAt}</span> · Regenerar invalida o par
            atual imediatamente.
          </p>
          <Button variant="outline" size="sm" onClick={() => setConfirmRegen(true)} className="shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Regenerar chaves
          </Button>
        </div>
      </SettingsCard>

      {confirmRegen && (
        <ConfirmDialog
          title={`Regenerar chaves de ${env === 'test' ? 'Teste' : 'Produção'}?`}
          message="As chaves atuais deixarão de funcionar imediatamente. Atualize suas integrações com o novo par."
          confirmLabel="Regenerar"
          onConfirm={regenerate}
          onCancel={() => setConfirmRegen(false)}
        />
      )}
    </>
  )
}

/* ============================ Confirmação ============================= */

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
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chart-yellow/15 text-chart-yellow">
              <KeyRound className="h-4 w-4" />
            </span>
            {title}
          </h3>
          <button onClick={onCancel} className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-muted">{message}</p>
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
