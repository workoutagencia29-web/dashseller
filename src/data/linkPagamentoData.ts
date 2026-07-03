/* ----------------------------- Link de Pagamento ---------------------- */
/* Tudo mock — o dev integra a geração/cobrança real no backend.          */

export type LinkTipo = 'Avulso' | 'Produto'
export type LinkCobranca = 'Única' | 'Assinatura'
export type LinkFreq = 'Mensal' | 'Anual'
export type LinkStatus = 'Ativo' | 'Pago' | 'Expirado' | 'Desativado'

export interface PaymentLink {
  id: number
  slug: string
  titulo: string
  tipo: LinkTipo
  /** Produto vinculado (quando tipo = Produto). */
  produto?: string
  cobranca: LinkCobranca
  frequencia?: LinkFreq
  valor: number
  /** Cliente escolhe o valor (doação/valor aberto). */
  valorAberto: boolean
  metodos: { pix: boolean; cartao: boolean; boleto: boolean }
  /** Parcelamento máximo no cartão (1 = à vista). */
  parcelas: number
  /** Data de expiração (exibição pt-BR) ou null = sem validade. */
  validade: string | null
  /** Limite de pagamentos ou null = ilimitado. */
  limiteUsos: number | null
  cupom: string | null
  redirect: string | null
  /** Order bump: oferta extra no checkout. */
  orderBump: { produto: string; valor: number } | null
  cliques: number
  pagamentos: number
  criadoEm: string
  status: LinkStatus
}

/** Domínio de checkout (mesma infra dos domínios). */
const LINK_BASE = 'pay.nummo.cloud/l'

export const linkUrl = (slug: string) => `${LINK_BASE}/${slug}`

