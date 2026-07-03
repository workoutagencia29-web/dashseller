import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  Globe,
  Headset,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { useTheme } from '../context/ThemeContext'
import { cn } from '../lib/utils'

/**
 * Hub "Perfil" — só faz sentido no mobile (é uma das abas da bottom nav). Reúne
 * as áreas de conta que não cabem na barra: Conta, Configurações, Meus domínios,
 * suporte, tema e logout. No desktop essa rota não é linkada em lugar nenhum.
 */
interface RowItem {
  label: string
  icon: LucideIcon
  onClick: () => void
  danger?: boolean
}

function Row({ item }: { item: RowItem }) {
  return (
    <button
      type="button"
      onClick={item.onClick}
      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-card-muted"
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          item.danger ? 'bg-negative/10 text-negative' : 'bg-card-muted text-foreground',
        )}
      >
        <item.icon className="h-5 w-5" strokeWidth={2} />
      </span>
      <span className={cn('flex-1 font-medium', item.danger ? 'text-negative' : 'text-foreground')}>
        {item.label}
      </span>
      {!item.danger && <ChevronRight className="h-5 w-5 shrink-0 text-faint" />}
    </button>
  )
}

export default function Perfil() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  const conta: RowItem[] = [
    { label: 'Conta', icon: User, onClick: () => navigate('/conta') },
    { label: 'Configurações', icon: Settings, onClick: () => navigate('/configuracoes') },
    { label: 'Meus domínios', icon: Globe, onClick: () => navigate('/produto/meus-dominios') },
  ]
  const ajuda: RowItem[] = [
    {
      label: 'Suporte & Gerente',
      icon: Headset,
      onClick: () => window.open('https://wa.me/5511912002801', '_blank', 'noopener,noreferrer'),
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Perfil</h1>

      {/* cartão do usuário */}
      <button
        type="button"
        onClick={() => navigate('/conta')}
        className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left transition-colors active:bg-card-muted"
      >
        <Avatar name="Pedro Rossi" seed={31} size={60} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">Pedro Rossi</p>
          <p className="truncate text-sm text-muted">pedro@nummo.com</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          Admin
        </span>
      </button>

      {/* conta */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-faint">Conta</p>
        <div className="mt-1 divide-y divide-border/60">
          {conta.map((item) => (
            <Row key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* tema */}
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-faint">Aparência</p>
        <div className="mt-3 flex items-center gap-1 rounded-2xl bg-card-muted p-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors',
              theme === 'light' ? 'bg-card text-foreground shadow-sm' : 'text-muted',
            )}
          >
            <Sun className="h-4 w-4" /> Claro
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors',
              theme === 'dark' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted',
            )}
          >
            <Moon className="h-4 w-4" /> Escuro
          </button>
        </div>
      </div>

      {/* ajuda */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <p className="px-4 pt-4 text-xs font-semibold uppercase tracking-wide text-faint">Ajuda</p>
        <div className="mt-1 divide-y divide-border/60">
          {ajuda.map((item) => (
            <Row key={item.label} item={item} />
          ))}
        </div>
      </div>

      {/* logout */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <Row item={{ label: 'Sair da conta', icon: LogOut, danger: true, onClick: () => {} }} />
      </div>
    </div>
  )
}
