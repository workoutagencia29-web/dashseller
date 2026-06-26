import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  Wallet,
  Eye,
  Megaphone,
  LayoutGrid,
  Package,
  Landmark,
  Webhook,
  KeyRound,
  Users,
  ScrollText,
  UserCog,
  Bell,
  Check,
  type LucideIcon,
} from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { SettingsCard, ToggleRow, Button, Badge } from '../components/settings/primitives'
import { cn } from '../lib/utils'

/* ------------------------------- Dados -------------------------------- */

interface Role {
  key: string
  label: string
  desc: string
  icon: LucideIcon
}

interface Permission {
  id: string
  label: string
  desc: string
  icon: LucideIcon
}

const ROLES: Role[] = [
  { key: 'admin', label: 'Administrador', desc: 'Controle total da conta.', icon: ShieldCheck },
  { key: 'financeiro', label: 'Financeiro', desc: 'Saldo, saques e dados bancários.', icon: Wallet },
  { key: 'visualizador', label: 'Visualizador', desc: 'Acesso somente leitura.', icon: Eye },
  { key: 'marketing', label: 'Marketing', desc: 'Produtos e campanhas.', icon: Megaphone },
]

const PERMISSIONS: Permission[] = [
  { id: 'dashboard', label: 'Ver dashboard e relatórios', desc: 'Acessar os painéis e relatórios da conta.', icon: LayoutGrid },
  { id: 'produtos', label: 'Gerenciar produtos', desc: 'Criar, editar e remover produtos.', icon: Package },
  { id: 'saldo', label: 'Sacar e gerenciar saldo', desc: 'Solicitar saques e movimentar o saldo.', icon: Wallet },
  { id: 'bancarios', label: 'Editar dados bancários', desc: 'Alterar as contas de recebimento.', icon: Landmark },
  { id: 'webhooks', label: 'Gerenciar webhooks', desc: 'Configurar e testar webhooks.', icon: Webhook },
  { id: 'apis', label: "Gerenciar API's", desc: 'Criar e revogar chaves de integração.', icon: KeyRound },
  { id: 'equipe', label: 'Gerenciar equipe', desc: 'Convidar membros e editar permissões.', icon: Users },
  { id: 'logs', label: 'Ver Logs', desc: 'Acessar o histórico de ações da conta.', icon: ScrollText },
  { id: 'perfil', label: 'Gerenciar perfil do usuário', desc: 'Editar os dados do próprio perfil.', icon: UserCog },
  { id: 'notificacoes', label: 'Gerenciar notificações', desc: 'Definir alertas e canais de aviso.', icon: Bell },
]

type PermState = Record<string, Record<string, boolean>>

function emptyState(): PermState {
  const state: PermState = {}
  for (const role of ROLES) {
    state[role.key] = {}
    for (const perm of PERMISSIONS) state[role.key][perm.id] = false
  }
  return state
}

const clone = (s: PermState): PermState => JSON.parse(JSON.stringify(s))

/* ============================== Página ================================ */

export default function Permissoes() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  const [saved, setSaved] = useState<PermState>(emptyState)
  const [draft, setDraft] = useState<PermState>(emptyState)
  const [activeRole, setActiveRole] = useState(ROLES[0].key)
  const [showToast, setShowToast] = useState(false)

  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft])
  const role = ROLES.find((r) => r.key === activeRole)!

  function toggle(permId: string) {
    setDraft((d) => ({
      ...d,
      [activeRole]: { ...d[activeRole], [permId]: !d[activeRole][permId] },
    }))
  }

  function countEnabled(roleKey: string): number {
    return Object.values(draft[roleKey]).filter(Boolean).length
  }

  function save() {
    if (!dirty) return
    setSaved(clone(draft))
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function discard() {
    setDraft(clone(saved))
  }

  return (
    <>
      <Header
        title="Permissões"
        subtitle="Defina o que cada cargo da sua equipe pode acessar."
        onOpenMobile={onOpenMobile}
      />

      <div className="space-y-6">
        {/* ------------------------- Seletor de cargos ------------------------- */}
        <SettingsCard
          title="Cargos"
          description="Selecione um cargo para editar as permissões dele."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {ROLES.map((r) => {
              const active = r.key === activeRole
              const count = countEnabled(r.key)
              return (
                <button
                  key={r.key}
                  onClick={() => setActiveRole(r.key)}
                  className={cn(
                    'flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors',
                    active
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-card-muted/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl',
                        active ? 'bg-primary/15 text-primary' : 'bg-card-muted text-muted',
                      )}
                    >
                      <r.icon className="h-5 w-5" />
                    </span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{r.label}</p>
                    <p className="mt-0.5 text-xs text-muted">{r.desc}</p>
                  </div>
                  <Badge tone={count > 0 ? 'info' : 'neutral'}>
                    {count} de {PERMISSIONS.length}
                  </Badge>
                </button>
              )
            })}
          </div>
        </SettingsCard>

        {/* ------------------------- Permissões do cargo ------------------------- */}
        <SettingsCard
          title={`Permissões · ${role.label}`}
          description="Ative o que este cargo pode fazer na plataforma."
          action={
            <div className="flex items-center gap-2">
              {dirty && (
                <Button size="sm" variant="ghost" onClick={discard}>
                  Descartar
                </Button>
              )}
              <Button size="sm" onClick={save} disabled={!dirty}>
                Salvar alterações
              </Button>
            </div>
          }
        >
          {dirty && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-chart-yellow/10 px-3.5 py-2.5 text-xs font-medium text-chart-yellow">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-chart-yellow" />
              Você tem alterações não salvas.
            </div>
          )}

          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="divide-y divide-border"
          >
            {PERMISSIONS.map((perm) => (
              <ToggleRow
                key={perm.id}
                icon={<perm.icon className="h-5 w-5" />}
                label={perm.label}
                description={perm.desc}
                checked={draft[activeRole][perm.id]}
                onChange={() => toggle(perm.id)}
              />
            ))}
          </motion.div>
        </SettingsCard>
      </div>

      {/* ------------------------------- Toast ------------------------------- */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-black/30"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-positive/10 text-positive">
            <Check className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-foreground">Permissões salvas com sucesso</p>
        </motion.div>
      )}
    </>
  )
}
