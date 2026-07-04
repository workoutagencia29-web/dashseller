import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Bell,
  Eye,
  EyeOff,
  ArrowUp,
  Box,
  ArrowUpFromLine,
  List,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react'
import { stats } from '../../data/mockData'
import { entradas, clients, type TxStatus } from '../../data/reportsData'
import { cn, formatCurrency } from '../../lib/utils'
import { useScrollCollapse } from '../../hooks/useScrollCollapse'
import { useProfilePhoto } from '../../data/profileStore'
import { Avatar } from '../ui/Avatar'
import { NotificationsModal } from '../NotificationsModal'

/* ----------------------------- topo (top bar) ------------------------- */

function TopBar({ collapsed, onSearch, onBell }: { collapsed: boolean; onSearch: () => void; onBell: () => void }) {
  const navigate = useNavigate()
  const photo = useProfilePhoto()
  return (
    <div
      className={cn(
        // fixa no topo e encolhe ao rolar (sensação de app); -mx-5 estende o blur de ponta a ponta
        'sticky top-0 z-30 -mx-5 flex items-center justify-between px-5 transition-all duration-300',
        collapsed
          ? 'border-b border-border bg-background/80 py-2.5 backdrop-blur-lg'
          : 'border-b border-transparent py-1.5',
      )}
    >
      <button
        type="button"
        onClick={() => navigate('/perfil')}
        aria-label="Abrir perfil"
        className={cn(
          'origin-left rounded-full transition-transform duration-300 active:opacity-80',
          collapsed && 'scale-[0.82]',
        )}
      >
        <Avatar name="Pedro Rossi" seed={31} size={44} src={photo ?? undefined} />
      </button>

      <div className="flex items-center gap-1.5">
        <IconButton icon={Search} label="Buscar" onClick={onSearch} />
        <IconButton icon={Bell} label="Notificações" onClick={onBell} dot />
      </div>
    </div>
  )
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  dot,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  dot?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-card-muted active:bg-card-muted"
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
      {dot && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />}
    </button>
  )
}

/* -------------------------- card de saldo (mapa) ---------------------- */

function BalanceCard() {
  const navigate = useNavigate()
  const [hidden, setHidden] = useState(false)
  const saldo = stats.find((s) => s.id === 'saldo')?.value ?? 0
  const delta = stats.find((s) => s.id === 'saldo')?.delta ?? 0

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 shadow-glow"
      style={{ background: 'linear-gradient(135deg, #15347f 0%, #2153c9 52%, #2f6bff 100%)' }}
    >
      {/* mapa-múndi (marca d'água) — mesma máscara do card do desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundColor: '#ffffff',
          opacity: 0.12,
          WebkitMaskImage: 'url(/world-map.svg)',
          maskImage: 'url(/world-map.svg)',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'cover',
          maskSize: 'cover',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/80">Saldo Disponível</p>
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Mostrar saldo' : 'Ocultar saldo'}
            className="-mr-1 -mt-1 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white/90 backdrop-blur-sm transition-colors hover:bg-white/20 active:bg-white/20"
          >
            {hidden ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        </div>

        <p className="mt-2 text-[38px] font-bold leading-none tracking-tight text-white">
          {hidden ? 'R$ ••••••' : formatCurrency(saldo)}
        </p>

        <div className="mt-4 flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[13px] font-semibold text-emerald-300">
            <ArrowUp className="h-3.5 w-3.5" strokeWidth={2.5} />
            {delta.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
          </span>
          <span className="text-sm text-white/60">últimos 7 dias</span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/financeiro/geral', { state: { openSaque: true } })}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-background py-3 text-sm font-bold uppercase tracking-wide text-foreground shadow-lg shadow-black/25 transition-colors hover:bg-card-muted active:bg-card-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:bg-[#0a1020] dark:text-white dark:hover:bg-[#111a33] dark:focus-visible:ring-white/40"
        >
          <ArrowUpFromLine className="h-4 w-4" />
          Solicitar saque
        </button>
      </div>
    </div>
  )
}

/* --------------------------- ações rápidas ---------------------------- */

interface QuickAction {
  label: string
  icon: LucideIcon
  onClick: () => void
  soon?: boolean
}

function QuickActions({ onSoon }: { onSoon: (label: string) => void }) {
  const navigate = useNavigate()
  const actions: QuickAction[] = [
    { label: 'Planos', icon: Box, soon: true, onClick: () => onSoon('Planos') },
    { label: 'Sacar', icon: ArrowUp, onClick: () => navigate('/financeiro/geral', { state: { openSaque: true } }) },
    { label: 'Extrato', icon: List, onClick: () => navigate('/financeiro/geral') },
    { label: 'Mais', icon: LayoutGrid, soon: true, onClick: () => onSoon('Mais') },
  ]

  return (
    <div className="grid grid-cols-4 gap-2 rounded-3xl border border-border bg-card p-3 shadow-glow">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          onClick={a.onClick}
          className="flex flex-col items-center gap-2 rounded-2xl px-1 py-2 transition-colors active:bg-card-muted"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card-muted text-foreground">
            <a.icon className="h-5 w-5" strokeWidth={2} />
          </span>
          <span className="text-xs font-medium text-muted">{a.label}</span>
        </button>
      ))}
    </div>
  )
}

