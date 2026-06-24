import { addDays, startOfDay } from '../lib/date'

/* Dados mockados do módulo Relatórios (Clientes, Entradas, Saídas). */

function seeded(n: number): number {
  const x = Math.sin(n * 99.13) * 7919.7
  return x - Math.floor(x)
}
const pick = <T,>(arr: T[], n: number): T => arr[Math.floor(seeded(n) * arr.length)]

/* ------------------------------ Clientes ------------------------------ */

export interface Client {
  id: number
  name: string
  email: string
  document: string
  avatarSeed: number
}

export const clients: Client[] = [
  { id: 1, name: 'Marina Alves', email: 'marina.alves@email.com', document: '123.456.789-09', avatarSeed: 31 },
  { id: 2, name: 'Rafael Costa', email: 'rafael.costa@email.com', document: '987.654.321-00', avatarSeed: 12 },
  { id: 3, name: 'Camila Souza', email: 'camila.souza@email.com', document: '456.789.123-44', avatarSeed: 47 },
  { id: 4, name: 'Bruno Lima', email: 'bruno.lima@email.com', document: '12.345.678/0001-90', avatarSeed: 5 },
  { id: 5, name: 'Patrícia Gomes', email: 'patricia.g@email.com', document: '321.654.987-11', avatarSeed: 16 },
  { id: 6, name: 'Diego Martins', email: 'diego.martins@email.com', document: '654.321.789-22', avatarSeed: 51 },
  { id: 7, name: 'Letícia Rocha', email: 'leticia.rocha@email.com', document: '789.123.456-33', avatarSeed: 25 },
  { id: 8, name: 'Thiago Nunes', email: 'thiago.nunes@email.com', document: '23.456.789/0001-01', avatarSeed: 60 },
  { id: 9, name: 'Juliana Dias', email: 'juliana.dias@email.com', document: '147.258.369-55', avatarSeed: 33 },
  { id: 10, name: 'André Pereira', email: 'andre.pereira@email.com', document: '258.369.147-66', avatarSeed: 14 },
]

/* ------------------------------ Entradas ------------------------------ */

export type TxStatus = 'Aprovado' | 'Pendente' | 'Estornado' | 'Bloqueado' | 'Chargeback'
export type PayMethod = 'Pix' | 'Cartão' | 'Boleto' | 'Outro'
export type EntryType = 'Venda' | 'Recorrência' | 'Split recebido'

export interface Entrada {
  id: number
  clientId: number
  date: Date
  txId: string
  type: EntryType
  method: PayMethod
  status: TxStatus
  value: number
  commission: number
  product: string
  nsu: string
  authorizer: string
  brand?: string
  barcode?: string
  pixKey?: string
}

const products = ['Curso de Marketing Digital', 'Mentoria Premium', 'E-book de Vendas', 'Assinatura Mensal', 'Consultoria 1:1', 'Pacote de Ads', 'Workshop ao Vivo', 'Template Pack']
const methods: PayMethod[] = ['Pix', 'Cartão', 'Boleto', 'Outro']
const statuses: TxStatus[] = ['Aprovado', 'Aprovado', 'Aprovado', 'Pendente', 'Estornado', 'Bloqueado', 'Chargeback']
const entryTypes: EntryType[] = ['Venda', 'Venda', 'Recorrência', 'Split recebido']
const brands = ['Visa', 'Mastercard', 'Elo', 'Amex']
const mdr: Record<PayMethod, number> = { Pix: 0.0099, Cartão: 0.0399, Boleto: 0.0199, Outro: 0.025 }

