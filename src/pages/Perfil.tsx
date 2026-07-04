import { useNavigate } from 'react-router-dom'
import {
  User,
  Settings,
  Globe,
  Webhook,
  Headset,
  Sun,
  Moon,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react'
import { Avatar } from '../components/ui/Avatar'
import { useTheme } from '../context/ThemeContext'
import { useIsMobile } from '../hooks/useIsMobile'
import { useScrollCollapse } from '../hooks/useScrollCollapse'
import { useProfilePhoto } from '../data/profileStore'
import { useDomains } from '../data/dominiosStore'
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

/* -------------------- Card da grade (Conta/Config/etc) ----------------- */

interface HubCard {
  label: string
  sub: string
  icon: LucideIcon
  count?: number
  highlight?: boolean
  onClick: () => void
}

function HubCardTile({ card }: { card: HubCard }) {
  return (
    <button
      type="button"
      onClick={card.onClick}
      className={cn(
        'flex flex-col rounded-3xl border p-4 text-left transition-colors',
        card.highlight
          ? 'border-primary/60 bg-primary/10 shadow-[0_0_28px_-10px_rgb(47_107_255_/_0.6)]'
          : 'border-border bg-card active:bg-card-muted',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <card.icon className="h-[22px] w-[22px]" strokeWidth={2} />
        </span>
        {card.count !== undefined && (
          <span className="text-2xl font-bold leading-none text-foreground">{card.count}</span>
        )}
      </div>
      <p className="mt-4 font-bold text-foreground">{card.label}</p>
      <p className="mt-0.5 text-[13px] text-muted">{card.sub}</p>
    </button>
  )
}

export default function Perfil() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const isMobile = useIsMobile()
  const collapsed = useScrollCollapse(16, isMobile)
  const photo = useProfilePhoto()
  const { dominios } = useDomains()
  const activeDomains = dominios.filter((d) => d.status === 'Ativo').length

  const cards: HubCard[] = [
    { label: 'Conta', sub: 'Dados pessoais', icon: User, onClick: () => navigate('/conta') },
    { label: 'Config.', sub: 'Preferências', icon: Settings, onClick: () => navigate('/configuracoes') },
    {
      label: 'Meus domínios',
      sub: `${activeDomains} ativos`,
      icon: Globe,
      count: dominios.length,
      highlight: true,
      onClick: () => navigate('/produto/meus-dominios'),
    },
    { label: 'Webhooks', sub: '6 eventos', icon: Webhook, count: 6, onClick: () => navigate('/integracoes/webhooks') },
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
      <h1
        className={cn(
          'font-bold tracking-tight text-foreground',
          isMobile && 'sticky top-0 z-20 -mx-5 px-5 transition-all duration-300 sm:-mx-8 sm:px-8',
          isMobile && (collapsed ? 'border-b border-border bg-background/85 py-3 text-lg backdrop-blur-lg' : 'py-1 text-2xl'),
          !isMobile && 'text-2xl',
        )}
      >
        Perfil
      </h1>

      {/* cartão do usuário */}
      <button
        type="button"
        onClick={() => navigate('/conta')}
        className="flex w-full items-center gap-4 rounded-3xl border border-border bg-card p-4 text-left transition-colors active:bg-card-muted"
      >
        <Avatar name="Pedro Rossi" seed={31} size={60} src={photo ?? undefined} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-foreground">Pedro Rossi</p>
          <p className="truncate text-sm text-muted">pedro@nummo.com</p>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          Admin
        </span>
      </button>

      {/* grade de cards — Conta / Config / Meus domínios / Webhooks */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <HubCardTile key={c.label} card={c} />
        ))}
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

      {/* ajuda — card compacto, sem rótulo (mesmo tamanho do card "Sair") */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {ajuda.map((item) => (
          <Row key={item.label} item={item} />
        ))}
      </div>

      {/* logout */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <Row item={{ label: 'Sair da conta', icon: LogOut, danger: true, onClick: () => {} }} />
      </div>
    </div>
  )
}
