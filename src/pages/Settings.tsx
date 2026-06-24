import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, ShieldCheck, Bell, Building2, Landmark, Users, BellRing, ArrowLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import {
  ProfileSection,
  SecuritySection,
  PersonalNotificationsSection,
} from '../components/settings/ProfileSections'
import {
  CompanySection,
  BankSection,
  TeamSection,
  AccountNotificationsSection,
} from '../components/settings/AccountSections'

const NAV = [
  {
    group: 'Perfil do Usuário',
    items: [
      { id: 'perfil', label: 'Dados Pessoais', icon: User },
      { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
      { id: 'notif-pessoais', label: 'Notificações', icon: Bell },
    ],
  },
  {
    group: 'Conta do seller',
    items: [
      { id: 'empresa', label: 'Empresa', icon: Building2 },
      { id: 'bancario', label: 'Dados Bancários', icon: Landmark },
      { id: 'equipe', label: 'Equipe', icon: Users },
      { id: 'notif-conta', label: 'Notificações da Conta', icon: BellRing },
    ],
  },
]

const ALL_IDS = NAV.flatMap((g) => g.items.map((i) => i.id))

export default function Settings() {
  const [activeId, setActiveId] = useState(ALL_IDS[0])

  useEffect(() => {
    const els = ALL_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-12% 0px -80% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* RAIL FIXO: título + índice + Voltar (não rola com o conteúdo) */}
      <aside className="lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] lg:self-start">
        <div className="scrollbar-thin flex h-full flex-col lg:overflow-y-auto">
          {/* título dentro do rail */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Configurações</h1>
            <p className="mt-1 text-sm text-muted">Gerencie seu perfil e a conta do seller.</p>
          </div>

          {/* índice */}
          <nav className="space-y-5">
            {NAV.map((group) => (
              <div key={group.group}>
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-faint">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const active = activeId === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => goTo(item.id)}
                        className={cn(
                          'flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors',
                          active
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted hover:bg-card-muted hover:text-foreground',
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Voltar pro Dashboard (rodapé do rail) */}
          <Link
            to="/"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:bg-card-muted hover:text-foreground lg:mt-auto"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Voltar
          </Link>
        </div>
      </aside>

      {/* CONTEÚDO que rola */}
      <div className="min-w-0 space-y-6">
        <ProfileSection />
        <SecuritySection />
        <PersonalNotificationsSection />
        <CompanySection />
        <BankSection />
        <TeamSection />
        <AccountNotificationsSection />
      </div>
    </div>
  )
}
