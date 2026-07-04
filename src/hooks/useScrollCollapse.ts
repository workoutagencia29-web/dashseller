import { useEffect, useState } from 'react'

/**
 * Retorna `true` quando o scroller (o `<main>`) passou de `threshold` px — usado
 * pra "encolher" cabeçalhos no mobile conforme rola, dando a sensação de app.
 * Debounced via rAF e só re-renderiza quando CRUZA o limiar (não a cada frame),
 * então o scroll continua leve. Com `enabled=false` (desktop) não registra
 * listener e mantém `false`, deixando o desktop intacto.
 *
 * No iOS o topo faz "rubber-band" (scrollTop momentaneamente negativo/oscilando):
 * por isso clampamos em 0 e usamos histerese (colapsa acima de `threshold`, só
 * expande abaixo de metade dele) — assim o cabeçalho não fica piscando ao rolar.
 */
export function useScrollCollapse(threshold = 16, enabled = true): boolean {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setCollapsed(false)
      return
    }
    const scroller = document.querySelector('main')
    if (!scroller) return

    let raf = 0
    const update = () => {
      const y = Math.max(0, scroller.scrollTop) // ignora o overscroll negativo do iOS
      setCollapsed((prev) => {
        if (!prev && y > threshold) return true
        if (prev && y < threshold * 0.5) return false // banda morta evita flicker no limiar
        return prev
      })
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [threshold, enabled])

  return collapsed
}
