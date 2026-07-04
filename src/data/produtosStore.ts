import { useSyncExternalStore } from 'react'
import { produtosSeed, formatProdutoDate, type Produto } from './produtosData'

/**
 * Store dos produtos (front-only, sem backend). Guarda a lista no localStorage
 * e avisa todos os componentes — criar/editar/excluir/ativar reflete na hora e
 * sobrevive ao reload. Segue o mesmo padrão do profileStore.
 */
const KEY = 'nummo-produtos'
const listeners = new Set<() => void>()

function read(): Produto[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Produto[]
    }
  } catch {
    /* json inválido ou modo privado — cai no seed */
  }
  return produtosSeed
}

let current: Produto[] = read()

function commit(next: Produto[]) {
  current = next
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    /* quota cheia / modo privado — mantém em memória mesmo assim */
  }
  listeners.forEach((l) => l())
}

/** Campos que o usuário edita (o resto é derivado/automático). */
export type ProdutoInput = Pick<Produto, 'nome' | 'descricao' | 'preco' | 'tipo' | 'slug' | 'ativo'>

export function addProduto(input: ProdutoInput) {
  const id = Math.max(0, ...current.map((p) => p.id)) + 1
  const novo: Produto = { ...input, id, vendas: 0, criadoEm: formatProdutoDate(new Date()) }
  commit([novo, ...current])
}

export function updateProduto(id: number, patch: Partial<ProdutoInput>) {
  commit(current.map((p) => (p.id === id ? { ...p, ...patch } : p)))
}

export function removeProduto(id: number) {
  commit(current.filter((p) => p.id !== id))
}

export function toggleProduto(id: number) {
  commit(current.map((p) => (p.id === id ? { ...p, ativo: !p.ativo } : p)))
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Lista reativa de produtos. */
export function useProdutos(): Produto[] {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  )
}
