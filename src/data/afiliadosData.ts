/** Afiliados associados aos produtos do seller. Mock — sem backend. */
export interface Afiliado {
  id: number
  name: string
  email: string
  document: string
  seed: number
  products: string[]
  since: Date
  transactions: number
  /** comissão já gerada (paga + pendente) */
  commission: number
  /** parte da comissão ainda pendente de repasse */
  pending: number
}

/* ----------------------------- Helpers -------------------------------- */

/** PRNG determinístico (mesma saída a cada load) — evita Math.random no módulo. */
const seeded = (n: number) => {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
const round2 = (v: number) => Math.round(v * 100) / 100

const PRODUCT_POOL = [
  'Plano Pro Mensal',
  'Mentoria Premium',
  'Assinatura Black',
  'Clube de Conteúdo',
  'Software CRM',
  'Plano Starter',
  'Plano Anual',
  'Curso Avançado',
]
const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br']

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

function productsFor(i: number): string[] {
  const count = 1 + Math.floor(seeded(i * 3) * 5) // 1..5
  return Array.from({ length: count }, (_, j) => PRODUCT_POOL[(i + j) % PRODUCT_POOL.length])
}

function sinceFor(i: number): Date {
  const start = new Date(2024, 9, 1).getTime() // out/2024
  const end = new Date(2025, 5, 1).getTime() // jun/2025
  return new Date(start + seeded(i * 9) * (end - start))
}

function buildAfiliado(name: string, id: number): Afiliado {
  const transactions = 8 + Math.floor(seeded(id * 5) * 58) // 8..65
  const commission = round2(transactions * (35 + seeded(id * 7) * 35))
  const pending = seeded(id * 11) > 0.45 ? round2(commission * (0.04 + seeded(id * 13) * 0.12)) : 0
  return {
    id,
    name,
    email: emailFor(name, id),
    document: cpfFor(id),
    seed: (id * 7 + 3) % 70,
    products: productsFor(id),
    since: sinceFor(id),
    transactions,
    commission,
    pending,
  }
}

/* ----------------------- Os 4 da referência -------------------------- */

const base: Afiliado[] = [
  {
    id: 1,
    name: 'Lucas Pereira',
    email: 'lucas.pereira@gmail.com',
    document: '482.119.330-08',
    seed: 12,
    products: ['Mentoria Premium', 'Assinatura Black', 'Clube de Conteúdo'],
    since: new Date(2025, 2, 12),
    transactions: 64,
    commission: 3840,
    pending: 320,
  },
  {
    id: 2,
    name: 'Bianca Costa',
    email: 'bianca.costa@hotmail.com',
    document: '317.905.221-44',
    seed: 5,
    products: ['Plano Pro Mensal', 'Software CRM'],
    since: new Date(2025, 0, 2),
    transactions: 41,
    commission: 2418.5,
    pending: 180,
  },
  {
    id: 3,
    name: 'Rafael Dias',
    email: 'rafa.dias@outlook.com',
    document: '209.778.140-91',
    seed: 33,
    products: ['Plano Pro Mensal', 'Mentoria Premium', 'Assinatura Black', 'Clube de Conteúdo', 'Plano Starter'],
    since: new Date(2024, 10, 28),
    transactions: 33,
    commission: 1990,
    pending: 196,
  },
  {
    id: 4,
    name: 'Camila Souza',
    email: 'camila.souza@gmail.com',
    document: '655.412.008-72',
    seed: 47,
    products: ['Plano Starter'],
    since: new Date(2025, 3, 19),
    transactions: 12,
    commission: 987.3,
    pending: 0,
  },
]

/* ------------------ Demais afiliados (nomes únicos) ------------------- */

const EXTRA_NAMES = [
  'Fernanda Almeida',
  'Gabriel Rocha',
  'Juliana Martins',
  'Pedro Henrique Lopes',
  'Larissa Fernandes',
  'Thiago Barbosa',
  'Mariana Ribeiro',
  'Gustavo Carvalho',
  'Aline Cardoso',
  'Rodrigo Teixeira',
  'Beatriz Moraes',
  'Felipe Araújo',
  'Carolina Mendes',
  'Eduardo Ramos',
  'Vanessa Pinto',
  'Marcelo Nunes',
  'Renata Lopes',
  'Vinícius Moreira',
  'Patrícia Gomes',
  'André Santana',
  'Tatiane Freitas',
]

export const afiliados: Afiliado[] = [...base, ...EXTRA_NAMES.map((name, k) => buildAfiliado(name, k + 5))]

/* ----------------------- Totais (derivados) -------------------------- */

export const afiliadosResumo = {
  total: afiliados.length,
  comissaoTotal: round2(afiliados.reduce((s, a) => s + a.commission, 0)),
  comissaoPendente: round2(afiliados.reduce((s, a) => s + a.pending, 0)),
  transacoes: afiliados.reduce((s, a) => s + a.transactions, 0),
}
