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
  disponivel: 254782.45, // mesma fonte do "Saldo Disponível" do Dashboard (stats)
  aReceber: 9210,
  reserva: 3500,
  protesto: 1280,
}

/* ------------------------------ Extrato ------------------------------- */

type MovType = 'Entrada' | 'Saída' | 'Estorno' | 'Taxa' | 'Chargeback' | 'Repasse'
type MovCat = 'Venda' | 'Saque' | 'Antecipação' | 'Ajuste' | 'Taxa' | 'MED'

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
  { type: 'Estorno', category: 'Ajuste', desc: 'Estorno de venda', sign: -1 },
  { type: 'Chargeback', category: 'MED', desc: 'Chargeback recebido', sign: -1 },
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
  bankAccount: string
  status: SaqueStatus
  date: Date
  motivo?: string
}
const saqueStatuses: SaqueStatus[] = ['Concluído', 'Concluído', 'Pendente', 'Em Revisão', 'Negado']
const bankAccounts = [
  'Nubank · 12345-6',
  'Itaú · 56789-0',
  'Bradesco · 11223-4',
  'Inter · 99887-7',
  'BB · 44556-6',
]

const motivosNegacao = [
  'Dados bancários divergentes do titular da conta',
  'Conta bancária inválida ou inexistente',
  'Saldo insuficiente no momento da solicitação',
  'Limite diário de saque excedido',
  'Saque bloqueado por suspeita de fraude',
]

