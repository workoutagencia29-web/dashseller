import { useEffect, useRef, useState } from 'react'

interface PullToRefreshState {
  /** distância puxada, em px (já com resistência aplicada) */
  pull: number
  /** dedo pressionado e puxando */
  active: boolean
  /** soltou além do threshold — atualizando */
  refreshing: boolean
}

/**
 * Pull-to-refresh: puxar pra baixo já no topo do scroll (scrollTop 0) além do
 * `threshold` e soltar dispara `onRefresh`. Feito pro mobile — o chamador passa
 * `enabled=false` no desktop, então nenhum listener de toque é registrado lá.
 * O estado fica isolado neste hook (o componente que o usa deve ser pequeno)
 * pra não re-renderizar a página inteira a cada frame do arraste.
 */
export function usePullToRefresh(
  ref: { current: HTMLElement | null },
  enabled: boolean,
  onRefresh: () => void,
  threshold = 72,
): PullToRefreshState {
  const [pull, setPull] = useState(0)
  const [active, setActive] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const s = useRef({ startY: 0, pulling: false, pull: 0, refreshing: false })

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return
    const st = s.current

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop <= 0 && !st.refreshing) {
        st.startY = e.touches[0].clientY
        st.pulling = true
        setActive(true)
      } else {
        st.pulling = false
      }
    }

    const onMove = (e: TouchEvent) => {
      if (!st.pulling || st.refreshing) return
      const dy = e.touches[0].clientY - st.startY
      if (dy > 0 && el.scrollTop <= 0) {
        e.preventDefault() // segura o scroll nativo enquanto puxa
        const dist = Math.min(dy * 0.5, 96) // resistência + teto
        st.pull = dist
        setPull(dist)
      } else if (st.pull !== 0) {
        st.pull = 0
        setPull(0)
      }
    }

    const onEnd = () => {
      if (!st.pulling) return
      st.pulling = false
      setActive(false)
      if (st.pull >= threshold) {
        st.refreshing = true
        setRefreshing(true)
        setPull(threshold)
        onRefresh()
      } else {
        st.pull = 0
        setPull(0)
      }
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd)
    el.addEventListener('touchcancel', onEnd)
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [ref, enabled, onRefresh, threshold])

  return { pull, active, refreshing }
}
