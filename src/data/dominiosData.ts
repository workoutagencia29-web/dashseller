/* ------------------------------ Domínios ------------------------------ */
/* Domínios de checkout apontados para a infra da Nummo (via CNAME).      */
/* Tudo mock — não há backend.                                            */

export type DominioStatus = 'Ativo' | 'Verificando' | 'Erro'

export interface Dominio {
  id: number
  /** Domínio base apontado pelo seller (o checkout fica em pay.{domain}). */
  domain: string
  status: DominioStatus
  primary: boolean
  addedAt: string
}

/** Destino fixo do CNAME (mesma infra da tela Config. domínio). */
export const CNAME_TARGET = 'pay.nummo.cloud'

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

/** Formata uma data como "02 jul 2026" (pt-BR curto, sem "de"). */
export function formatDominioDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

export const dominiosSeed: Dominio[] = [
  { id: 1, domain: 'minhaloja.com.br', status: 'Ativo', primary: true, addedAt: '04 fev 2026' },
  { id: 2, domain: 'cursosonline.com', status: 'Ativo', primary: false, addedAt: '21 mar 2026' },
  { id: 3, domain: 'mentoriapro.com.br', status: 'Verificando', primary: false, addedAt: '28 jun 2026' },
  { id: 4, domain: 'checkoutvip.io', status: 'Erro', primary: false, addedAt: '15 jun 2026' },
]

export const NEXT_DOMINIO_ID = dominiosSeed.reduce((max, d) => Math.max(max, d.id), 0) + 1
