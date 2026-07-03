import {
  LayoutGrid,
  FileText,
  Wallet,
  Package,
  Handshake,
  Store,
  Trophy,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { startOfDay, addDays } from '../lib/date'

/* ----------------------------- Navegação ------------------------------ */

export interface NavChild {
  label: string
  path: string
}

export interface NavItem {
  label: string
  icon: LucideIcon
  /** Link direto (itens sem submenu). */
  path?: string
  /** Submenu expansível. */
  children?: NavChild[]
  /** Item desabilitado (ex: "Em Breve"). */
  disabled?: boolean
  /** Selo ao lado do label. */
  badge?: string
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutGrid, path: '/' },
  {
    label: 'Relatório',
    icon: FileText,
    children: [
      { label: 'Clientes', path: '/relatorio/clientes' },
      { label: 'Entradas', path: '/relatorio/entradas' },
      { label: 'Saídas', path: '/relatorio/saidas' },
    ],
  },
  {
    label: 'Financeiro',
    icon: Wallet,
    children: [
      { label: 'Geral', path: '/financeiro/geral' },
      { label: 'Assinaturas', path: '/financeiro/assinaturas' },
      { label: 'Link de Pagamento', path: '/financeiro/link-de-pagamento' },
      { label: 'Contestações', path: '/financeiro/contestacoes' },
      { label: 'Taxas', path: '/financeiro/taxas' },
    ],
  },
  {
    label: 'Produto',
    icon: Package,
    children: [
      { label: 'Meus Produtos', path: '/produto/meus-produtos' },
      { label: 'Config. domínio', path: '/produto/config-dominio' },
      { label: 'Meus domínios', path: '/produto/meus-dominios' },
    ],
  },
  {
    label: 'Afiliados',
    icon: Handshake,
    children: [
      { label: 'Gerenciador de afiliados', path: '/afiliados/gerenciador' },
      { label: 'Meus Afiliados', path: '/afiliados/meus-afiliados' },
    ],
  },
  { label: 'Marketplace', icon: Store, disabled: true, badge: 'Em Breve' },
  { label: 'Premiações', icon: Trophy, disabled: true, badge: 'Em Breve' },
  {
    label: 'Ferramentas',
    icon: Wrench,
    children: [
      { label: 'Webhooks', path: '/integracoes/webhooks' },
      { label: 'Chaves de API', path: '/integracoes/chaves-de-api' },
      { label: 'Integrações', path: '/integracoes/conexoes' },
    ],
  },
]

/* ----------------------------- Estatísticas --------------------------- */

export interface Stat {
  id: string
  label: string
  value: number
  delta: number // porcentagem, o sinal indica a direção
  icon: 'sales' | 'approved' | 'ticket' | 'balance'
  /** 'currency' exibe o valor como R$; padrão é número simples. */
  format?: 'number' | 'currency'
}

export const stats: Stat[] = [
  // Total de Vendas = Vendas Aprovadas (1.150) × Ticket Médio (R$ 500) = R$ 575.000
  { id: 'total', label: 'Total de Vendas', value: 575000, delta: 25.5, icon: 'sales', format: 'currency' },
  { id: 'approved', label: 'Vendas Aprovadas', value: 1150, delta: 4.1, icon: 'approved' },
  { id: 'ticket', label: 'Ticket Médio', value: 500, delta: 5.1, icon: 'ticket', format: 'currency' },
  { id: 'saldo', label: 'Saldo Disponível', value: 254782.45, delta: 25.5, icon: 'balance', format: 'currency' },
]

/* ------------------------- Desempenho de vendas ----------------------- */
/* Vendas por hora. Gerado a partir de hoje pra que os filtros de período   */
/* (Hoje, Ontem, Últimos N dias...) tenham dados reais.                     */

export interface SalesPoint {
  /** Início da hora (data + hora cheia). */
  date: Date
  vendas: number
}

const DAYS_BACK = 120

/** Hash determinístico 0..1 (sem Math.random, pra render estável). */
function seeded(n: number): number {
  const x = Math.sin(n * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

/** Peso por hora do dia: baixo de madrugada, leve pico de manhã, pico à tarde/noite. */
function hourWeight(h: number): number {
  const evening = Math.exp(-((h - 17) ** 2) / (2 * 5 ** 2))
  const morning = 0.45 * Math.exp(-((h - 10) ** 2) / (2 * 2.5 ** 2))
  return evening + morning
}

function buildSalesData(): SalesPoint[] {
  const points: SalesPoint[] = []
  const today = startOfDay(new Date())
  const start = addDays(today, -(DAYS_BACK - 1))
  for (let d = 0; d < DAYS_BACK; d++) {
    const day = addDays(start, d)
    const trend = 1 + 0.3 * Math.sin(d / 13) + 0.12 * Math.sin(d / 5)
    const weekend = day.getDay() === 0 || day.getDay() === 6 ? 0.65 : 1
    for (let h = 0; h < 24; h++) {
      const w = hourWeight(h)
      const seed = d * 24 + h
      const a = Math.max(0, Math.round(26 * w * trend * weekend * (0.7 + 0.6 * seeded(seed))))
      const b = Math.max(0, Math.round(22 * w * trend * weekend * (0.7 + 0.6 * seeded(seed + 7777))))
      const date = new Date(day)
      date.setHours(h, 0, 0, 0)
      points.push({ date, vendas: a + b })
    }
  }
  return points
}

export const salesData = buildSalesData()
export const salesDataStart = salesData[0].date

/* ------------------- Transações por método (donut) -------------------- */

export interface DonutSegment {
  label: string
  value: number
  color: string
}

/** Distribuição das transações de HOJE por método de pagamento. */
export const paymentMethodsData: DonutSegment[] = [
  { label: 'Pix', value: 58, color: '#1b47c4' },
  { label: 'Cartões', value: 41, color: '#2f6bff' },
  { label: 'Boleto', value: 14, color: '#6c97ff' },
  { label: 'Outros', value: 8, color: '#aecbff' },
]

export const totalTransacoesHoje = paymentMethodsData.reduce((sum, s) => sum + s.value, 0)

/** Conversão por método de pagamento (cada bloco abaixo do donut). */
export interface MethodConversion {
  label: string
  color: string
  icon: 'pix' | 'card' | 'boleto' | 'other'
  conversion: number // taxa de conversão em %
  value: number // valor transacionado em R$
  count: number // nº de transações
}

export const methodConversions: MethodConversion[] = [
  { label: 'Pix', color: '#1b47c4', icon: 'pix', conversion: 92, value: 34520, count: 58 },
  { label: 'Cartões', color: '#2f6bff', icon: 'card', conversion: 78, value: 28140.5, count: 41 },
  { label: 'Boleto', color: '#6c97ff', icon: 'boleto', conversion: 64, value: 9870, count: 14 },
  { label: 'Outros', color: '#aecbff', icon: 'other', conversion: 45, value: 4210, count: 8 },
]
