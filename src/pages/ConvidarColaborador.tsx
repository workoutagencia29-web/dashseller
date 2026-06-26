import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  UserPlus,
  Mail,
  Phone,
  IdCard,
  Briefcase,
  User,
  Send,
  Copy,
  Check,
  RotateCw,
  X,
  Info,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Avatar } from '../components/ui/Avatar'
import {
  SettingsCard,
  Field,
  Input,
  Select,
  Button,
  Badge,
  maskCPF,
  maskPhone,
} from '../components/settings/primitives'
import { cn } from '../lib/utils'

/* ------------------------------- Tipos -------------------------------- */

type InviteStatus = 'pendente' | 'aceito'

interface Invite {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  role: string
  status: InviteStatus
  sentAt: number
  acceptedAt?: number
  seed: number
}

const PER_PAGE = 3

const ROLES = [
  'Administrador',
  'Financeiro',
  'Suporte',
  'Vendas',
  'Marketing',
  'Somente leitura',
]

/* ----------------------------- Mock seed ------------------------------ */

let inviteId = 100
const DAY = 86_400_000

const seedInvites: Invite[] = [
  { id: inviteId++, name: 'Marina Alves', email: 'marina.alves@email.com', phone: '(11) 99876-1122', cpf: '321.654.987-00', role: 'Financeiro', status: 'aceito', sentAt: Date.now() - 6 * DAY, acceptedAt: Date.now() - 5 * DAY, seed: 5 },
  { id: inviteId++, name: 'João Pedro Lima', email: 'joao.pedro@email.com', phone: '(21) 98123-4567', cpf: '147.258.369-10', role: 'Vendas', status: 'pendente', sentAt: Date.now() - 2 * DAY, seed: 12 },
  { id: inviteId++, name: 'Ana Souza', email: 'ana.souza@email.com', phone: '(31) 99654-8800', cpf: '963.852.741-20', role: 'Suporte', status: 'pendente', sentAt: Date.now() - 1 * DAY, seed: 9 },
  { id: inviteId++, name: 'Bruno Carvalho', email: 'bruno.carvalho@email.com', phone: '(61) 99777-6655', cpf: '852.741.963-40', role: 'Marketing', status: 'aceito', sentAt: Date.now() - 9 * DAY, acceptedAt: Date.now() - 8 * DAY, seed: 60 },
  { id: inviteId++, name: 'Carla Dias', email: 'carla.dias@email.com', phone: '(41) 98555-2211', cpf: '258.147.369-50', role: 'Administrador', status: 'pendente', sentAt: Date.now() - 3 * DAY, seed: 22 },
  { id: inviteId++, name: 'Diego Ramos', email: 'diego.ramos@email.com', phone: '(51) 99888-3344', cpf: '741.852.963-60', role: 'Vendas', status: 'aceito', sentAt: Date.now() - 12 * DAY, acceptedAt: Date.now() - 11 * DAY, seed: 33 },
  { id: inviteId++, name: 'Elaine Costa', email: 'elaine.costa@email.com', phone: '(71) 98222-7788', cpf: '369.258.147-70', role: 'Financeiro', status: 'pendente', sentAt: Date.now() - 4 * DAY, seed: 41 },
  { id: inviteId++, name: 'Felipe Nunes', email: 'felipe.nunes@email.com', phone: '(81) 99333-1100', cpf: '159.357.486-80', role: 'Suporte', status: 'aceito', sentAt: Date.now() - 15 * DAY, acceptedAt: Date.now() - 14 * DAY, seed: 47 },
  { id: inviteId++, name: 'Gabriela Pinto', email: 'gabriela.pinto@email.com', phone: '(91) 98444-9966', cpf: '486.159.753-90', role: 'Somente leitura', status: 'pendente', sentAt: Date.now() - 5 * DAY, seed: 16 },
]

/* ----------------------------- Helpers -------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const onlyDigits = (v: string) => v.replace(/\D/g, '')

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function inviteLink(invite: { id: number }): string {
  return `${window.location.origin}/convite/${invite.id}-${Math.abs((invite.id * 2654435761) >>> 0).toString(36)}`
}

type TabKey = 'todos' | 'pendente' | 'aceito'

/* ============================== Página ================================ */