/* ------------------------ transações recentes ------------------------- */

const STATUS_MAP: Record<TxStatus, { label: string; dot: string; text: string; struck: boolean }> = {
  Aprovado: { label: 'Pago', dot: 'bg-emerald-500', text: 'text-emerald-500', struck: false },
  Pendente: { label: 'Pendente', dot: 'bg-amber-500', text: 'text-amber-500', struck: false },
  Estornado: { label: 'Reembolsado', dot: 'bg-faint', text: 'text-faint', struck: true },
  Bloqueado: { label: 'Bloqueado', dot: 'bg-negative', text: 'text-negative', struck: false },
  Chargeback: { label: 'Chargeback', dot: 'bg-negative', text: 'text-negative', struck: false },
}

function clientOf(id: number) {
  return clients.find((c) => c.id === id)
}

function RecentTransactions() {
  const navigate = useNavigate()
  const rows = entradas.slice(0, 6)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Transações Recentes</h2>
        <button
          type="button"
          onClick={() => navigate('/relatorio/entradas')}
          className="text-sm font-semibold text-primary active:opacity-80"
        >
          Ver todas
        </button>
      </div>

      <div className="divide-y divide-border/60 rounded-3xl border border-border bg-card px-4">
        {rows.map((e) => {
          const c = clientOf(e.clientId)
          const st = STATUS_MAP[e.status]
          return (
            <div key={e.id} className="flex items-center gap-3 py-3.5">
              <Avatar name={c?.name ?? 'Cliente'} seed={c?.avatarSeed ?? e.id} size={40} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{c?.name ?? 'Cliente'}</p>
                <p className="truncate text-[13px] text-muted">{e.product}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className={cn('font-bold', st.struck ? 'text-faint line-through' : 'text-foreground')}>
                  {formatCurrency(e.value)}
                </p>
                <p className={cn('mt-0.5 flex items-center justify-end gap-1.5 text-xs font-medium', st.text)}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
                  {st.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------- toast -------------------------------- */

function Toast({ msg }: { msg: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4">
      <div className="rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-xl shadow-black/30">
        {msg}
      </div>
    </div>
  )
}

/* -------------------------------- home -------------------------------- */

export function MobileHome() {
  const [notifOpen, setNotifOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const collapsed = useScrollCollapse(16)

  function showSoon(label: string) {
    setToast(`${label} — em breve`)
    window.setTimeout(() => setToast(null), 1800)
  }

  return (
    <div className="space-y-6 pb-2">
      <TopBar collapsed={collapsed} onSearch={() => showSoon('Busca')} onBell={() => setNotifOpen(true)} />
      <BalanceCard />
      <QuickActions onSoon={showSoon} />
      <RecentTransactions />

      {notifOpen && <NotificationsModal onClose={() => setNotifOpen(false)} />}
      {toast && <Toast msg={toast} />}
    </div>
  )
}
