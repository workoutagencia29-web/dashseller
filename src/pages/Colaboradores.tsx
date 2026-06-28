import { useEffect, useMemo, useRef, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Mail,
  Phone,
  IdCard,
  Briefcase,
  UserX,
  Users,
  Check,
  X,
  ShieldAlert,
  Activity,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { Avatar } from '../components/ui/Avatar'
import { Field, Input, Select, Button, Badge, maskCPF, maskPhone } from '../components/settings/primitives'
import { cn } from '../lib/utils'

/* ------------------------------- Dados -------------------------------- */

/** Cargos da conta (mesma lista da tela de Permissões). */
const ROLES = ['Administrador', 'Financeiro', 'Visualizador', 'Marketing']

const PER_PAGE = 6

/** Sem login real: o usuário atual é o dono da conta (Administrador). */
const CURRENT_USER_IS_ADMIN = true

interface Collaborator {
  id: number
  name: string
  email: string
  phone: string
  cpf: string
  role: string
  status: 'ativo' | 'inativo'
  seed: number
  /** Foto enviada pelo usuário (data URL). Sem ela, usa o avatar padrão do seed. */
  avatarUrl?: string
}

interface ActivityEntry {
  id: number
  action: string
  datetime: string
}

const INITIAL: Collaborator[] = [
  { id: 1, name: 'Pristia Candra', email: 'pristia@nummo.com', phone: '(11) 98765-4321', cpf: '123.456.789-09', role: 'Administrador', status: 'ativo', seed: 31 },
  { id: 2, name: 'Jorge Mendes', email: 'jorge.mendes@email.com', phone: '(21) 99876-1122', cpf: '321.654.987-00', role: 'Financeiro', status: 'ativo', seed: 51 },
  { id: 3, name: 'Marina Alves', email: 'marina.alves@email.com', phone: '(31) 99654-8800', cpf: '963.852.741-20', role: 'Marketing', status: 'ativo', seed: 5 },
  { id: 4, name: 'Ana Souza', email: 'ana.souza@email.com', phone: '(41) 98123-4567', cpf: '147.258.369-10', role: 'Visualizador', status: 'ativo', seed: 9 },
  { id: 5, name: 'João Pedro Lima', email: 'joao.pedro@email.com', phone: '(51) 98888-7777', cpf: '258.369.147-30', role: 'Financeiro', status: 'ativo', seed: 12 },
  { id: 6, name: 'Bruno Carvalho', email: 'bruno.carvalho@email.com', phone: '(61) 99777-6655', cpf: '852.741.963-40', role: 'Marketing', status: 'ativo', seed: 60 },
  { id: 7, name: 'Carla Dias', email: 'carla.dias@email.com', phone: '(41) 98555-2211', cpf: '258.147.369-50', role: 'Visualizador', status: 'ativo', seed: 22 },
  { id: 8, name: 'Diego Ramos', email: 'diego.ramos@email.com', phone: '(51) 99888-3344', cpf: '741.852.963-60', role: 'Financeiro', status: 'ativo', seed: 33 },
  { id: 9, name: 'Elaine Costa', email: 'elaine.costa@email.com', phone: '(71) 98222-7788', cpf: '369.258.147-70', role: 'Marketing', status: 'ativo', seed: 41 },
  { id: 10, name: 'Felipe Nunes', email: 'felipe.nunes@email.com', phone: '(81) 99333-1100', cpf: '159.357.486-80', role: 'Visualizador', status: 'ativo', seed: 47 },
  { id: 11, name: 'Gabriela Pinto', email: 'gabriela.pinto@email.com', phone: '(91) 98444-9966', cpf: '486.159.753-90', role: 'Financeiro', status: 'ativo', seed: 16 },
  { id: 12, name: 'Hugo Lima', email: 'hugo.lima@email.com', phone: '(11) 97333-2244', cpf: '753.951.456-10', role: 'Marketing', status: 'ativo', seed: 28 },
  { id: 13, name: 'Isabela Rocha', email: 'isabela.rocha@email.com', phone: '(21) 96222-8855', cpf: '951.753.852-20', role: 'Visualizador', status: 'ativo', seed: 54 },
  { id: 14, name: 'Lucas Martins', email: 'lucas.martins@email.com', phone: '(31) 95111-7766', cpf: '357.456.159-30', role: 'Financeiro', status: 'ativo', seed: 7 },
]

/** Log de ações por colaborador (mock). */
const ACTIVITY: Record<number, ActivityEntry[]> = {
  1: [
    { id: 1, action: 'Convidou ana.souza@email.com', datetime: '19/06/2026 16:40' },
    { id: 2, action: 'Adicionou conta bancária (Itaú)', datetime: '23/06/2026 16:05' },
    { id: 3, action: 'Alterou o endpoint de webhook (/v2/pedidos)', datetime: '22/06/2026 19:32' },
  ],
  2: [
    { id: 1, action: 'Solicitou saque de R$ 5.000,00', datetime: '24/06/2026 09:20' },
    { id: 2, action: 'Criou uma chave de API', datetime: '20/06/2026 17:45' },
    { id: 3, action: 'Revogou uma chave de API', datetime: '17/06/2026 13:30' },
  ],
  3: [
    { id: 1, action: 'Exportou relatório de vendas', datetime: '23/06/2026 11:48' },
    { id: 2, action: 'Alterou as permissões do cargo Financeiro', datetime: '20/06/2026 09:12' },
  ],
  4: [
    { id: 1, action: 'Exportou clientes (312 registros)', datetime: '22/06/2026 14:10' },
    { id: 2, action: 'Acessou o relatório de entradas', datetime: '21/06/2026 10:02' },
  ],
  5: [
    { id: 1, action: 'Solicitou saque de R$ 1.250,00', datetime: '18/06/2026 08:15' },
    { id: 2, action: "Criou o produto 'Mentoria Premium'", datetime: '21/06/2026 10:33' },
  ],
  6: [
    { id: 1, action: "Adicionou webhook 'Pagamentos aprovados'", datetime: '21/06/2026 18:02' },
    { id: 2, action: 'Atualizou os dados do perfil', datetime: '18/06/2026 15:50' },
  ],
}

/* --------------------------- Card (conteúdo) --------------------------- */

/** Miolo visual do card — compartilhado entre o card real e o fantasma,
 *  garantindo altura idêntica para travar a posição da paginação. */
function CollaboratorCardInner({ c }: { c: Collaborator }) {
  return (
    <>
      <Avatar name={c.name} seed={c.seed} src={c.avatarUrl} size={76} />
      <div>
        <p className="text-base font-semibold text-foreground">{c.name}</p>
        <div className="mt-1.5 flex items-center justify-center gap-2">
          <Badge tone="info">{c.role}</Badge>
          <Badge tone="success">Ativo</Badge>
        </div>
      </div>
      <div className="mt-1 w-full space-y-1.5 border-t border-border pt-3 text-xs text-muted">
        <p className="flex items-center justify-center gap-1.5">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{c.email}</span>
        </p>
        <p className="flex items-center justify-center gap-1.5">
          <Phone className="h-3.5 w-3.5 shrink-0" /> {c.phone}
        </p>
        <p className="flex items-center justify-center gap-1.5">
          <IdCard className="h-3.5 w-3.5 shrink-0" /> {c.cpf}
        </p>
      </div>
    </>
  )
}

const CARD_CLASS =
  'flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-6 text-center'

/* ============================== Página ================================ */

export default function Colaboradores() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [collaborators, setCollaborators] = useState<Collaborator[]>(INITIAL)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const active = useMemo(() => collaborators.filter((c) => c.status === 'ativo'), [collaborators])
  const selected = collaborators.find((c) => c.id === selectedId) ?? null

  // paginação: 6 colaboradores por página
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(active.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paged = active.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  // mantém a página válida quando desativar reduz o total
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages))
  }, [totalPages])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast((t) => (t === msg ? null : t)), 3000)
  }

  return (
    <>
      <Header
        title="Colaboradores"
        subtitle="Os membros ativos da sua equipe."
        onOpenMobile={onOpenMobile}
      />

      {active.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-20 text-center">
          <Users className="mx-auto h-8 w-8 text-faint" />
          <p className="mt-3 text-sm font-medium text-foreground">Nenhum colaborador ativo</p>
          <p className="mt-1 text-xs text-muted">Convide novos membros na aba “Convidar Colaborador”.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paged.map((c) => (
            <motion.button
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setSelectedId(c.id)}
              className={cn(CARD_CLASS, 'transition-colors hover:border-primary/40 hover:bg-card-muted/40')}
            >
              <CollaboratorCardInner c={c} />
            </motion.button>
          ))}

          {/* cards-fantasma: completam a última página para travar a altura
              da grade (a paginação fica sempre na mesma posição) */}
          {active.length > PER_PAGE &&
            Array.from({ length: PER_PAGE - paged.length }).map((_, i) => (
              <div key={`ph-${i}`} aria-hidden className={cn(CARD_CLASS, 'invisible')}>
                <CollaboratorCardInner c={paged[0]} />
              </div>
            ))}
        </div>
      )}

      {/* paginação */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-1.5">
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
      )}

      {/* ---------------------------- Modal de detalhe ---------------------------- */}
      {selected && (
        <CollaboratorModal
          key={selected.id}
          collaborator={selected}
          onClose={() => setSelectedId(null)}
          onSave={(data) => {
            setCollaborators((list) => list.map((c) => (c.id === selected.id ? { ...c, ...data } : c)))
            showToast('Dados do colaborador salvos')
          }}
          onDeactivate={() => {
            setCollaborators((list) =>
              list.map((c) => (c.id === selected.id ? { ...c, status: 'inativo' } : c)),
            )
            setSelectedId(null)
            showToast(`${selected.name} foi desativado`)
          }}
        />
      )}

      {/* ------------------------------- Toast ------------------------------- */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/30"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">{toast}</p>
        </motion.div>
      )}
    </>
  )
}

