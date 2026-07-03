import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { dominiosSeed, formatDominioDate, type Dominio } from './dominiosData'

/**
 * Store compartilhado dos domínios (sem backend). Config. domínio adiciona
 * na lista; Meus domínios lê e gerencia. Vive acima das rotas para persistir
 * entre navegações.
 */
interface DomainsContextValue {
  dominios: Dominio[]
  /** Adiciona um domínio (usado na tela Config. domínio ao clicar Atualizar). */
  addDominio: (domain: string) => void
  removeDominio: (id: number) => void
  setPrimary: (id: number) => void
  reverificar: (id: number) => void
}

const DomainsContext = createContext<DomainsContextValue | null>(null)

export function DomainsProvider({ children }: { children: ReactNode }) {
  const [dominios, setDominios] = useState<Dominio[]>(dominiosSeed)

  const setPrimary = useCallback((id: number) => {
    setDominios((list) => list.map((d) => ({ ...d, primary: d.id === id })))
  }, [])

  const removeDominio = useCallback((id: number) => {
    setDominios((list) => list.filter((d) => d.id !== id))
  }, [])

  const reverificar = useCallback((id: number) => {
    setDominios((list) => list.map((d) => (d.id === id ? { ...d, status: 'Verificando' } : d)))
    setTimeout(() => {
      setDominios((list) => list.map((d) => (d.id === id ? { ...d, status: 'Ativo' } : d)))
    }, 1800)
  }, [])

  const addDominio = useCallback(
    (raw: string) => {
      const clean = raw
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/^pay\./, '')
        .replace(/\/.*$/, '')
      if (!clean) return
      // já existe? não duplica (evita reentrar toda vez que clicar Atualizar)
      if (dominios.some((d) => d.domain === clean)) return

      const newId = Math.max(0, ...dominios.map((d) => d.id)) + 1
      const novo: Dominio = {
        id: newId,
        domain: clean,
        status: 'Verificando',
        primary: dominios.length === 0,
        addedAt: formatDominioDate(new Date()),
      }
      setDominios((list) => [novo, ...list])
      // simula a propagação do DNS: Verificando → Ativo
      setTimeout(() => {
        setDominios((list) => list.map((d) => (d.id === newId ? { ...d, status: 'Ativo' } : d)))
      }, 2200)
    },
    [dominios],
  )

  return (
    <DomainsContext.Provider value={{ dominios, addDominio, removeDominio, setPrimary, reverificar }}>
      {children}
    </DomainsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDomains() {
  const ctx = useContext(DomainsContext)
  if (!ctx) throw new Error('useDomains precisa estar dentro de <DomainsProvider>')
  return ctx
}
