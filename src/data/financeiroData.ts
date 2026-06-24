import { addDays, startOfDay } from '../lib/date'

/* Dados mockados do módulo Financeiro. */

function seeded(n: number): number {
  const x = Math.sin(n * 73.17) * 4571.3
  return x - Math.floor(x)
}
const pick = <T,>(a: T[], n: number): T => a[Math.floor(seeded(n) * a.length)]
const money = (n: number) => Math.round(n * 100) / 100

const TODAY = startOfDay(new Date())
function dayAgo(maxDays: number, seed: number, withHour = true): Date {
  const d = addDays(TODAY, -Math.floor(seeded(seed) * maxDays))
  if (withHour) d.setHours(Math.floor(seeded(seed + 1) * 14) + 7, Math.floor(seeded(seed + 2) * 60), 0, 0)
  return d
}

/* ------------------------------ Saldos -------------------------------- */

export const balances = {
  disponivel: 18432.5,
  aReceber: 9210,
  reserva: 3500,
  protesto: 1280,
}

/* ------------------------------ Extrato ------------------------------- */

export type MovType = 'Entrada' | 'Saída' | 'Estorno' | 'Taxa' | 'Chargeback' | 'Repasse'
export type MovCat = 'Venda' | 'Saque' | 'Antecipação' | 'Ajuste' | 'Taxa' | 'MED'

export interface Movimentacao {
  id: number
  date: Date
  type: MovType
  value: number
  description: string
  category: MovCat
}

const movTemplates: { type: MovType; category: MovCat; desc: string; sign: 1 | -1 }[] = [
  { type: 'Entrada', category: 'Venda', desc: 'Venda aprovada — Pix', sign: 1 },
  { type: 'Entrada', category: 'Venda', desc: 'Venda aprovada — Cartão', sign: 1 },
  { type: 'Saída', category: 'Saque', desc: 'Saque via Pix', sign: -1 },
  { type: 'Taxa', category: 'Taxa', desc: 'Taxa de processamento', sign: -1 },
  { type: 'Estorno', category: 'Ajuste', desc: 'Estorno de venda', sign: -1 },
  { type: 'Chargeback', category: 'MED', desc: 'Chargeback recebido', sign: -1 },
  { type: 'Repasse', category: 'Venda', desc: 'Repasse de split recebido', sign: 1 },
  { type: 'Entrada', category: 'Antecipação', desc: 'Antecipação creditada', sign: 1 },
]

