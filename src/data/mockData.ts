import {
  LayoutGrid,
  FileText,
  Wallet,
  Package,
  Users,
  Store,
  Plug,
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
      { label: 'Coprodução', path: '/produto/coproducao' },
      { label: 'Config. domínio', path: '/produto/config-dominio' },
      { label: 'Meus Afiliados', path: '/produto/meus-afiliados' },
    ],
  },
  {
    label: 'Equipe',
    icon: Users,
    children: [
      { label: 'Colaboradores', path: '/equipe/colaboradores' },
      { label: 'Logs', path: '/equipe/logs' },
      { label: 'Permissões', path: '/equipe/permissoes' },
    ],
  },
  { label: 'Marketplace', icon: Store, disabled: true, badge: 'Em Breve' },
  {
    label: 'Integrações',
    icon: Plug,
    children: [{ label: 'Webhooks', path: '/integracoes/webhooks' }],
  },
]

/* ----------------------------- Estatísticas --------------------------- */

export interface Stat {
  id: string
  label: string
  value: number
  delta: number // porcentagem, o sinal indica a direção
  icon: 'employees' | 'applicants' | 'new' | 'resigned'
  /** 'currency' exibe o valor como R$; padrão é número simples. */
  format?: 'number' | 'currency'
  /** Se definido, mostra um botão de ação ao lado do ícone (ex: "Sacar"). */
  action?: string
}

export const stats: Stat[] = [
  { id: 'total', label: 'Total de Vendas', value: 3540, delta: 25.5, icon: 'employees', format: 'currency' },
  { id: 'applicants', label: 'Vendas Aprovadas', value: 1150, delta: 4.1, icon: 'applicants' },
  { id: 'new', label: 'Ticket Médio', value: 500, delta: 5.1, icon: 'new', format: 'currency' },
  { id: 'resigned', label: 'Saldo Disponível', value: 93, delta: -25.5, icon: 'resigned', format: 'currency' },
]

/* ------------------------- Desempenho da equipe ----------------------- */
/* Vendas por hora (duas equipes). Gerado a partir de hoje pra que os       */
/* filtros de período (Hoje, Ontem, Últimos N dias...) tenham dados reais.  */

export interface SalesPoint {
  /** Início da hora (data + hora cheia). */
  date: Date
  projectTeam: number
  productTeam: number
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
      const proj = Math.max(0, Math.round(26 * w * trend * weekend * (0.7 + 0.6 * seeded(seed))))
      const prod = Math.max(0, Math.round(22 * w * trend * weekend * (0.7 + 0.6 * seeded(seed + 7777))))
      const date = new Date(day)
      date.setHours(h, 0, 0, 0)
      points.push({ date, projectTeam: proj, productTeam: prod })
    }
  }
  return points
}

export const salesData = buildSalesData()
export const salesDataStart = salesData[0].date

/* ----------------------------- Funcionários --------------------------- */

export interface Employee {
  id: number
  name: string
  email: string
  avatarSeed: number
  jobTitle: string
  lineManager: string
  department: string
  office: string
  status: 'Ativo' | 'Integração' | 'Desligamento'
}

