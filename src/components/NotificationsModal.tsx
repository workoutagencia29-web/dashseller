import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import {
  X,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldAlert,
  Target,
  ArrowUpFromLine,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '../lib/utils'

type NotifTone = 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface Notificacao {
  id: number
  icon: LucideIcon
  tone: NotifTone
  title: string
  desc: string
  time: string
  unread?: boolean
}

/** Notificações mock (sem backend) — vendas, disputas, saques e metas. */
const NOTIFICACOES: Notificacao[] = [
  { id: 1, icon: CheckCircle2, tone: 'success', title: 'Venda aprovada', desc: 'R$ 297,00 · Curso de Tráfego Pago', time: 'há 4 min', unread: true },
  { id: 2, icon: Clock, tone: 'warning', title: 'Pagamento pendente', desc: 'R$ 497,00 · Mentoria Premium — aguardando Pix', time: 'há 26 min', unread: true },
  { id: 3, icon: ShieldAlert, tone: 'danger', title: 'Nova disputa (MED)', desc: 'R$ 197,00 · Ebook Copywriting — responda em até 7 dias', time: 'há 1 h', unread: true },
  { id: 4, icon: Target, tone: 'primary', title: 'Meta de faturamento batida', desc: 'Você atingiu R$ 250 mil no mês. Parabéns!', time: 'há 3 h' },
  { id: 5, icon: ArrowUpFromLine, tone: 'info', title: 'Saque concluído', desc: 'R$ 12.000,00 enviados para Nubank · Conta 4471', time: 'ontem' },
  { id: 6, icon: XCircle, tone: 'danger', title: 'Venda recusada', desc: 'R$ 89,90 · Planilha de Gestão — cartão negado', time: 'ontem' },
]

const TONES: Record<NotifTone, string> = {
  success: 'bg-positive/15 text-positive',
  warning: 'bg-amber-500/15 text-amber-500',
  danger: 'bg-negative/15 text-negative',
  info: 'bg-sky-500/15 text-sky-500',
  primary: 'bg-primary/15 text-primary',
}

export function NotificationsModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // trava o scroll do conteúdo atrás do popup (o scroller é o <main>)
    const scroller = document.querySelector('main')
    if (scroller) scroller.style.overflow = 'hidden'

    // bloqueia qualquer rolagem no fundo/overlay — só a lista interna pode rolar
    const overlay = overlayRef.current
    function blockScroll(e: Event) {
      if (listRef.current && listRef.current.contains(e.target as Node)) return
      e.preventDefault()
    }
    overlay?.addEventListener('wheel', blockScroll, { passive: false })
    overlay?.addEventListener('touchmove', blockScroll, { passive: false })

    return () => {
      document.removeEventListener('keydown', onKey)
      if (scroller) scroller.style.overflow = ''
      overlay?.removeEventListener('wheel', blockScroll)
      overlay?.removeEventListener('touchmove', blockScroll)
    }
  }, [onClose])

  const unreadCount = NOTIFICACOES.filter((n) => n.unread).length

  return createPortal(
    <div ref={overlayRef} className="fixed inset-0 z-[80] flex items-start justify-center p-4 pt-20 sm:pt-24" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative z-10 flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-fade-in">
        {/* cabeçalho fixo */}
        <div className="flex items-start justify-between gap-3 border-b border-border p-6 sm:p-7">
          <div>
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
              <span className="h-5 w-1.5 shrink-0 rounded-full bg-primary" />
              Notificações
            </h3>
            <p className="mt-1.5 text-sm text-muted">
              {unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia por aqui.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted transition-colors hover:bg-card-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* lista rolável */}
        <div ref={listRef} className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto overscroll-contain p-4 sm:p-5">
          {NOTIFICACOES.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-2xl border border-border p-3.5 transition-colors',
                n.unread ? 'bg-card-muted/40' : 'bg-transparent',
              )}
            >
              <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', TONES[n.tone])}>
                <n.icon className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{n.title}</p>
                  {n.unread && <span className="mt-1.5 h-2 w-2 shrink-0 self-start rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 text-sm text-muted">{n.desc}</p>
                <p className="mt-1 text-xs text-faint">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
