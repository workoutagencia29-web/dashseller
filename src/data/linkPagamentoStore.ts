import { useSyncExternalStore } from 'react'
import {
  linksSeed,
  randomSlug,
  formatLinkDate,
  type PaymentLink,
  type LinkCobranca,
  type LinkFreq,
} from './linkPagamentoData'

/**
 * Store dos links de pagamento (front-only, sem backend). Guarda a lista no
 * localStorage e avisa os componentes — criar/copiar reflete na hora e
 * sobrevive ao reload. Mesmo padrão do produtosStore/profileStore.
 * (A aba do Financeiro no desktop tem a sua própria lista e não é afetada.)
 */
const KEY = 'nummo-payment-links'
const listeners = new Set<() => void>()

function read(): PaymentLink[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as PaymentLink[]
    }
  } catch {
    /* json inválido ou modo privado — cai no seed */
  }
  return linksSeed
}

let current: PaymentLink[] = read()

function commit(next: PaymentLink[]) {
  current = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* quota cheia / modo privado — mantém em memória mesmo assim */
  }
  listeners.forEach((l) => l())
}

/** Campos que o formulário mobile coleta (o resto ganha default). */
export interface LinkInput {
  titulo: string
  valor: number
  cobranca: LinkCobranca
  frequencia?: LinkFreq
  metodos: { pix: boolean; cartao: boolean; boleto: boolean }
}

export function addLink(input: LinkInput): PaymentLink {
  const id = Math.max(0, ...current.map((l) => l.id)) + 1
  const novo: PaymentLink = {
    id,
    slug: randomSlug(),
    titulo: input.titulo,
    tipo: 'Avulso',
    cobranca: input.cobranca,
    frequencia: input.cobranca === 'Assinatura' ? input.frequencia ?? 'Mensal' : undefined,
    valor: input.valor,
    valorAberto: false,
    metodos: input.metodos,
    parcelas: input.metodos.cartao ? 12 : 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 0,
    pagamentos: 0,
    criadoEm: formatLinkDate(new Date()),
    status: 'Ativo',
  }
  commit([novo, ...current])
  return novo
}

export function removeLink(id: number) {
  commit(current.filter((l) => l.id !== id))
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Lista reativa de links de pagamento. */
export function useLinks(): PaymentLink[] {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  )
}
