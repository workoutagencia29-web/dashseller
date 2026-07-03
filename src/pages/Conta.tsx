import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { User, ShieldCheck, ArrowLeft } from 'lucide-react'
import { cn } from '../lib/utils'
import { ProfileSection, SecuritySection } from '../components/settings/ProfileSections'

const NAV = [
  {
    group: 'Perfil do Usuário',
    items: [
      { id: 'perfil', label: 'Dados Pessoais', icon: User },
      { id: 'seguranca', label: 'Segurança', icon: ShieldCheck },
    ],
  },
]

const ALL_IDS = NAV.flatMap((g) => g.items.map((i) => i.id))

export default function Conta() {
  const [activeId, setActiveId] = useState(ALL_IDS[0])

  useEffect(() => {
    const scroller = document.querySelector('main')
    const lastId = ALL_IDS[ALL_IDS.length - 1]
    // chegou no fim da página? (só conta se a página realmente rola)
    const atBottom = () =>
      !!scroller &&
      scroller.scrollHeight > scroller.clientHeight + 4 &&
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2

    const els = ALL_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const obs = new IntersectionObserver(
      (entries) => {
        // seções curtas no fim não alcançam a faixa do topo: ao bater no chão, ativa a última
        if (atBottom()) {
          setActiveId(lastId)
          return
        }
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-12% 0px -80% 0px', threshold: 0 },
    )
    els.forEach((el) => obs.observe(el))

    function onScroll() {
      if (atBottom()) setActiveId(lastId)
    }
    scroller?.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      obs.disconnect()
      scroller?.removeEventListener('scroll', onScroll)
    }
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
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">Conta</h1>
            <p className="mt-1 text-sm text-muted">Seus dados e preferências.</p>
          </div>

          {/* índice — só no desktop; no mobile as seções ficam empilhadas e o índice some */}
          <nav className="hidden space-y-5 lg:block">
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
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold text-muted transition-colors hover:border-primary/40 hover:bg-card-muted hover:text-foreground lg:mt-auto"
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
      </div>
    </div>
  )
}
