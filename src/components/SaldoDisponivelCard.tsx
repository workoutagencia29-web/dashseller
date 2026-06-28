import { useNavigate } from 'react-router-dom'
import { ArrowUpFromLine } from 'lucide-react'
import { stats } from '../data/mockData'
import { cn, formatCurrency } from '../lib/utils'

/**
 * Card "Meu saldo disponível" do Dashboard: fundo azul em degradê com o
 * mapa-múndi como marca d'água (máscara recolorida) e botão de saque.
 * O valor é o mesmo "Saldo Disponível" dos stats. O botão leva pra
 * Financeiro → Geral já abrindo o modal de solicitar saque.
 */
export function SaldoDisponivelCard({ className }: { className?: string }) {
  const navigate = useNavigate()
  const saldo = stats.find((s) => s.id === 'resigned')?.value ?? 0

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 sm:p-8',
        className,
      )}
      style={{ background: 'linear-gradient(135deg, #15347f 0%, #2153c9 52%, #2f6bff 100%)' }}
    >
      {/* mapa-múndi (marca d'água): a máscara usa o SVG e pintamos de branco */}
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

      {/* topo: label + valor + logo */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
            Meu saldo disponível
          </p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {formatCurrency(saldo)}
          </p>
        </div>
        {/* logo "N" da Nummo */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-2xl font-extrabold text-white ring-1 ring-white/20 backdrop-blur-sm">
          N
        </div>
      </div>

      {/* botão de saque */}
      <button
        type="button"
        onClick={() => navigate('/financeiro/geral', { state: { openSaque: true } })}
        className="relative z-10 mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0a1020] py-4 text-base font-bold uppercase tracking-wide text-white shadow-lg shadow-black/25 transition-colors hover:bg-[#111a33] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <ArrowUpFromLine className="h-4 w-4" />
        Solicitar saque
      </button>
    </div>
  )
}
