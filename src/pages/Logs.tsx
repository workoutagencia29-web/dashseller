import { useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search,
  SlidersHorizontal,
  Star,
  Wallet,
  FileText,
  Webhook,
  KeyRound,
  Users,
  UserCog,
  Package,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Avatar } from '../components/ui/Avatar'
import { Dropdown } from '../components/ui/Dropdown'
import { Input, Button, Badge, Switch } from '../components/settings/primitives'
import { Modal } from '../components/financeiro/financeiroPrimitives'
import { cn } from '../lib/utils'

/* ------------------------------- Dados -------------------------------- */

interface Category {
  key: string
  label: string
  icon: LucideIcon
}

interface ActionType {
  id: string
  label: string
  category: string
}

const CATEGORIES: Category[] = [
  { key: 'financeiro', label: 'Financeiro', icon: Wallet },
  { key: 'clientes', label: 'Clientes', icon: FileText },
  { key: 'webhooks', label: 'Webhooks', icon: Webhook },
  { key: 'api', label: "API's", icon: KeyRound },
  { key: 'equipe', label: 'Equipe', icon: Users },
  { key: 'conta', label: 'Conta', icon: UserCog },
  { key: 'produtos', label: 'Produtos', icon: Package },
]

const ACTION_TYPES: ActionType[] = [
  { id: 'saque', label: 'Solicitar saque', category: 'financeiro' },
  { id: 'saque_cancel', label: 'Cancelar saque', category: 'financeiro' },
  { id: 'antecipacao', label: 'Solicitar antecipação', category: 'financeiro' },
  { id: 'dados_banco', label: 'Alterar dados bancários', category: 'financeiro' },
  { id: 'export_clientes', label: 'Exportar clientes', category: 'clientes' },
  { id: 'export_vendas', label: 'Exportar relatório de vendas', category: 'clientes' },
  { id: 'webhook_add', label: 'Adicionar webhook', category: 'webhooks' },
  { id: 'webhook_endpoint', label: 'Alterar endpoint de webhook', category: 'webhooks' },
  { id: 'webhook_remove', label: 'Remover webhook', category: 'webhooks' },
  { id: 'api_criar', label: 'Criar chave de API', category: 'api' },
  { id: 'api_revogar', label: 'Revogar chave de API', category: 'api' },
  { id: 'convite', label: 'Convidar colaborador', category: 'equipe' },
  { id: 'membro_remover', label: 'Remover colaborador', category: 'equipe' },
  { id: 'permissoes', label: 'Alterar permissões', category: 'equipe' },
  { id: 'senha', label: 'Alterar senha', category: 'conta' },
  { id: 'perfil', label: 'Editar perfil', category: 'conta' },
  { id: 'produto_criar', label: 'Criar produto', category: 'produtos' },
  { id: 'produto_remover', label: 'Remover produto', category: 'produtos' },
]

/** Ações já marcadas como importantes por padrão (as de maior impacto). */
const DEFAULT_IMPORTANT = [
  'saque',
  'dados_banco',
  'export_clientes',
  'webhook_add',
  'webhook_endpoint',
  'webhook_remove',
  'api_criar',
  'api_revogar',
  'membro_remover',
  'permissoes',
]

interface LogEntry {
  id: number
  member: string
  seed: number
  actionId: string
  action: string
  datetime: string
}

