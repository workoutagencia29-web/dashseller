import { useOutletContext } from 'react-router-dom'
import { Header } from '../components/Header'
import { StatsPanel } from '../components/StatsPanel'
import { TeamPerformanceChart } from '../components/TeamPerformanceChart'
import { LiveSales } from '../components/LiveSales'
import { TotalEmployeeDonut } from '../components/TotalEmployeeDonut'
import type { LayoutContext } from '../components/Layout'

export default function Dashboard() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  return (
    <>
      <Header title="Olá, Pristia" subtitle="Gestão da sua conta" onOpenMobile={onOpenMobile} />

      <div className="space-y-6">
        {/* Linha 1: stats + desempenho no mesmo card */}
        <section className="rounded-3xl border border-border bg-card">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
            <div className="xl:border-r xl:border-border">
              <StatsPanel />
            </div>
            <div className="p-6 sm:p-7">
              <TeamPerformanceChart />
            </div>
          </div>
        </section>

        {/* Linha 2: (card vazio + vendas ao vivo) | donut */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
          {/* coluna esquerda: card vazio em cima + vendas ao vivo (menor) embaixo */}
          <div className="flex flex-col gap-6">
            {/* card vazio — placeholder pra conteúdo futuro */}
            <div className="h-[360px] shrink-0 rounded-3xl border border-border bg-card" />
            <LiveSales className="h-[328px]" />
          </div>
          {/* coluna direita: donut (mais alto, ocupa a altura toda) */}
          <div className="rounded-3xl border border-border bg-card p-5 sm:p-6">
            <TotalEmployeeDonut />
          </div>
        </section>
      </div>
    </>
  )
}