/** Catálogo de produtos do seller (para vincular ou usar como order bump). */
export const PRODUTOS: { nome: string; valor: number }[] = [
  { nome: 'Curso de Tráfego Pago', valor: 497 },
  { nome: 'Mentoria Premium', valor: 1997 },
  { nome: 'Ebook Copywriting', valor: 47 },
  { nome: 'Planilha de Gestão', valor: 89.9 },
  { nome: 'Comunidade VIP', valor: 79 },
  { nome: 'Consultoria 1:1', valor: 350 },
]

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export function formatLinkDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`
}

const ALFA = 'abcdefghijklmnopqrstuvwxyz0123456789'
export function randomSlug(): string {
  let s = ''
  for (let i = 0; i < 6; i++) s += ALFA[Math.floor(Math.random() * ALFA.length)]
  return s
}

export const linksSeed: PaymentLink[] = [
  {
    id: 1,
    slug: 'trafego',
    titulo: 'Curso de Tráfego Pago',
    tipo: 'Produto',
    produto: 'Curso de Tráfego Pago',
    cobranca: 'Única',
    valor: 497,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: true },
    parcelas: 12,
    validade: null,
    limiteUsos: null,
    cupom: 'LANCAMENTO10',
    redirect: 'https://obrigado.seusite.com',
    orderBump: { produto: 'Ebook Copywriting', valor: 27 },
    cliques: 1840,
    pagamentos: 312,
    criadoEm: '02 mai 2026',
    status: 'Ativo',
  },
  {
    id: 2,
    slug: 'mentoria',
    titulo: 'Mentoria Premium (assinatura)',
    tipo: 'Produto',
    produto: 'Mentoria Premium',
    cobranca: 'Assinatura',
    frequencia: 'Mensal',
    valor: 1997,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 620,
    pagamentos: 48,
    criadoEm: '18 mar 2026',
    status: 'Ativo',
  },
  {
    id: 3,
    slug: 'consult1',
    titulo: 'Consultoria avulsa — João',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 350,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 3,
    validade: '10 jul 2026',
    limiteUsos: 1,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 12,
    pagamentos: 1,
    criadoEm: '26 jun 2026',
    status: 'Pago',
  },
  {
    id: 4,
    slug: 'apoie01',
    titulo: 'Apoie o projeto (valor livre)',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 30, // ticket médio mock (cliente define o valor; usado só p/ estimar o "Recebido")
    valorAberto: true,
    metodos: { pix: true, cartao: false, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 430,
    pagamentos: 87,
    criadoEm: '11 jun 2026',
    status: 'Ativo',
  },
  {
    id: 5,
    slug: 'blackfr',
    titulo: 'Combo Black Friday',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 297,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: true },
    parcelas: 12,
    validade: '30 nov 2025',
    limiteUsos: 500,
    cupom: 'BLACK50',
    redirect: null,
    orderBump: null,
    cliques: 5210,
    pagamentos: 498,
    criadoEm: '20 nov 2025',
    status: 'Expirado',
  },
  {
    id: 6,
    slug: 'planilh',
    titulo: 'Planilha de Gestão',
    tipo: 'Produto',
    produto: 'Planilha de Gestão',
    cobranca: 'Única',
    valor: 89.9,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 2,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 940,
    pagamentos: 156,
    criadoEm: '04 abr 2026',
    status: 'Ativo',
  },
  {
    id: 7,
    slug: 'vipmens',
    titulo: 'Comunidade VIP',
    tipo: 'Produto',
    produto: 'Comunidade VIP',
    cobranca: 'Assinatura',
    frequencia: 'Mensal',
    valor: 79,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 280,
    pagamentos: 0,
    criadoEm: '29 jun 2026',
    status: 'Desativado',
  },
  {
    id: 8,
    slug: 'ebookcp',
    titulo: 'Ebook Copywriting',
    tipo: 'Produto',
    produto: 'Ebook Copywriting',
    cobranca: 'Única',
    valor: 47,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 2130,
    pagamentos: 388,
    criadoEm: '15 fev 2026',
    status: 'Ativo',
  },
  {
    id: 9,
    slug: 'combo3x',
    titulo: 'Combo 3 cursos',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 897,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: true },
    parcelas: 12,
    validade: null,
    limiteUsos: null,
    cupom: 'COMBO15',
    redirect: 'https://obrigado.seusite.com',
    orderBump: { produto: 'Consultoria 1:1', valor: 250 },
    cliques: 1490,
    pagamentos: 121,
    criadoEm: '08 jan 2026',
    status: 'Ativo',
  },
  {
    id: 10,
    slug: 'consul2',
    titulo: 'Consultoria avulsa — Ana',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 350,
    valorAberto: false,
    metodos: { pix: true, cartao: false, boleto: false },
    parcelas: 1,
    validade: '22 jul 2026',
    limiteUsos: 1,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 8,
    pagamentos: 1,
    criadoEm: '28 jun 2026',
    status: 'Pago',
  },
  {
    id: 11,
    slug: 'vipanul',
    titulo: 'Comunidade VIP (anual)',
    tipo: 'Produto',
    produto: 'Comunidade VIP',
    cobranca: 'Assinatura',
    frequencia: 'Anual',
    valor: 790,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 510,
    pagamentos: 63,
    criadoEm: '19 abr 2026',
    status: 'Ativo',
  },
  {
    id: 12,
    slug: 'express',
    titulo: 'Curso Express (turma 1)',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 67,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: true },
    parcelas: 3,
    validade: '15 mai 2026',
    limiteUsos: 300,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 3040,
    pagamentos: 274,
    criadoEm: '01 mai 2026',
    status: 'Expirado',
  },
  {
    id: 13,
    slug: 'doacao1',
    titulo: 'Doações de fim de ano',
    tipo: 'Avulso',
    cobranca: 'Única',
    valor: 25, // ticket médio mock (cliente define o valor; usado só p/ estimar o "Recebido")
    valorAberto: true,
    metodos: { pix: true, cartao: false, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 690,
    pagamentos: 142,
    criadoEm: '05 dez 2025',
    status: 'Ativo',
  },
  {
    id: 14,
    slug: 'mentan1',
    titulo: 'Mentoria Premium (anual)',
    tipo: 'Produto',
    produto: 'Mentoria Premium',
    cobranca: 'Assinatura',
    frequencia: 'Anual',
    valor: 19970,
    valorAberto: false,
    metodos: { pix: true, cartao: true, boleto: false },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: 'ANUAL20',
    redirect: null,
    orderBump: null,
    cliques: 340,
    pagamentos: 22,
    criadoEm: '12 fev 2026',
    status: 'Ativo',
  },
  {
    id: 15,
    slug: 'planbol',
    titulo: 'Planilha de Gestão (boleto)',
    tipo: 'Produto',
    produto: 'Planilha de Gestão',
    cobranca: 'Única',
    valor: 89.9,
    valorAberto: false,
    metodos: { pix: false, cartao: false, boleto: true },
    parcelas: 1,
    validade: null,
    limiteUsos: null,
    cupom: null,
    redirect: null,
    orderBump: null,
    cliques: 120,
    pagamentos: 9,
    criadoEm: '24 jun 2026',
    status: 'Desativado',
  },
]

export const NEXT_LINK_ID = linksSeed.reduce((m, l) => Math.max(m, l.id), 0) + 1
