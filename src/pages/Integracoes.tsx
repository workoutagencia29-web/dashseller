import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Check, Copy, Plug, Star, Settings2, SearchX } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Button, Field, Input, Badge, ToggleRow } from '../components/settings/primitives'
import { SearchInput, MultiSelect, Drawer, DrawerSection } from '../components/reports/reportsPrimitives'
import { cn } from '../lib/utils'
import { PRODUTOS } from '../data/linkPagamentoData'
import {
  integracoes as SEED,
  CATEGORIAS,
  categoriaMeta,
  initials,
  EVENTOS_VENDA,
  EVENTOS_PIXEL,
  type Integracao,
} from '../data/integracoesData'

const PRODUTO_OPTIONS = PRODUTOS.map((p) => p.nome)
type StatusFiltro = 'Todas' | 'Conectado' | 'Disponível'

/* ------------------------------ Tile do logo -------------------------- */

function LogoTile({ app, size = 'md' }: { app: Integracao; size?: 'sm' | 'md' }) {
  const meta = categoriaMeta(app.categoria)
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-xl font-bold',
        size === 'md' ? 'h-11 w-11 text-sm' : 'h-9 w-9 text-xs',
        meta.tile,
      )}
    >
      {initials(app.nome)}
    </span>
  )
}

/* ------------------------------- Card --------------------------------- */

function IntegracaoCard({ app, onOpen }: { app: Integracao; onOpen: () => void }) {
  const meta = categoriaMeta(app.categoria)
  const conectado = app.status === 'Conectado'
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/40 hover:bg-card-muted/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex items-start gap-3">
        <LogoTile app={app} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">{app.nome}</p>
            {app.popular && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-chart-yellow/15 px-2 py-0.5 text-[11px] font-semibold text-chart-yellow">
                <Star className="h-3 w-3" strokeWidth={2.5} /> Popular
              </span>
            )}
          </div>
          <span className={cn('mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', meta.pill)}>
            {app.categoria}
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted">{app.descricao}</p>

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/60 pt-3.5">
        {conectado ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Conectado
          </span>
        ) : (
          <span className="text-xs text-faint">Disponível</span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors',
            conectado ? 'text-muted group-hover:text-foreground' : 'bg-primary/10 text-primary group-hover:bg-primary/15',
          )}
        >
          {conectado ? (
            <>
              <Settings2 className="h-3.5 w-3.5" /> Gerenciar
            </>
          ) : (
            <>
              <Plug className="h-3.5 w-3.5" /> Conectar
            </>
          )}
        </span>
      </div>
    </button>
  )
}

/* ------------------------------ Drawer -------------------------------- */

