import { Link2 } from 'lucide-react'
import { Badge } from '../settings/primitives'

export function LinkPagamentoTab() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card-muted text-primary">
        <Link2 className="h-8 w-8" />
      </div>
      <div className="mt-5 flex items-center gap-2">
        <h2 className="text-xl font-bold text-foreground">Link de Pagamento</h2>
        <Badge tone="info">Em breve</Badge>
      </div>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Esta funcionalidade está planejada para uma versão futura do nummo. Em breve você poderá gerar links de cobrança por aqui.
      </p>
    </div>
  )
}
