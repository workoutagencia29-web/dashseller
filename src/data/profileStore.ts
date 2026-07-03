import { useSyncExternalStore } from 'react'

/**
 * Store simples da foto de perfil (front-only, sem backend). Guarda o data URL
 * no localStorage e avisa todos os componentes que usam a foto (avatar do topo,
 * Perfil, Conta), então "Salvar" reflete no app inteiro e sobrevive ao reload.
 */
const KEY = 'nummo-profile-photo'
const listeners = new Set<() => void>()

function read(): string | null {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

let current: string | null = read()

export function setProfilePhoto(next: string | null) {
  current = next
  try {
    if (next) window.localStorage.setItem(KEY, next)
    else window.localStorage.removeItem(KEY)
  } catch {
    /* quota cheia ou modo privado — mantém em memória mesmo assim */
  }
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

/** Foto de perfil atual (data URL) ou null se usar o avatar padrão. */
export function useProfilePhoto(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => current,
  )
}
