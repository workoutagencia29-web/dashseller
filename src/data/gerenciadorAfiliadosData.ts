/**
 * Gerenciador de afiliados — dataset próprio (mais rico que o de "Meus Afiliados").
 * Mock, sem backend. Inclui status do programa, vínculos de produto com comissão,
 * link individual, cupom, histórico de alterações e notas internas.
 */

export type AfiliadoStatus = 'Ativo' | 'Pendente' | 'Convite enviado' | 'Pausado' | 'Bloqueado'
export type CommissionType = 'percent' | 'fixed'

/** Produto que o afiliado pode divulgar + a comissão definida para ele. */
export interface Vinculo {
  product: string
  commissionType: CommissionType
  /** % (5..25) quando 'percent'; R$ (20..120) quando 'fixed'. */
  commissionValue: number
  /** Link individual de divulgação desse produto. */
  link: string
  /** Cupom exclusivo, quando houver. */
  coupon?: string
}

export interface HistoricoItem {
  id: number
  action: string
  /** Já formatado em pt-BR (dd/mm/aaaa). */
  date: string
}

export interface NotaInterna {
  id: number
  author: string
  text: string
  /** Já formatado em pt-BR (dd/mm/aaaa). */
  date: string
}

export interface AfiliadoGerenciado {
  id: number
  name: string
  email: string
  document: string
  phone: string
  seed: number
  status: AfiliadoStatus
  /** Link pessoal do afiliado (genérico, não por produto). */
  link: string
  vinculos: Vinculo[]
  entryDate: Date
  lastActivity: Date
  history: HistoricoItem[]
  notes: NotaInterna[]
}

/* ------------------------------ Helpers ------------------------------- */

/** PRNG determinístico — mesma saída a cada load (evita Math.random no módulo). */
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const DAY = 86_400_000
/** "Hoje" fixo (= data do sistema) para gerar datas estáveis. */
const TODAY = new Date(2026, 5, 30)
const daysAgo = (n: number) => new Date(TODAY.getTime() - n * DAY)
const fmtDate = (d: Date) => d.toLocaleDateString('pt-BR')

export const PRODUCT_POOL = [
  'Plano Pro Mensal',
  'Mentoria Premium',
  'Assinatura Black',
  'Clube de Conteúdo',
  'Software CRM',
  'Plano Starter',
  'Plano Anual',
  'Curso Avançado',
]

