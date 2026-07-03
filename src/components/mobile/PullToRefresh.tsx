import { useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { usePullToRefresh } from '../../hooks/usePullToRefresh'
import { cn } from '../../lib/utils'

const THRESHOLD = 72

/**
 * Indicador de pull-to-refresh (só mobile). Recebe o elemento de scroll (o
 * <main> do Layout) e desenha um spinner que desce conforme o arraste; ao
 * soltar além do threshold, recarrega a página. O estado do gesto vive aqui
 * (componente minúsculo), então o arraste não re-renderiza o conteúdo da página.
 */
export function PullToRefresh({
  scrollRef,
  enabled,
}: {
  scrollRef: { current: HTMLElement | null }
  enabled: boolean
}) {
  const onRefresh = useCallback(() => {
    // pequeno atraso só pra o spinner aparecer antes do reload
    window.setTimeout(() => window.location.reload(), 600)
  }, [])

  const { pull, active, refreshing } = usePullToRefresh(scrollRef, enabled, onRefresh, THRESHOLD)

  if (!enabled || (pull <= 0 && !refreshing)) return null

  const y = (refreshing ? THRESHOLD : pull) * 0.6

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-1/2 top-0 z-[60] lg:hidden"
      style={{
        transform: `translate(-50%, ${y}px)`,
        opacity: refreshing ? 1 : Math.min(1, pull / 40),
        transition: active ? 'none' : 'transform 0.25s ease, opacity 0.2s ease',
      }}
    >
      <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-lg shadow-black/25">
        <RefreshCw
          className={cn('h-5 w-5 text-primary', refreshing && 'animate-spin')}
          style={refreshing ? undefined : { transform: `rotate(${Math.round(pull * 3)}deg)` }}
        />
      </div>
    </div>
  )
}