const LOGS: LogEntry[] = [
  { id: 1, member: 'Jorge Mendes', seed: 51, actionId: 'saque', action: 'Solicitou saque de R$ 5.000,00', datetime: '24/06/2026 09:20' },
  { id: 2, member: 'Pristia Candra', seed: 31, actionId: 'dados_banco', action: 'Adicionou conta bancária (Itaú)', datetime: '23/06/2026 16:05' },
  { id: 3, member: 'Marina Alves', seed: 5, actionId: 'export_vendas', action: 'Exportou relatório de vendas', datetime: '23/06/2026 11:48' },
  { id: 4, member: 'Pristia Candra', seed: 31, actionId: 'webhook_endpoint', action: 'Alterou o endpoint de webhook (/v2/pedidos)', datetime: '22/06/2026 19:32' },
  { id: 5, member: 'Ana Souza', seed: 9, actionId: 'export_clientes', action: 'Exportou clientes (312 registros)', datetime: '22/06/2026 14:10' },
  { id: 6, member: 'Bruno Carvalho', seed: 60, actionId: 'webhook_add', action: "Adicionou webhook 'Pagamentos aprovados'", datetime: '21/06/2026 18:02' },
  { id: 7, member: 'João Pedro Lima', seed: 12, actionId: 'produto_criar', action: "Criou o produto 'Mentoria Premium'", datetime: '21/06/2026 10:33' },
  { id: 8, member: 'Jorge Mendes', seed: 51, actionId: 'api_criar', action: 'Criou uma chave de API', datetime: '20/06/2026 17:45' },
  { id: 9, member: 'Marina Alves', seed: 5, actionId: 'permissoes', action: 'Alterou as permissões do cargo Financeiro', datetime: '20/06/2026 09:12' },
  { id: 10, member: 'Pristia Candra', seed: 31, actionId: 'convite', action: 'Convidou ana.souza@email.com', datetime: '19/06/2026 16:40' },
  { id: 11, member: 'Ana Souza', seed: 9, actionId: 'webhook_remove', action: "Removeu o webhook 'Reembolsos'", datetime: '19/06/2026 11:25' },
  { id: 12, member: 'Bruno Carvalho', seed: 60, actionId: 'perfil', action: 'Atualizou os dados do perfil', datetime: '18/06/2026 15:50' },
  { id: 13, member: 'João Pedro Lima', seed: 12, actionId: 'saque', action: 'Solicitou saque de R$ 1.250,00', datetime: '18/06/2026 08:15' },
  { id: 14, member: 'Jorge Mendes', seed: 51, actionId: 'api_revogar', action: 'Revogou uma chave de API', datetime: '17/06/2026 13:30' },
  { id: 15, member: 'Marina Alves', seed: 5, actionId: 'senha', action: 'Alterou a senha da conta', datetime: '17/06/2026 09:00' },
]

const PER_PAGE = 5

const categoryOf = (actionId: string) => ACTION_TYPES.find((a) => a.id === actionId)?.category ?? ''
const categoryLabel = (key: string) => CATEGORIES.find((c) => c.key === key)?.label ?? key

const MEMBERS = Array.from(new Set(LOGS.map((l) => l.member)))
const ALL_MEMBERS = 'Todos os colaboradores'
const ALL_CATEGORIES = 'Todas as categorias'

/* ============================== Página ================================ */