const COUPON_POOL = ['BLACK10', 'PRO15', 'VIP20', 'MENTOR5', 'CRMOFF', 'START10', 'ANUAL12', 'CURSO8']
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']
const NOTE_AUTHORS = ['Você', 'Jorge Mendes', 'Marina Alves']
const NOTE_TEXTS = [
  'Parceiro com bom volume no último mês.',
  'Pediu material de divulgação atualizado.',
  'Atenção: validar a origem do tráfego.',
  'Top performer — considerar aumentar a comissão.',
  'Respondeu rápido no onboarding.',
  'Solicitou cupom exclusivo para a base dele.',
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

/** Link de divulgação curto e estável a partir de uma chave + produto. */
export function referralFor(key: string | number, product: string): string {
  const code = Math.abs(hash(`${key}::${product}`)).toString(36).slice(0, 8)
  return `https://pay.nummo.cloud/r/${code}`
}

function emailFor(name: string, i: number): string {
  const parts = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(' ')
  return `${parts[0]}.${parts[parts.length - 1]}@${DOMAINS[i % DOMAINS.length]}`
}

function cpfFor(i: number): string {
  const base = String(Math.floor(seeded(i) * 1e9)).padStart(9, '0').slice(0, 9)
  const dv = String(Math.floor(seeded(i + 1) * 100)).padStart(2, '0')
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${dv}`
}

function phoneFor(i: number): string {
  const ddd = 11 + Math.floor(seeded(i * 2.3) * 88)
  const a = String(90000 + Math.floor(seeded(i * 3.1) * 9999)).slice(0, 5)
  const b = String(1000 + Math.floor(seeded(i * 4.7) * 8999)).slice(0, 4)
  return `(${ddd}) ${a}-${b}`
}

function buildVinculos(id: number, status: AfiliadoStatus): Vinculo[] {
  const max = status === 'Convite enviado' ? 2 : status === 'Pendente' ? 3 : 4
  const count = 1 + Math.floor(seeded(id * 3.1) * max)
  return Array.from({ length: count }, (_, j) => {
    const product = PRODUCT_POOL[(id + j) % PRODUCT_POOL.length]
    const isFixed = seeded(id * 7 + j * 1.7) > 0.72
    const commissionType: CommissionType = isFixed ? 'fixed' : 'percent'
    const commissionValue = isFixed
      ? 20 + Math.round(seeded(id * 9 + j) * 100) // R$ 20..120
      : 5 + Math.round(seeded(id * 11 + j) * 20) // 5..25 %
    const hasCoupon = seeded(id * 13 + j) > 0.6
    return {
      product,
      commissionType,
      commissionValue,
      link: referralFor(id, product),
      coupon: hasCoupon ? COUPON_POOL[(id + j) % COUPON_POOL.length] : undefined,
    }
  })
}

function buildDates(id: number, status: AfiliadoStatus): { entryDate: Date; lastActivity: Date } {
  if (status === 'Pendente' || status === 'Convite enviado') {
    const entry = daysAgo(1 + Math.floor(seeded(id * 5) * 20)) // 1..21 dias
    return { entryDate: entry, lastActivity: entry }
  }
  const entry = daysAgo(60 + Math.floor(seeded(id * 5) * 540)) // 60..600 dias
  const last =
    status === 'Pausado' || status === 'Bloqueado'
      ? daysAgo(20 + Math.floor(seeded(id * 6) * 80)) // parado há mais tempo
      : daysAgo(Math.floor(seeded(id * 6) * 22)) // ativo: 0..22 dias
  return { entryDate: entry, lastActivity: last }
}

function buildHistory(
  id: number,
  status: AfiliadoStatus,
  vinculos: Vinculo[],
  entryDate: Date,
  lastActivity: Date,
): HistoricoItem[] {
  const items: { action: string; d: Date }[] = []

  if (status === 'Pendente') {
    items.push({ action: 'Solicitou participação no programa de afiliados', d: entryDate })
  } else if (status === 'Convite enviado') {
    items.push({ action: 'Convite de afiliado enviado', d: entryDate })
  } else {
    items.push({ action: 'Entrou no programa de afiliados', d: entryDate })
    if (vinculos[0]) items.push({ action: `Produto “${vinculos[0].product}” vinculado`, d: daysAgo(Math.floor(seeded(id * 31) * 400) + 30) })
    if (vinculos[1]) items.push({ action: `Comissão de “${vinculos[1].product}” ajustada`, d: daysAgo(Math.floor(seeded(id * 37) * 200) + 10) })
    if (status === 'Pausado') items.push({ action: 'Afiliado pausado', d: lastActivity })
    if (status === 'Bloqueado') items.push({ action: 'Afiliado bloqueado', d: lastActivity })
  }

  return items
    .sort((a, b) => b.d.getTime() - a.d.getTime())
    .map((x, i) => ({ id: i + 1, action: x.action, date: fmtDate(x.d) }))
}

function buildNotes(id: number): NotaInterna[] {
  if (seeded(id * 17) < 0.5) return []
  const n = 1 + Math.floor(seeded(id * 19) * 2) // 1..2
  return Array.from({ length: n }, (_, j) => ({
    id: j + 1,
    author: NOTE_AUTHORS[(id + j) % NOTE_AUTHORS.length],
    text: NOTE_TEXTS[(id * 2 + j) % NOTE_TEXTS.length],
    date: fmtDate(daysAgo(3 + Math.floor(seeded(id * 23 + j) * 40))),
  }))
}

function build(id: number, name: string, status: AfiliadoStatus): AfiliadoGerenciado {
  const vinculos = buildVinculos(id, status)
  const { entryDate, lastActivity } = buildDates(id, status)
  return {
    id,
    name,
    email: emailFor(name, id),
    document: cpfFor(id),
    phone: phoneFor(id),
    seed: (id * 7 + 3) % 70,
    status,
    link: referralFor(id, 'afiliado'),
    vinculos,
    entryDate,
    lastActivity,
    history: buildHistory(id, status, vinculos, entryDate, lastActivity),
    notes: buildNotes(id),
  }
}

/* ---------------------- Sementes (nome + status) --------------------- */

const SEEDS: { name: string; status: AfiliadoStatus }[] = [
  // Ativos
  { name: 'Lucas Pereira', status: 'Ativo' },
  { name: 'Bianca Costa', status: 'Ativo' },
  { name: 'Rafael Dias', status: 'Ativo' },
  { name: 'Camila Souza', status: 'Ativo' },
  { name: 'Fernanda Almeida', status: 'Ativo' },
  { name: 'Gabriel Rocha', status: 'Ativo' },
  { name: 'Juliana Martins', status: 'Ativo' },
  { name: 'Thiago Barbosa', status: 'Ativo' },
  { name: 'Mariana Ribeiro', status: 'Ativo' },
  { name: 'Gustavo Carvalho', status: 'Ativo' },
  { name: 'Aline Cardoso', status: 'Ativo' },
  { name: 'Rodrigo Teixeira', status: 'Ativo' },
  // Solicitações pendentes
  { name: 'Beatriz Moraes', status: 'Pendente' },
  { name: 'Felipe Araújo', status: 'Pendente' },
  { name: 'Carolina Mendes', status: 'Pendente' },
  { name: 'Eduardo Ramos', status: 'Pendente' },
  // Convites enviados
  { name: 'Vanessa Pinto', status: 'Convite enviado' },
  { name: 'Marcelo Nunes', status: 'Convite enviado' },
  { name: 'Renata Lopes', status: 'Convite enviado' },
  { name: 'Vinícius Moreira', status: 'Convite enviado' },
  // Pausados
  { name: 'Patrícia Gomes', status: 'Pausado' },
  { name: 'André Santana', status: 'Pausado' },
  // Bloqueados
  { name: 'Tatiane Freitas', status: 'Bloqueado' },
  { name: 'Bruno Siqueira', status: 'Bloqueado' },
]

export const afiliadosGerenciados: AfiliadoGerenciado[] = SEEDS.map((s, i) => build(i + 1, s.name, s.status))

/** Próximo id livre (para itens criados em runtime — convites, etc.). */
export const NEXT_AFILIADO_ID = afiliadosGerenciados.length + 1

export const STATUS_OPTIONS: AfiliadoStatus[] = ['Ativo', 'Pendente', 'Convite enviado', 'Pausado', 'Bloqueado']
