import { useState, type ReactNode } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { Copy, Check, Info, RefreshCw, Globe, ArrowRight } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { SettingsCard, Button } from '../components/settings/primitives'
import { useDomains } from '../data/dominiosStore'
import { cn } from '../lib/utils'

/** Destino fixo do CNAME (infra da Nummo). */
const CNAME_TARGET = 'pay.nummo.cloud'

/* --------------------------- Passo numerado --------------------------- */

function Step({ n, title, description, children }: { n: number; title: string; description: string; children?: ReactNode }) {
  return (
    <div className="flex gap-4 border-t border-border py-5 first:border-t-0 first:pt-0 last:pb-0">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
        {children}
      </div>
    </div>
  )
}

/* ------------------ Linha copiável da configuração CNAME ------------------ */

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
    <div className="flex items-center justify-between gap-4 border-t border-border/60 py-3.5 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">{label}</p>
        <p className="mt-1 break-all font-mono text-sm text-foreground">{value}</p>
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

/* =============================== Página =============================== */

export default function ConfigDominio() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  const { addDominio } = useDomains()

  const [domain, setDomain] = useState('')
  const [savedDomain, setSavedDomain] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [justSaved, setJustSaved] = useState(false)

  const cleanDomain = domain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
  const previewDomain = cleanDomain || 'seudominio.com'

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(key)
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600)
  }

  function atualizar() {
    if (!cleanDomain) return
    setSavedDomain(cleanDomain)
    addDominio(cleanDomain) // manda o domínio para "Meus domínios"
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2200)
  }

  return (
    <>
      <Header
        title="Configuração de Domínio"
        subtitle="Crie um registro CNAME no seu provedor de domínio para personalizar o domínio do checkout."
        onOpenMobile={onOpenMobile}
      />

      <div className="space-y-6">
        {/* ----------------------- Passo a passo ----------------------- */}
        <SettingsCard
          title="Passo a passo"
          description="Aponte um subdomínio seu para o checkout da Nummo seguindo as etapas abaixo."
        >
          <Step
            n={1}
            title="Acesse seu provedor de DNS"
            description="Faça login no painel do seu provedor de domínio (Cloudflare, GoDaddy, Hostinger, etc.)."
          />
          <Step
            n={2}
            title="Acesse a seção DNS"
            description="No painel de controle, navegue até a seção de gerenciamento de DNS do seu domínio."
          />
          <Step
            n={3}
            title="Crie um registro CNAME"
            description='Clique em "Adicionar registro" e configure da seguinte forma:'
          >
            <div className="mt-4 rounded-2xl border border-border bg-card-muted/30 p-4 sm:p-5">
              <CnameRow label="Tipo" value="CNAME" copied={copied === 'tipo'} onCopy={() => copy('CNAME', 'tipo')} />
              <CnameRow label="Nome" value="pay" copied={copied === 'nome'} onCopy={() => copy('pay', 'nome')} />
              <CnameRow
                label="Destino"
                value={CNAME_TARGET}
                copied={copied === 'destino'}
                onCopy={() => copy(CNAME_TARGET, 'destino')}
              />
            </div>
          </Step>
          <Step
            n={4}
            title="Salve a configuração"
            description='Após preencher os campos, clique em "Salvar". A propagação do DNS pode levar alguns minutos.'
          />
        </SettingsCard>

        {/* -------------------------- Aviso ---------------------------- */}
        <div className="flex gap-3 rounded-3xl border border-primary/20 bg-primary/5 p-5">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted">
            <span className="font-semibold text-foreground">Importante:</span> após criar o registro CNAME, seu checkout
            estará acessível através de <span className="font-mono text-foreground">pay.{previewDomain}</span>. Verifique
            se as configurações de proxy do seu provedor estão corretas conforme as orientações do suporte técnico.
          </p>
        </div>

        {/* ----------------- Configurar domínio do checkout ----------------- */}
        <SettingsCard
          title="Configurar o domínio do checkout"
          description="Informe o subdomínio que você apontou no passo anterior."
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-border bg-input/60 transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
              <span className="flex shrink-0 items-center gap-1.5 border-r border-border bg-card-muted/50 px-3.5 text-sm font-medium text-muted">
                <Globe className="h-4 w-4" />
                pay.
              </span>
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && atualizar()}
                placeholder="seudominio.com"
                className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint focus:outline-none"
              />
            </div>
            <Button onClick={atualizar} disabled={!cleanDomain} className="shrink-0 sm:w-auto">
              {justSaved ? (
                <>
                  <Check className="h-4 w-4" /> Atualizado
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> Atualizar
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted">
            Seu checkout ficará em <span className="font-mono text-foreground">pay.{previewDomain}</span>
          </p>

          {savedDomain && (
            <div className={cn(
              'mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-positive/20 bg-positive/5 px-3.5 py-2.5 text-sm text-foreground transition-opacity',
            )}>
              <Check className="h-4 w-4 shrink-0 text-positive" />
              <span>
                Domínio adicionado em <span className="font-semibold">Meus domínios</span>:{' '}
                <span className="font-mono text-foreground">pay.{savedDomain}</span>
              </span>
              <Link
                to="/produto/meus-dominios"
                className="ml-auto inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Ver <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </SettingsCard>
      </div>
    </>
  )
}