function buildEntradas(): Entrada[] {
  const today = startOfDay(new Date())
  const out: Entrada[] = []
  for (let i = 0; i < 30; i++) {
    const method = pick(methods, i * 3 + 1)
    const value = Math.round((50 + seeded(i * 7) * 1950) * 100) / 100
    // garante dados hoje/ontem
    const dayBack = i < 2 ? 0 : i < 4 ? 1 : Math.floor(seeded(i + 5) * 28)
    const date = addDays(today, -dayBack)
    date.setHours(Math.floor(seeded(i + 9) * 14) + 7, Math.floor(seeded(i + 11) * 60), 0, 0)
    out.push({
      id: i + 1,
      clientId: (i % clients.length) + 1,
      date,
      txId: `TXN${(928374 + i * 137).toString().slice(0, 7)}`,
      type: pick(entryTypes, i * 5 + 2),
      method,
      status: pick(statuses, i * 2 + 3),
      value,
      commission: Math.round(value * mdr[method] * 100) / 100,
      product: pick(products, i * 4 + 1),
      nsu: `${100000 + i * 731}`,
      authorizer: method === 'Cartão' ? 'Cielo' : method === 'Boleto' ? 'Banco Itaú' : 'Nummo Pay',
      brand: method === 'Cartão' ? pick(brands, i + 1) : undefined,
      barcode: method === 'Boleto' ? '34191.79001 01043.510047 91020.150008 9 91230000019900' : undefined,
      pixKey: method === 'Pix' ? 'pix@nummo.com' : undefined,
    })
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const entradas = buildEntradas()

/* ------------------------------- Saídas ------------------------------- */

export type SaidaStatus = 'Aprovado' | 'Em Análise' | 'Cancelado'
export type SaidaType = 'Cashout' | 'Multa' | 'Retirada Manual' | 'MED' | 'Chargeback'

export interface Saida {
  id: number
  date: Date
  recipient: string
  valorBruto: number
  valorLiquido: number
  status: SaidaStatus
  type: SaidaType
  txId: string
  bank: string
  agency: string
  account: string
  accountType: string
  pixKey?: string
  motivo?: string
}

const saidaStatuses: SaidaStatus[] = ['Aprovado', 'Aprovado', 'Em Análise', 'Cancelado']
const saidaTypes: SaidaType[] = ['Cashout', 'Cashout', 'Retirada Manual', 'Multa', 'MED', 'Chargeback']
const banks = ['Nubank (260)', 'Itaú (341)', 'Bradesco (237)', 'Inter (077)', 'Banco do Brasil (001)']

function buildSaidas(): Saida[] {
  const today = startOfDay(new Date())
  const out: Saida[] = []
  for (let i = 0; i < 16; i++) {
    const type = pick(saidaTypes, i * 3 + 2)
    const bruto = Math.round((200 + seeded(i * 9 + 1) * 9800) * 100) / 100
    const fee = Math.round(bruto * 0.0149 * 100) / 100
    const dayBack = i < 1 ? 0 : i < 3 ? 1 : Math.floor(seeded(i + 4) * 28)
    const date = addDays(today, -dayBack)
    date.setHours(Math.floor(seeded(i + 6) * 12) + 8, Math.floor(seeded(i + 8) * 60), 0, 0)
    const needsMotivo = type === 'Multa' || type === 'MED' || type === 'Chargeback'
    out.push({
      id: i + 1,
      date,
      recipient: type === 'Cashout' || type === 'Retirada Manual' ? pick(banks, i + 1) : `Sub-seller #${i + 100}`,
      valorBruto: bruto,
      valorLiquido: Math.round((bruto - fee) * 100) / 100,
      status: pick(saidaStatuses, i * 2 + 1),
      type,
      txId: `OUT${(551200 + i * 211).toString().slice(0, 7)}`,
      bank: pick(banks, i + 3),
      agency: `${1000 + Math.floor(seeded(i) * 8999)}`,
      account: `${10000 + Math.floor(seeded(i + 2) * 89999)}-${Math.floor(seeded(i + 3) * 9)}`,
      accountType: seeded(i) > 0.5 ? 'Corrente' : 'Poupança',
      pixKey: seeded(i + 1) > 0.4 ? 'financeiro@nummo.com' : undefined,
      motivo: needsMotivo
        ? type === 'Multa'
          ? 'Penalidade por descumprimento contratual'
          : type === 'MED'
            ? 'Devolução mandatória via Pix (Banco Central)'
            : 'Contestação de cobrança pelo portador'
        : undefined,
    })
  }
  return out.sort((a, b) => b.date.getTime() - a.date.getTime())
}

export const saidas = buildSaidas()

/* ------------------------------ Helpers ------------------------------- */

export function clientTransactions(clientId: number): Entrada[] {
  return entradas.filter((e) => e.clientId === clientId)
}

export function clientFirstPurchase(clientId: number): Date | null {
  const txs = clientTransactions(clientId)
  if (!txs.length) return null
  return txs.reduce((min, t) => (t.date < min ? t.date : min), txs[0].date)
}

export function clientMetrics(clientId: number) {
  const txs = clientTransactions(clientId)
  const approved = txs.filter((t) => t.status === 'Aprovado')
  const total = approved.reduce((s, t) => s + t.value, 0)
  const ticket = approved.length ? total / approved.length : 0
  const conversion = txs.length ? (approved.length / txs.length) * 100 : 0
  return { total, approvedCount: approved.length, ticket, conversion }
}
