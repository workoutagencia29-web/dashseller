import { useEffect, useState } from 'react'

/** Abaixo do breakpoint `lg` (1024px) do Tailwind — onde a experiência vira app-like. */
const MOBILE_QUERY = '(max-width: 1023.98px)'

/**
 * Retorna `true` quando a viewport está no tamanho mobile (< lg). Inicializa de
 * forma síncrona a partir do matchMedia (SPA, sem SSR) pra não ter "flash" de
 * layout, e reage a resize/rotação. Usado só pra decidir o que renderizar no
 * mobile — o desktop nunca é afetado.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false,
  )

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