function IntegracaoDrawer({
  app,
  onClose,
  onConnect,
  onDisconnect,
  onSave,
}: {
  app: Integracao
  onClose: () => void
  onConnect: (id: string) => void
  onDisconnect: (id: string) => void
  onSave: () => void
}) {
  const meta = categoriaMeta(app.categoria)
  const conectado = app.status === 'Conectado'
  const isPixel = app.conexao === 'pixel'
  const eventOptions = isPixel ? EVENTOS_PIXEL : EVENTOS_VENDA

  const [ativo, setAtivo] = useState(true)
  const [chave, setChave] = useState('')
  const [extra, setExtra] = useState('')
  const [pixelId, setPixelId] = useState('')
  const [capi, setCapi] = useState(false)
  const [produtos, setProdutos] = useState<string[]>([])
  const [eventos, setEventos] = useState<string[]>(eventOptions)
  const [copied, setCopied] = useState(false)

  const webhookUrl = `https://api.nummo.cloud/hooks/${app.id}`

  // credencial mínima p/ habilitar "Conectar" (oauth/webhook não exigem campo)
  const credOk =
    app.conexao === 'pixel'
      ? pixelId.trim() !== ''
      : app.conexao === 'apiKey' || app.conexao === 'token'
        ? chave.trim() !== ''
        : true

  function toggleEvento(ev: string) {
    setEventos((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]))
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(webhookUrl)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const footer = conectado ? (
    <div className="flex items-center justify-between gap-2">
      <Button variant="danger" size="sm" onClick={() => onDisconnect(app.id)}>
        Desconectar
      </Button>
      <Button size="sm" onClick={onSave}>
        Salvar alterações
      </Button>
    </div>
  ) : (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={onClose}>
        Cancelar
      </Button>
      <Button size="sm" onClick={() => onConnect(app.id)} disabled={!credOk}>
        <Plug className="h-3.5 w-3.5" /> Conectar
      </Button>
    </div>
  )

  return (
    <Drawer open title={app.nome} onClose={onClose} widthClass="max-w-md" footer={footer}>
      {/* cabeçalho */}
      <div className="mb-5 flex items-center gap-3">
        <LogoTile app={app} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">{app.nome}</p>
          <span className={cn('mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium', meta.pill)}>
            {app.categoria}
          </span>
        </div>
        <span className="ml-auto shrink-0">
          <Badge tone={conectado ? 'success' : 'neutral'}>{app.status}</Badge>
        </span>
      </div>

      <p className="mb-6 text-sm text-muted">{app.descricao}</p>

      {conectado && (
        <div className="mb-6 rounded-2xl border border-border bg-card-muted/30 px-4">
          <ToggleRow label="Integração ativa" description="Pause os disparos sem desconectar." checked={ativo} onChange={setAtivo} />
        </div>
      )}

      <DrawerSection title="Conexão">
        {app.conexao === 'oauth' ? (
          <div className="rounded-2xl border border-border bg-card-muted/30 p-4 text-sm text-muted">
            Você será redirecionado para autorizar a Nummo na sua conta {app.nome}.
            {conectado && app.conta && (
              <>
                {' '}
                Conta atual: <span className="font-medium text-foreground">{app.conta}</span>.
              </>
            )}
          </div>
        ) : app.conexao === 'webhook' ? (
          <Field label="URL de webhook da Nummo" hint={`Cole esta URL no ${app.nome} para receber os eventos.`}>
            <div className="flex items-stretch gap-2">
              <div className="flex min-w-0 flex-1 items-center overflow-x-auto rounded-xl border border-border bg-input/60 px-3.5 py-2.5">
                <span className="whitespace-nowrap font-mono text-sm text-foreground">{webhookUrl}</span>
              </div>
              <Button variant="outline" size="sm" onClick={copy} className="shrink-0">
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
          </Field>
        ) : isPixel ? (
          <div className="space-y-4">
            <Field label="ID do Pixel" hint="Encontre no gerenciador de anúncios da plataforma.">
              <Input value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder={conectado && app.conta ? app.conta : 'ex.: 812345678901234'} />
            </Field>
            <div className="rounded-2xl border border-border bg-card-muted/30 px-4">
              <ToggleRow label="API de Conversões" description="Enviar eventos server-side (mais precisão)." checked={capi} onChange={setCapi} />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label={app.conexao === 'token' ? 'Token de acesso' : 'Chave de API'} hint="Gerada no painel da ferramenta, nas configurações de API.">
              <Input value={chave} onChange={(e) => setChave(e.target.value)} placeholder={conectado ? '•••••••••••••• (conectado)' : 'cole sua chave aqui'} />
            </Field>
            {app.campoExtra && (
              <Field label={app.campoExtra}>
                <Input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="https://sua-conta.exemplo.com" />
              </Field>
            )}
          </div>
        )}
      </DrawerSection>

      <DrawerSection title="Disparos">
        <div className="space-y-4">
          <Field label="Produtos" hint="Deixe vazio para aplicar a todos os produtos.">
            <MultiSelect label="Todos os produtos" options={PRODUTO_OPTIONS} selected={produtos} onChange={setProdutos} />
          </Field>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">{isPixel ? 'Eventos rastreados' : 'Eventos enviados'}</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {eventOptions.map((ev) => {
                const on = eventos.includes(ev)
                return (
                  <button
                    key={ev}
                    type="button"
                    onClick={() => toggleEvento(ev)}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                      on ? 'border-primary/50 bg-primary/5 text-foreground' : 'border-border bg-input/40 text-muted hover:text-foreground',
                    )}
                  >
                    {ev}
                    <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </DrawerSection>
    </Drawer>
  )
}

