import { useOutletContext } from 'react-router-dom'
import { Construction } from 'lucide-react'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'

export function Placeholder({ title }: { title: string }) {
  const { onOpenMobile } = useOutletContext<LayoutContext>()

  return (
    <>
      <Header title={title} subtitle="Tela em construção" onOpenMobile={onOpenMobile} />

      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-primary">
          <Construction className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Esta tela ainda está em construção. Em breve o conteúdo de{' '}
          <span className="font-medium text-foreground">{title}</span> vai aparecer aqui.
        </p>
      </div>
    </>
  )
}