export default function ConvidarColaborador() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [invites, setInvites] = useState<Invite[]>(seedInvites)
  const [tab, setTab] = useState<TabKey>('todos')
  const [page, setPage] = useState(1)

  // formulário
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')
  const [role, setRole] = useState('')

  // feedback (toast) + linha que acabou de copiar
  const [toast, setToast] = useState<{ email: string; link: string } | null>(null)
  const [copiedId, setCopiedId] = useState<number | 'toast' | null>(null)

  const valid = {
    name: name.trim().length >= 2,
    email: EMAIL_RE.test(email.trim()),
    phone: onlyDigits(phone).length >= 10,
    cpf: onlyDigits(cpf).length === 11,
    role: role !== '',
  }
  const canSend = Object.values(valid).every(Boolean)

  function resetForm() {
    setName('')
    setEmail('')
    setPhone('')
    setCpf('')
    setRole('')
  }

  function sendInvite() {
    if (!canSend) return
    const invite: Invite = {
      id: inviteId++,
      name: name.trim(),
      email: email.trim(),
      phone,
      cpf,
      role,
      status: 'pendente',
      sentAt: Date.now(),
      seed: Math.floor(Math.random() * 70),
    }
    setInvites((list) => [invite, ...list])
    setToast({ email: invite.email, link: inviteLink(invite) })
    resetForm()
  }

  async function copy(text: string, id: number | 'toast') {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      /* clipboard indisponível no preview — ignora */
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1800)
  }

  function resend(id: number) {
    setInvites((list) => list.map((i) => (i.id === id ? { ...i, sentAt: Date.now() } : i)))
    const inv = invites.find((i) => i.id === id)
    if (inv) setToast({ email: inv.email, link: inviteLink(inv) })
  }

  function revoke(id: number) {
    setInvites((list) => list.filter((i) => i.id !== id))
  }

  const counts = useMemo(
    () => ({
      todos: invites.length,
      pendente: invites.filter((i) => i.status === 'pendente').length,
      aceito: invites.filter((i) => i.status === 'aceito').length,
    }),
    [invites],
  )

  const filtered = tab === 'todos' ? invites : invites.filter((i) => i.status === tab)

  // paginação: 3 por página
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'todos', label: 'Todos' },
    { key: 'pendente', label: 'Pendentes' },
    { key: 'aceito', label: 'Aceitos' },
  ]

  return (
    <>
      <Header
        title="Convidar Colaborador"
        subtitle="Convide novos membros para o espaço da sua conta."
        onOpenMobile={onOpenMobile}
      />

      <div className="space-y-6">
        {/* ---------------------------- Formulário ---------------------------- */}
        <SettingsCard
          title="Novo convite"
          description="Preencha todos os dados do colaborador para liberar o envio do convite."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nome completo">
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Maria Oliveira"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="E-mail">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@email.com"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Telefone / WhatsApp">
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 90000-0000"
                  inputMode="numeric"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="CPF">
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(maskCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className="pl-9"
                />
              </div>
            </Field>

            <Field label="Cargo" className="sm:col-span-2">
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
                <Select value={role} onChange={(e) => setRole(e.target.value)} className="pl-9">
                  <option value="" disabled>
                    Selecione o cargo
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </div>
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
            <p className="flex items-center gap-2 text-xs text-muted">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Ambiente de demonstração: o envio é simulado, nenhum e-mail real é disparado.
            </p>
            <Button onClick={sendInvite} disabled={!canSend}>
              <Send className="h-4 w-4" />
              Enviar convite
            </Button>
          </div>
        </SettingsCard>

        {/* ---------------------------- Lista ---------------------------- */}
        <SettingsCard title="Convites" description="Acompanhe os convites enviados e o status de cada um.">
          {/* abas de filtro */}
          <div className="mb-5 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
                  tab === t.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted hover:bg-card-muted hover:text-foreground',
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                    tab === t.key ? 'bg-primary/20 text-primary' : 'bg-card-muted text-muted',
                  )}
                >
                  {counts[t.key]}
                </span>
              </button>
            ))}
          </div>

          {/* corpo — altura travada (3 convites) para o card não encolher em abas/páginas curtas */}
          <div className="min-h-[278px]">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center">
              <UserPlus className="mx-auto h-7 w-7 text-faint" />
              <p className="mt-3 text-sm font-medium text-foreground">Nenhum convite por aqui</p>
              <p className="mt-1 text-xs text-muted">Os convites desta categoria aparecerão nesta lista.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {paged.map((inv) => (
                <motion.div
                  key={inv.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card-muted/30 p-3.5"
                >
                    <Avatar name={inv.name} seed={inv.seed} size={42} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{inv.name}</p>
                        <Badge tone="info">{inv.role}</Badge>
                        {inv.status === 'pendente' ? (
                          <Badge tone="warning">Pendente</Badge>
                        ) : (
                          <Badge tone="success">Aceito</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted">{inv.email}</p>
                      <p className="mt-0.5 text-xs text-faint">
                        {inv.status === 'aceito' && inv.acceptedAt
                          ? `Aceito em ${formatDate(inv.acceptedAt)}`
                          : `Enviado em ${formatDate(inv.sentAt)}`}
                      </p>
                    </div>

                    {/* ações */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copy(inviteLink(inv), inv.id)}
                        title="Copiar link de convite"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
                      >
                        {copiedId === inv.id ? (
                          <Check className="h-4 w-4 text-positive" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>

                      {inv.status === 'pendente' && (
                        <>
                          <button
                            onClick={() => resend(inv.id)}
                            title="Reenviar convite"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-card-muted hover:text-foreground"
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => revoke(inv.id)}
                            title="Cancelar convite"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-negative/10 hover:text-negative"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
              ))}
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
        </SettingsCard>
      </div>

      {/* ---------------------------- Toast ---------------------------- */}
      {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-3rem))] rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/30"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
                <Check className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">Convite enviado</p>
                <p className="mt-0.5 truncate text-xs text-muted">
                  Enviado para <span className="text-foreground">{toast.email}</span>
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(toast.link, 'toast')}>
                    {copiedId === 'toast' ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-positive" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" /> Copiar link
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-muted transition-colors hover:text-foreground"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
    </>
  )
}