/* =============================== Página =============================== */

export default function Integracoes() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [apps, setApps] = useState<Integracao[]>(SEED)
  const [search, setSearch] = useState('')
  const [catF, setCatF] = useState<string[]>([])
  const [statusF, setStatusF] = useState<StatusFiltro>('Todas')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const selected = apps.find((a) => a.id === selectedId) ?? null
  const conectadas = apps.filter((a) => a.status === 'Conectado').length
  const disponiveis = apps.length - conectadas

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200)
  }

  // handlers mock — o dev pluga a conexão real (OAuth/API/webhook) aqui
  function connect(id: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Conectado' } : a)))
    setSelectedId(null)
    flash('Integração conectada ✓')
  }
  function disconnect(id: string) {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Disponível' } : a)))
    setSelectedId(null)
    flash('Integração desconectada')
  }
  function save() {
    setSelectedId(null)
    flash('Alterações salvas ✓')
  }

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = apps.filter(
      (a) =>
        (q === '' || a.nome.toLowerCase().includes(q) || a.categoria.toLowerCase().includes(q)) &&
        (catF.length === 0 || catF.includes(a.categoria)) &&
        (statusF === 'Todas' || a.status === statusF),
    )
    return CATEGORIAS.map((c) => ({ meta: c, items: filtered.filter((a) => a.categoria === c.nome) })).filter((g) => g.items.length > 0)
  }, [apps, search, catF, statusF])

  const STATUS_TABS: { label: string; value: StatusFiltro; n?: number }[] = [
    { label: 'Todas', value: 'Todas' },
    { label: 'Conectadas', value: 'Conectado', n: conectadas },
    { label: 'Disponíveis', value: 'Disponível', n: disponiveis },
  ]

  return (
    <>
      <Header
        title="Integrações"
        subtitle="Conecte a Nummo às ferramentas que você já usa — sem sair do painel."
        onOpenMobile={onOpenMobile}
      />

      {/* controles */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar integração..." />
          <MultiSelect label="Categoria" options={CATEGORIAS.map((c) => c.nome)} selected={catF} onChange={setCatF} />
        </div>
        <div className="inline-flex shrink-0 rounded-xl border border-border bg-card-muted/40 p-1 text-sm">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusF(t.value)}
              className={cn(
                'rounded-lg px-3.5 py-1.5 font-medium transition-colors',
                statusF === t.value ? 'bg-card text-foreground shadow-sm' : 'text-muted hover:text-foreground',
              )}
            >
              {t.label}
              {t.n !== undefined && <span className="ml-1.5 text-xs text-faint">{t.n}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* grade agrupada por categoria */}
      {groups.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
          <SearchX className="h-8 w-8 text-faint" />
          <p className="mt-3 text-sm font-medium text-foreground">Nenhuma integração encontrada</p>
          <p className="mt-1 text-sm text-muted">Ajuste a busca ou os filtros.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.meta.nome}>
              <div className="mb-3.5 flex items-center gap-2.5">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', g.meta.tile)}>
                  <g.meta.icon className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold text-foreground">{g.meta.nome}</h2>
                <span className="text-xs text-faint">{g.items.length}</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((app) => (
                  <IntegracaoCard key={app.id} app={app} onOpen={() => setSelectedId(app.id)} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <IntegracaoDrawer app={selected} onClose={() => setSelectedId(null)} onConnect={connect} onDisconnect={disconnect} onSave={save} />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground shadow-2xl animate-fade-in">
          {toast}
        </div>
      )}
    </>
  )
}