export const employees: Employee[] = [
  { id: 1, name: 'Lincoln Torff', email: 'lincoln@unpixel.com', avatarSeed: 12, jobTitle: 'Designer UI/UX', lineManager: '@Pristiacandra', department: 'Equipe de Produto', office: 'Unpixel', status: 'Ativo' },
  { id: 2, name: 'Hanna Baptista', email: 'hanna@unpixel.com', avatarSeed: 5, jobTitle: 'Designer Gráfico', lineManager: '@Pristiacandra', department: 'Equipe de Produto', office: 'Unpixel', status: 'Ativo' },
  { id: 3, name: 'Miracle Geidt', email: 'miracle@unpixel.com', avatarSeed: 32, jobTitle: 'Financeiro', lineManager: '@Pristiacandra', department: 'Equipe Financeira', office: 'Unpixel', status: 'Integração' },
  { id: 4, name: 'Rayna Torff', email: 'rayna@unpixel.com', avatarSeed: 9, jobTitle: 'Gerente de Projetos', lineManager: '@Pristiacandra', department: 'Equipe de Produto', office: 'Unpixel', status: 'Ativo' },
  { id: 5, name: 'Giana Lipshutz', email: 'giana@unpixel.com', avatarSeed: 16, jobTitle: 'Gerente de Projetos', lineManager: '@Pristiacandra', department: 'Equipe de Projeto', office: 'Pixxel', status: 'Ativo' },
  { id: 6, name: 'James George', email: 'james@unpixel.com', avatarSeed: 51, jobTitle: 'Engenheiro Frontend', lineManager: '@Jorge', department: 'Equipe de Engenharia', office: 'Pixxel', status: 'Ativo' },
  { id: 7, name: 'Jordyn George', email: 'jordyn@unpixel.com', avatarSeed: 25, jobTitle: 'Engenheiro Backend', lineManager: '@Jorge', department: 'Equipe de Engenharia', office: 'Pixxel', status: 'Integração' },
  { id: 8, name: 'Skylar Geidt', email: 'skylar@unpixel.com', avatarSeed: 47, jobTitle: 'Engenheiro de QA', lineManager: '@Jorge', department: 'Equipe de Engenharia', office: 'Stack', status: 'Ativo' },
  { id: 9, name: 'Cooper Press', email: 'cooper@unpixel.com', avatarSeed: 60, jobTitle: 'Gerente de RH', lineManager: '@Pristiacandra', department: 'Equipe de Pessoas', office: 'Stack', status: 'Ativo' },
  { id: 10, name: 'Brandon Aminoff', email: 'brandon@unpixel.com', avatarSeed: 11, jobTitle: 'Líder de Marketing', lineManager: '@Pristiacandra', department: 'Equipe de Marketing', office: 'Stack', status: 'Desligamento' },
  { id: 11, name: 'Alfredo Schleifer', email: 'alfredo@unpixel.com', avatarSeed: 33, jobTitle: 'Analista de Dados', lineManager: '@Jorge', department: 'Equipe de Dados', office: 'Unpixel', status: 'Ativo' },
  { id: 12, name: 'Talan Bergson', email: 'talan@unpixel.com', avatarSeed: 14, jobTitle: 'Executivo de Vendas', lineManager: '@Pristiacandra', department: 'Equipe de Vendas', office: 'Pixxel', status: 'Integração' },
]

export const offices = ['Todos os Escritórios', 'Unpixel', 'Pixxel', 'Stack']
export const jobTitles = ['Todos os Cargos', ...Array.from(new Set(employees.map((e) => e.jobTitle)))]
export const statuses = ['Todos os Status', 'Ativo', 'Integração', 'Desligamento']

/* --------------------------- Total de funcionários -------------------- */

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export const totalEmployeeData: DonutSegment[] = [
  { label: 'Pix', value: 58, color: '#2f6bff' },
  { label: 'Cartões', value: 41, color: '#8b5cf6' },
  { label: 'Boleto', value: 14, color: '#f5c043' },
  { label: 'Outros', value: 8, color: '#2dd4bf' },
]

export const totalEmployeeCount = totalEmployeeData.reduce((sum, s) => sum + s.value, 0)

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
  { label: 'Pix', color: '#2f6bff', icon: 'pix', conversion: 92, value: 34520, count: 58 },
  { label: 'Cartões', color: '#8b5cf6', icon: 'card', conversion: 78, value: 28140.5, count: 41 },
  { label: 'Boleto', color: '#f5c043', icon: 'boleto', conversion: 64, value: 9870, count: 14 },
  { label: 'Outros', color: '#2dd4bf', icon: 'other', conversion: 45, value: 4210, count: 8 },
]