export default function Logs() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  // marcação de ações importantes (aplica na hora)
  const [important, setImportant] = useState<Set<string>>(() => new Set(DEFAULT_IMPORTANT))
  const [configOpen, setConfigOpen] = useState(false)

  // filtros
  const [search, setSearch] = useState('')
  const [member, setMember] = useState(ALL_MEMBERS)
  const [category, setCategory] = useState(ALL_CATEGORIES)
  const [onlyImportant, setOnlyImportant] = useState(false)
  const [page, setPage] = useState(1)

  const isImportant = (actionId: string) => important.has(actionId)

  function toggleImportant(id: string) {
    setImportant((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // reseta a página quando qualquer filtro muda
  useEffect(() => {
    setPage(1)
  }, [search, member, category, onlyImportant])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return LOGS.filter((l) => {
      if (onlyImportant && !important.has(l.actionId)) return false
      if (member !== ALL_MEMBERS && l.member !== member) return false
      if (category !== ALL_CATEGORIES && categoryLabel(categoryOf(l.actionId)) !== category) return false
      if (q && !(l.member.toLowerCase().includes(q) || l.action.toLowerCase().includes(q))) return false
      return true
    })
  }, [search, member, category, onlyImportant, important])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const memberOptions = [ALL_MEMBERS, ...MEMBERS]
  const categoryOptions = [ALL_CATEGORIES, ...CATEGORIES.map((c) => c.label)]

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
      <Header
        title="Logs"
        subtitle="Acompanhe as ações que cada colaborador faz na conta."
        onOpenMobile={onOpenMobile}
      />

      <section className="flex min-h-0 flex-1 flex-col rounded-3xl border border-border bg-card p-6 sm:p-7">
        {/* cabeçalho do card */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Registro de ações
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              Histórico de atividades da equipe. {important.size} ações marcadas como importantes.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setConfigOpen(true)}>
            <SlidersHorizontal className="h-4 w-4" />
            Configurar ações importantes
          </Button>
        </div>

        {/* filtros */}
        <div className="mb-5 flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por colaborador ou ação..."
              className="pl-9"
            />
          </div>
          <Dropdown value={member} options={memberOptions} onChange={setMember} variant="compact" align="right" />
          <Dropdown value={category} options={categoryOptions} onChange={setCategory} variant="compact" align="right" />
          <button
            onClick={() => setOnlyImportant((v) => !v)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors',
              onlyImportant
                ? 'border-chart-yellow/40 bg-chart-yellow/10 text-chart-yellow'
                : 'border-border bg-input/60 text-muted hover:text-foreground',
            )}
          >
            <Star className={cn('h-4 w-4', onlyImportant && 'fill-current')} />
            Só importantes
          </button>
        </div>

        {/* feed — preenche a altura disponível (rola dentro só se faltar espaço) */}
        <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto overscroll-none">
        {paged.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-14 text-center">
            <Search className="mx-auto h-7 w-7 text-faint" />
            <p className="mt-3 text-sm font-medium text-foreground">Nenhuma ação encontrada</p>
            <p className="mt-1 text-xs text-muted">Ajuste os filtros para ver outros registros.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {paged.map((log) => {
              const imp = isImportant(log.actionId)
              return (
                <motion.div
                  key={log.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'flex flex-wrap items-center gap-3 rounded-2xl border p-3.5',
                    imp ? 'border-chart-yellow/30 bg-chart-yellow/5' : 'border-border bg-card-muted/30',
                  )}
                >
                  <Avatar name={log.member} seed={log.seed} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{log.member}</p>
                      <Badge tone="neutral">{categoryLabel(categoryOf(log.actionId))}</Badge>
                      {imp && (
                        <Badge tone="warning">
                          <Star className="h-3 w-3 fill-current" /> Importante
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{log.action}</p>
                  </div>
                  <span className="shrink-0 text-xs text-faint">{log.datetime}</span>
                </motion.div>
              )
            })}
          </div>
        )}
        </div>

        {/* paginação — área sempre reservada para travar a altura do card */}
        <div className={cn('mt-5 pt-5', totalPages > 1 && 'border-t border-border')}>
          {totalPages > 1 ? (
            <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              aria-label="Página anterior"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={cn(
                  'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition-colors',
                  n === safePage
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-card-muted hover:text-foreground',
                )}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              aria-label="Próxima página"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            </div>
          ) : (
            <div className="h-9" />
          )}
        </div>
      </section>
      </div>

      {/* --------------------- Modal: ações importantes --------------------- */}
      <Modal
        open={configOpen}
        title="Ações importantes"
        onClose={() => setConfigOpen(false)}
        footer={<Button onClick={() => setConfigOpen(false)}>Concluir</Button>}
      >
        <p className="-mt-1 mb-4 text-sm text-muted">
          Marque quais ações devem ser destacadas como importantes no registro.
        </p>
        <div className="scrollbar-thin -mr-2 max-h-[55vh] space-y-5 overflow-y-auto pr-2">
          {CATEGORIES.map((cat) => {
            const actions = ACTION_TYPES.filter((a) => a.category === cat.key)
            if (actions.length === 0) return null
            return (
              <div key={cat.key}>
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-faint">
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </p>
                <div className="space-y-0.5">
                  {actions.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-4 rounded-lg py-2">
                      <span className="text-sm text-foreground">{a.label}</span>
                      <Switch checked={important.has(a.id)} onChange={() => toggleImportant(a.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