export const movimentacoes: Movimentacao[] = Array.from({ length: 30 }, (_, i) => {
  const t = pick(movTemplates, i * 3 + 1)
  const base = money(50 + seeded(i * 7 + 1) * 2950)
  return { id: i + 1, date: dayAgo(28, i + 10), type: t.type, value: t.sign * base, description: t.desc, category: t.category }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

/* ------------------------------ Saques -------------------------------- */

export type SaqueStatus = 'Concluído' | 'Pendente' | 'Negado' | 'Em Revisão'
export interface Saque {
  id: number
  value: number
  pixKey: string
  status: SaqueStatus
  date: Date
}
const saqueStatuses: SaqueStatus[] = ['Concluído', 'Concluído', 'Pendente', 'Em Revisão', 'Negado']
const pixKeys = ['financeiro@nummo.com', '123.456.789-09', '+55 11 98765-4321', 'a1b2c3d4-5e6f', '12.345.678/0001-90']

export const saques: Saque[] = Array.from({ length: 14 }, (_, i) => ({
  id: i + 1,
  value: money(500 + seeded(i * 5 + 2) * 9500),
  pixKey: pick(pixKeys, i + 1),
  status: pick(saqueStatuses, i * 2 + 1),
  date: dayAgo(28, i + 30),
})).sort((a, b) => b.date.getTime() - a.date.getTime())

/* --------------------------- Antecipações ----------------------------- */

export type AntecipStatus = 'Aprovada' | 'Pendente' | 'Negada'
export interface Antecipacao {
  id: number
  bruto: number
  taxa: number
  liquido: number
  status: AntecipStatus
  date: Date
}
const antecipStatuses: AntecipStatus[] = ['Aprovada', 'Aprovada', 'Pendente', 'Negada']

export const antecipacoes: Antecipacao[] = Array.from({ length: 10 }, (_, i) => {
  const bruto = money(1000 + seeded(i * 9 + 3) * 14000)
  const taxa = 2.5
  return { id: i + 1, bruto, taxa, liquido: money(bruto * (1 - taxa / 100)), status: pick(antecipStatuses, i * 2 + 1), date: dayAgo(28, i + 50) }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

/* ---------------------------- Assinaturas ----------------------------- */

export type AssinStatus = 'Ativa' | 'Em Atraso' | 'Cancelada' | 'Pausada'
export type FaturaStatus = 'Pago' | 'Pendente' | 'Vencido' | 'Cancelado'

export interface Fatura {
  id: string
  vencimento: Date
  value: number
  status: FaturaStatus
  pagamento: Date | null
  method: string
}
export interface Notificacao {
  id: string
  descricao: string
  criadoEm: Date
  status: 'Ativa' | 'Inativa'
}
export interface Assinatura {
  id: number
  avatarSeed: number
  buyerName: string
  buyerEmail: string
  buyerDoc: string
  buyerPhone: string
  address: { rua: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; cep: string; pais: string }
  product: string
  value: number
  method: string
  status: AssinStatus
  startDate: Date
  lastPayment: Date
  nextCharge: Date
  cobrancaId: string
  methodsEnabled: { pix: boolean; cartao: boolean; boleto: boolean }
  descontos: { pix: string; boleto: string; cartao: string }
  notificacoes: Notificacao[]
  faturas: Fatura[]
}

const subBuyers = [
  { name: 'Marina Alves', email: 'marina.alves@email.com', doc: '123.456.789-09', phone: '(11) 98765-4321', seed: 31, cidade: 'São Paulo', estado: 'SP' },
  { name: 'Rafael Costa', email: 'rafael.costa@email.com', doc: '987.654.321-00', phone: '(21) 99812-3344', seed: 12, cidade: 'Rio de Janeiro', estado: 'RJ' },
  { name: 'Camila Souza', email: 'camila.souza@email.com', doc: '456.789.123-44', phone: '(31) 99654-1122', seed: 47, cidade: 'Belo Horizonte', estado: 'MG' },
  { name: 'Bruno Lima', email: 'bruno.lima@email.com', doc: '12.345.678/0001-90', phone: '(41) 99321-7788', seed: 5, cidade: 'Curitiba', estado: 'PR' },
  { name: 'Patrícia Gomes', email: 'patricia.g@email.com', doc: '321.654.987-11', phone: '(51) 99887-6655', seed: 16, cidade: 'Porto Alegre', estado: 'RS' },
  { name: 'Diego Martins', email: 'diego.martins@email.com', doc: '654.321.789-22', phone: '(61) 99443-2211', seed: 51, cidade: 'Brasília', estado: 'DF' },
  { name: 'Letícia Rocha', email: 'leticia.rocha@email.com', doc: '789.123.456-33', phone: '(71) 99776-5544', seed: 25, cidade: 'Salvador', estado: 'BA' },
  { name: 'Thiago Nunes', email: 'thiago.nunes@email.com', doc: '23.456.789/0001-01', phone: '(81) 99334-9988', seed: 60, cidade: 'Recife', estado: 'PE' },
  { name: 'Juliana Dias', email: 'juliana.dias@email.com', doc: '147.258.369-55', phone: '(48) 99221-3366', seed: 33, cidade: 'Florianópolis', estado: 'SC' },
]
const subProducts = ['Plano Pro Mensal', 'Mentoria Premium', 'Assinatura Black', 'Clube de Conteúdo', 'Software CRM', 'Plano Starter']
const subMethods = ['Cartão', 'Pix', 'Boleto']
const subStatuses: AssinStatus[] = ['Ativa', 'Ativa', 'Ativa', 'Ativa', 'Em Atraso', 'Pausada', 'Cancelada']
const faturaMethods = ['Cartão', 'Pix', 'Boleto']

function buildAssinatura(i: number): Assinatura {
  const b = subBuyers[i % subBuyers.length]
  const value = money(29 + seeded(i * 4 + 1) * 471)
  const status = pick(subStatuses, i + 1)
  const last = dayAgo(28, i + 70, false)
  const next = addDays(last, 30)
  const start = addDays(TODAY, -Math.floor(90 + seeded(i + 3) * 360))

  const faturas: Fatura[] = Array.from({ length: 6 }, (_, j) => {
    const venc = addDays(next, -(j + 1) * 30)
    let fStatus: FaturaStatus = j === 0 && status === 'Em Atraso' ? 'Vencido' : j === 0 ? 'Pendente' : 'Pago'
    if (status === 'Cancelada' && j === 0) fStatus = 'Cancelado'
    return {
      id: `INV-${1000 + i * 13 + j}`,
      vencimento: venc,
      value,
      status: fStatus,
      pagamento: fStatus === 'Pago' ? addDays(venc, -1) : null,
      method: pick(faturaMethods, i + j),
    }
  })

  return {
    id: i + 1,
    avatarSeed: b.seed,
    buyerName: b.name,
    buyerEmail: b.email,
    buyerDoc: b.doc,
    buyerPhone: b.phone,
    address: { rua: 'Av. Paulista', numero: `${100 + i * 37}`, complemento: i % 2 ? `Sala ${i * 10}` : '—', bairro: 'Centro', cidade: b.cidade, estado: b.estado, cep: '01310-100', pais: 'Brasil' },
    product: pick(subProducts, i * 2 + 1),
    value,
    method: pick(subMethods, i + 2),
    status,
    startDate: start,
    lastPayment: last,
    nextCharge: next,
    cobrancaId: `SUB-${928374 + i * 211}`,
    methodsEnabled: { pix: true, cartao: true, boleto: seeded(i) > 0.5 },
    descontos: { pix: '5%', boleto: 'R$ 0,00', cartao: '0%' },
    notificacoes: [
      { id: `NTF-${i}1`, descricao: 'Lembrete 3 dias antes do vencimento', criadoEm: start, status: 'Ativa' },
      { id: `NTF-${i}2`, descricao: 'Aviso no dia do vencimento', criadoEm: start, status: seeded(i + 1) > 0.4 ? 'Ativa' : 'Inativa' },
    ],
    faturas,
  }
}

export const assinaturas: Assinatura[] = Array.from({ length: 9 }, (_, i) => buildAssinatura(i))

const ativasList = assinaturas.filter((a) => a.status === 'Ativa')
const atrasoList = assinaturas.filter((a) => a.status === 'Em Atraso')
const mrr = (list: Assinatura[]) => list.reduce((s, a) => s + a.value, 0)
export const assinaturasResumo = {
  ativas: ativasList.length,
  mrr: money(mrr(ativasList)),
  arr: money(mrr(ativasList) * 12),
  emAtraso: atrasoList.length,
  mrrAtraso: money(mrr(atrasoList)),
  arrAtraso: money(mrr(atrasoList) * 12),
}

/* --------------------------- Contestações ----------------------------- */

export type ContestStatus = 'Aberta' | 'Defesa Enviada' | 'Aprovada' | 'Negada' | 'Encerrada'
export interface Contestacao {
  id: string
  date: Date
  value: number
  txId: string
  status: ContestStatus
  defesaEnviada: boolean
  prazo: string | null
}
const contestStatuses: ContestStatus[] = ['Aberta', 'Aberta', 'Defesa Enviada', 'Aprovada', 'Negada', 'Encerrada']

export const contestacoes: Contestacao[] = Array.from({ length: 12 }, (_, i) => {
  const status = pick(contestStatuses, i * 2 + 1)
  const defesaEnviada = status !== 'Aberta'
  return {
    id: `CTS-${5500 + i * 17}`,
    date: dayAgo(40, i + 90),
    value: money(80 + seeded(i * 6 + 2) * 1900),
    txId: `TXN${928374 + i * 137}`.slice(0, 10),
    status,
    defesaEnviada,
    prazo: status === 'Aberta' ? `${Math.floor(seeded(i) * 6) + 1} dias` : null,
  }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

export const contestacoesResumo = {
  totalValor: money(contestacoes.filter((c) => c.status === 'Aberta' || c.status === 'Defesa Enviada').reduce((s, c) => s + c.value, 0)),
  qtdAbertas: contestacoes.filter((c) => c.status === 'Aberta').length,
  defesasEnviadas: contestacoes.filter((c) => c.defesaEnviada).length,
  defesasPendentes: contestacoes.filter((c) => c.status === 'Aberta').length,
  defesasAprovadas: contestacoes.filter((c) => c.status === 'Aprovada').length,
  valorLiberado: money(contestacoes.filter((c) => c.status === 'Aprovada').reduce((s, c) => s + c.value, 0)),
}

/* ------------------------------- Taxas -------------------------------- */

export interface Taxa {
  method: string
  format: string
  example: string
  obs: string
}
export const taxas: Taxa[] = [
  { method: 'Boleto', format: '% + R$ fixo por boleto', example: '1,5% + R$ 3,50', obs: 'Cobrado por boleto gerado (pago ou não, conforme contrato).' },
  { method: 'Pix', format: '% + R$ fixo por transação', example: '0,5% + R$ 0,00', obs: 'Liquidação imediata; taxa menor que cartão.' },
  { method: 'Cartão de Crédito', format: '% por parcela + R$ fixo', example: '2,99% (1x) até 3,99% (12x) + R$ 0,50', obs: 'Taxa varia conforme o número de parcelas.' },
]
