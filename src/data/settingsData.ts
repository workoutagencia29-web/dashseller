/* Dados mockados da página de Configurações. */

export interface Session {
  id: number
  device: string
  browser: string
  ip: string
  location: string
  lastAccess: string
  current: boolean
}

export const activeSessions: Session[] = [
  { id: 1, device: 'MacBook Pro', browser: 'Chrome 124', ip: '189.45.12.7', location: 'São Paulo, BR', lastAccess: 'Agora mesmo', current: true },
  { id: 2, device: 'iPhone 15', browser: 'Safari', ip: '177.92.40.13', location: 'São Paulo, BR', lastAccess: 'Há 2 horas', current: false },
  { id: 3, device: 'Windows 11', browser: 'Edge 124', ip: '201.17.88.4', location: 'Campinas, BR', lastAccess: 'Ontem, 18:42', current: false },
]

export interface LoginEntry {
  id: number
  datetime: string
  device: string
  ip: string
  success: boolean
}

export const loginHistory: LoginEntry[] = [
  { id: 1, datetime: '24/06/2026 09:12', device: 'Chrome · MacBook Pro', ip: '189.45.12.7', success: true },
  { id: 2, datetime: '23/06/2026 18:42', device: 'Edge · Windows 11', ip: '201.17.88.4', success: true },
  { id: 3, datetime: '23/06/2026 08:05', device: 'Safari · iPhone 15', ip: '177.92.40.13', success: true },
  { id: 4, datetime: '22/06/2026 22:30', device: 'Desconhecido', ip: '45.231.10.2', success: false },
  { id: 5, datetime: '22/06/2026 14:11', device: 'Chrome · MacBook Pro', ip: '189.45.12.7', success: true },
]

export interface BankAccount {
  id: number
  bank: string
  agency: string
  account: string
  type: 'Corrente' | 'Poupança'
  pixType: string
  pixKey: string
  primary: boolean
  status: 'Validada' | 'Em validação'
}

export const bankAccounts: BankAccount[] = [
  { id: 1, bank: 'Nubank (260)', agency: '0001', account: '12345678-9', type: 'Corrente', pixType: 'CNPJ', pixKey: '12.345.678/0001-90', primary: true, status: 'Validada' },
  { id: 2, bank: 'Itaú (341)', agency: '4471', account: '00987-6', type: 'Corrente', pixType: 'E-mail', pixKey: 'financeiro@nummo.com', primary: false, status: 'Validada' },
  { id: 3, bank: 'Inter (077)', agency: '0001', account: '55012-3', type: 'Poupança', pixType: 'Aleatória', pixKey: 'a1b2c3d4-...-e5f6', primary: false, status: 'Em validação' },
]

export interface WebhookDelivery {
  id: number
  event: string
  httpStatus: number
  timestamp: string
  success: boolean
}

export const webhookEvents = [
  { id: 'payment.approved', label: 'Pagamento Aprovado' },
  { id: 'payment.refused', label: 'Pagamento Recusado' },
  { id: 'payment.refunded', label: 'Pagamento Reembolsado' },
  { id: 'balance.settled', label: 'Saldo Liquidado' },
  { id: 'chargeback.opened', label: 'Chargeback em Aberto' },
  { id: 'withdrawal.completed', label: 'Saque concluído' },
]

export const webhookHistory: WebhookDelivery[] = [
  { id: 1, event: 'payment.approved', httpStatus: 200, timestamp: '24/06/2026 09:31:02', success: true },
  { id: 2, event: 'balance.settled', httpStatus: 200, timestamp: '24/06/2026 08:00:15', success: true },
  { id: 3, event: 'chargeback.opened', httpStatus: 500, timestamp: '23/06/2026 21:44:51', success: false },
  { id: 4, event: 'payment.refused', httpStatus: 200, timestamp: '23/06/2026 17:10:09', success: true },
  { id: 5, event: 'payment.approved', httpStatus: 408, timestamp: '23/06/2026 12:03:30', success: false },
]

/** Eventos de venda que disparam notificações pessoais. */
export const personalNotifEvents = [
  { key: 'aprovada', label: 'Venda aprovada' },
  { key: 'pendente', label: 'Venda pendente' },
  { key: 'recusada', label: 'Venda recusada' },
] as const