/* --------------------------- Modal de detalhe --------------------------- */

function CollaboratorModal({
  collaborator,
  onClose,
  onSave,
  onDeactivate,
}: {
  collaborator: Collaborator
  onClose: () => void
  onSave: (data: Pick<Collaborator, 'name' | 'email' | 'phone' | 'cpf' | 'role' | 'avatarUrl'>) => void
  onDeactivate: () => void
}) {
  const [name, setName] = useState(collaborator.name)
  const [email, setEmail] = useState(collaborator.email)
  const [phone, setPhone] = useState(collaborator.phone)
  const [cpf, setCpf] = useState(collaborator.cpf)
  const [role, setRole] = useState(collaborator.role)
  const [avatarUrl, setAvatarUrl] = useState(collaborator.avatarUrl)
  const [confirmOff, setConfirmOff] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // fecha com ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // lê o arquivo escolhido como data URL e mostra no preview (só persiste ao salvar)
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setAvatarUrl(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // permite re-selecionar o mesmo arquivo
  }

  const dirty =
    name !== collaborator.name ||
    email !== collaborator.email ||
    phone !== collaborator.phone ||
    cpf !== collaborator.cpf ||
    role !== collaborator.role ||
    avatarUrl !== collaborator.avatarUrl

  const logs = ACTIVITY[collaborator.id] ?? []

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="scrollbar-thin relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl sm:p-7"
      >
        {/* cabeçalho */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Alterar foto"
              title="Alterar foto"
            >
              <Avatar name={collaborator.name} seed={collaborator.seed} src={avatarUrl} size={64} />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-full bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-5 w-5 text-white" />
                <span className="text-[9px] font-semibold uppercase tracking-wide text-white">Alterar</span>
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-foreground">{collaborator.name}</h3>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge tone="info">{collaborator.role}</Badge>
              <Badge tone="success">Ativo</Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* dados editáveis */}
        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-border pt-6 sm:grid-cols-2">
          <Field label="Nome completo">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Telefone / WhatsApp">
            <Input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} inputMode="numeric" />
          </Field>
          <Field label="CPF">
            <Input value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} inputMode="numeric" />
          </Field>
          <Field
            label="Cargo"
            className="sm:col-span-2"
            hint={
              CURRENT_USER_IS_ADMIN
                ? 'Apenas administradores podem alterar o cargo.'
                : 'Apenas administradores podem alterar o cargo. Você não tem permissão.'
            }
          >
            <div className="relative">
              <Briefcase className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted" />
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="pl-9"
                disabled={!CURRENT_USER_IS_ADMIN}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
        </div>

        {/* ações: salvar + desativar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {!confirmOff ? (
            <Button variant="danger" size="sm" onClick={() => setConfirmOff(true)}>
              <UserX className="h-4 w-4" /> Desativar colaborador
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-negative/5 px-3 py-1.5">
              <ShieldAlert className="h-4 w-4 text-negative" />
              <span className="text-xs text-muted">Desativar {collaborator.name}?</span>
              <Button variant="danger" size="sm" onClick={onDeactivate}>
                Confirmar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmOff(false)}>
                Cancelar
              </Button>
            </div>
          )}

          <Button size="sm" disabled={!dirty} onClick={() => onSave({ name, email, phone, cpf, role, avatarUrl })}>
            Salvar alterações
          </Button>
        </div>

        {/* log do colaborador */}
        <div className="mt-7 border-t border-border pt-6">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            Atividade de {collaborator.name.split(' ')[0]}
          </h4>
          {logs.length === 0 ? (
            <p className="mt-3 text-xs text-muted">Nenhuma atividade registrada.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {logs.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card-muted/30 px-4 py-2.5 text-sm"
                >
                  <span className="text-foreground">{l.action}</span>
                  <span className="shrink-0 text-xs text-muted">{l.datetime}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
