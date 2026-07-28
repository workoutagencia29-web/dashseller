import { createPortal } from 'react-dom'
import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Painel deslizante de baixo (mobile). Mesma anatomia do painel "Filtros" da
 * Relatório — handle, título, fechar, scroll interno travando o fundo.
 *
 * Follow-up: FilterSheet (reportsPrimitives.tsx), Produtos e LinkPagamento têm
 * sheets próprios com esta mesma estrutura; migrar todos pra cá fica pra depois,
 * fora do escopo do filtro de período.
 */
export function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    // trava o scroll do conteúdo atrás (o scroller é o <main>)
    const main = document.querySelector('main')
    const prev = main?.style.overflow
    if (main) main.style.overflow = 'hidden'

    // aria-modal esconde o resto pro leitor de tela: o foco precisa entrar aqui
    // e voltar pro gatilho ao fechar.
    const anterior = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      if (main) main.style.overflow = prev ?? ''
      anterior?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="sheet-max-h scrollbar-thin pb-sheet relative z-10 overflow-y-auto overscroll-contain rounded-t-3xl border-t border-border bg-card px-5 pt-3 outline-none animate-fade-in"
      >
        <div className="sticky top-0 z-10 -mx-5 mb-1 bg-card px-5 pb-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors active:bg-card-muted active:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