export const saques: Saque[] = Array.from({ length: 14 }, (_, i) => {
  const status = pick(saqueStatuses, i * 2 + 1)
  return {
    id: i + 1,
    value: money(500 + seeded(i * 5 + 2) * 9500),
    bankAccount: pick(bankAccounts, i + 1),
    status,
    date: dayAgo(28, i + 30),
    motivo: status === 'Negado' ? pick(motivosNegacao, i + 2) : undefined,
  }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

/* --------------------------- Antecipações ----------------------------- */

export type AntecipStatus = 'Aprovada' | 'Pendente' | 'Negada'
export interface Antecipacao {
  id: number
  bruto: number
  taxa: number
  liquido: number
  status: AntecipStatus
  date: Date
  motivo?: string
}
const antecipStatuses: AntecipStatus[] = ['Aprovada', 'Aprovada', 'Pendente', 'Negada']
const motivosAntecipNegada = [
  'Volume de recebíveis insuficiente para antecipar',
  'Limite de antecipação do período já utilizado',
  'Análise de crédito não aprovada',
  'Recebíveis já comprometidos com outra antecipação',
]

export const antecipacoes: Antecipacao[] = Array.from({ length: 14 }, (_, i) => {
  const bruto = money(1000 + seeded(i * 9 + 3) * 14000)
  const taxa = 2.5
  const status = pick(antecipStatuses, i * 2 + 1)
  return {
    id: i + 1,
    bruto,
    taxa,
    liquido: money(bruto * (1 - taxa / 100)),
    status,
    date: dayAgo(28, i + 50),
    motivo: status === 'Negada' ? pick(motivosAntecipNegada, i + 3) : undefined,
  }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

/* ---------------------------- Assinaturas ----------------------------- */

export type AssinStatus = 'Ativa' | 'Em Atraso' | 'Cancelada' | 'Pausada'
type FaturaStatus = 'Pago' | 'Pendente' | 'Vencido' | 'Cancelado'

export interface Fatura {
  id: string
  vencimento: Date
  value: number
  status: FaturaStatus
  pagamento: Date | null
  method: string
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
  { name: 'Fernando Castro', email: 'fernando.castro@email.com', doc: '258.369.147-66', phone: '(11) 99110-2244', seed: 8, cidade: 'Campinas', estado: 'SP' },
  { name: 'Aline Barros', email: 'aline.barros@email.com', doc: '369.147.258-77', phone: '(85) 99556-8899', seed: 42, cidade: 'Fortaleza', estado: 'CE' },
  { name: 'Gustavo Pereira', email: 'gustavo.pereira@email.com', doc: '34.567.890/0001-12', phone: '(62) 99443-1100', seed: 19, cidade: 'Goiânia', estado: 'GO' },
  { name: 'Beatriz Moraes', email: 'beatriz.moraes@email.com', doc: '741.852.963-88', phone: '(27) 99887-2233', seed: 55, cidade: 'Vitória', estado: 'ES' },
  { name: 'Rodrigo Teixeira', email: 'rodrigo.teixeira@email.com', doc: '852.963.741-99', phone: '(91) 99221-4455', seed: 3, cidade: 'Belém', estado: 'PA' },
  { name: 'Carolina Mendes', email: 'carolina.mendes@email.com', doc: '963.741.852-00', phone: '(98) 99334-5566', seed: 28, cidade: 'São Luís', estado: 'MA' },
  { name: 'Eduardo Ramos', email: 'eduardo.ramos@email.com', doc: '159.357.486-21', phone: '(67) 99445-6677', seed: 14, cidade: 'Campo Grande', estado: 'MS' },
  { name: 'Larissa Pinto', email: 'larissa.pinto@email.com', doc: '357.486.159-32', phone: '(84) 99556-7788', seed: 49, cidade: 'Natal', estado: 'RN' },
  { name: 'Marcelo Araújo', email: 'marcelo.araujo@email.com', doc: '45.678.901/0001-23', phone: '(82) 99667-8899', seed: 7, cidade: 'Maceió', estado: 'AL' },
  { name: 'Vanessa Cardoso', email: 'vanessa.cardoso@email.com', doc: '486.159.357-43', phone: '(79) 99778-9900', seed: 36, cidade: 'Aracaju', estado: 'SE' },
  { name: 'Felipe Carvalho', email: 'felipe.carvalho@email.com', doc: '258.147.369-54', phone: '(65) 99889-0011', seed: 21, cidade: 'Cuiabá', estado: 'MT' },
  { name: 'Renata Lopes', email: 'renata.lopes@email.com', doc: '147.369.258-65', phone: '(92) 99990-1122', seed: 58, cidade: 'Manaus', estado: 'AM' },
  { name: 'Vinícius Moreira', email: 'vinicius.moreira@email.com', doc: '369.258.147-76', phone: '(86) 99101-2233', seed: 11, cidade: 'Teresina', estado: 'PI' },
  { name: 'Tatiane Freitas', email: 'tatiane.freitas@email.com', doc: '56.789.012/0001-34', phone: '(68) 99212-3344', seed: 44, cidade: 'Rio Branco', estado: 'AC' },
  { name: 'André Santana', email: 'andre.santana@email.com', doc: '951.753.852-87', phone: '(69) 99323-4455', seed: 26, cidade: 'Porto Velho', estado: 'RO' },
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
      pagamento: fStatus === 'Pago' ? addDays(venc, Math.floor(seeded(i * 13 + j) * 4)) : null,
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
    faturas,
  }
}

export const assinaturas: Assinatura[] = Array.from({ length: 25 }, (_, i) => buildAssinatura(i))

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
    txId: `TXN${String(928374 + i * 137).padStart(8, '0')}`,
    status,
    defesaEnviada,
    prazo: status === 'Aberta' ? `${Math.floor(seeded(i) * 6) + 1} dias` : null,
  }
}).sort((a, b) => b.date.getTime() - a.date.getTime())

export const contestacoesResumo = {
  totalValor: money(contestacoes.filter((c) => c.status === 'Aberta' || c.status === 'Defesa Enviada').reduce((s, c) => s + c.value, 0)),
  qtdAbertas: contestacoes.filter((c) => c.status === 'Aberta').length,
  defesasEnviadas: contestacoes.filter((c) => c.defesaEnviada).length,
  defesasPendentes: contestacoes.filter((c) => c.status === 'Defesa Enviada').length,
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
  { method: 'Pix', format: '% + R$ fixo por transação', example: '0,5% + R$ 0,00', obs: 'Liquidação imediata; taxa menor que cartão.' },
  { method: 'API Pix', format: '% + R$ fixo por transação', example: '0,4% + R$ 0,00', obs: 'Pix gerado via API (cobranças automatizadas).' },
  { method: 'Boleto', format: '% + R$ fixo por boleto', example: '1,5% + R$ 3,50', obs: 'Cobrado por boleto gerado (pago ou não, conforme contrato).' },
  { method: 'Cartão de Crédito', format: '% por parcela + R$ fixo', example: '2,99% (1x) até 3,99% (12x) + R$ 0,50', obs: 'Taxa varia conforme o número de parcelas.' },
  { method: 'Cartão de Débito', format: '% por transação', example: '1,49% + R$ 0,00', obs: 'Liquidação em D+1; sem parcelamento.' },
]
