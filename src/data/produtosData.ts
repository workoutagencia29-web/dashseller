/* ------------------------------- Produtos ----------------------------- */
/* Tudo mock (sem backend). O seller cadastra produtos e cada um ganha um   */
/* link de checkout. O dev pluga a criação/cobrança real depois.            */

export type ProdutoTipo = 'Curso' | 'Ebook' | 'Mentoria' | 'Comunidade' | 'Consultoria' | 'Serviço' | 'Outro'

export interface Produto {
  id: number
  nome: string
  descricao: string
  /** Preço em reais. */
  preco: number
  tipo: ProdutoTipo
  /** Slug do link de checkout: pay.nummo.cloud/p/{slug}. */
  slug: string
  /** Produto ativo (checkout responde) ou pausado. */
  ativo: boolean
  vendas: number
  /** Data de criação (exibição pt-BR). */
  criadoEm: string
}

export const TIPOS: ProdutoTipo[] = ['Curso', 'Ebook', 'Mentoria', 'Comunidade', 'Consultoria', 'Serviço', 'Outro']

/** Domínio de checkout (mesma infra dos domínios). */
export const CHECKOUT_BASE = 'pay.nummo.cloud/p'
export const checkoutUrl = (slug: string) => `${CHECKOUT_BASE}/${slug}`

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
export const formatProdutoDate = (d: Date) =>
  `${String(d.getDate()).padStart(2, '0')} ${MESES[d.getMonth()]} ${d.getFullYear()}`

/** Gera um slug limpo a partir do nome (sem acento, minúsculo, com hífens). */
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)

export const produtosSeed: Produto[] = [
  { id: 1, nome: 'Mentoria Premium', descricao: 'Acompanhamento individual por 3 meses.', preco: 1997, tipo: 'Mentoria', slug: 'mentoria-premium', ativo: true, vendas: 128, criadoEm: '12 mar 2026' },
  { id: 2, nome: 'Curso de Tráfego Pago', descricao: 'Do zero ao gerenciador — 40 aulas.', preco: 497, tipo: 'Curso', slug: 'curso-de-trafego-pago', ativo: true, vendas: 342, criadoEm: '04 fev 2026' },
  { id: 3, nome: 'Ebook Copywriting', descricao: 'Gatilhos e estruturas de copy que vendem.', preco: 47, tipo: 'Ebook', slug: 'ebook-copywriting', ativo: true, vendas: 891, criadoEm: '20 jan 2026' },
  { id: 4, nome: 'Comunidade VIP', descricao: 'Grupo fechado + lives semanais (assinatura).', preco: 97, tipo: 'Comunidade', slug: 'comunidade-vip', ativo: true, vendas: 214, criadoEm: '08 dez 2025' },
  { id: 5, nome: 'Consultoria 1:1', descricao: 'Sessão estratégica de 90 minutos.', preco: 750, tipo: 'Consultoria', slug: 'consultoria-1-1', ativo: false, vendas: 36, criadoEm: '15 nov 2025' },
  { id: 6, nome: 'Planilha de Gestão', descricao: 'Controle financeiro do seu negócio digital.', preco: 27, tipo: 'Outro', slug: 'planilha-de-gestao', ativo: true, vendas: 502, criadoEm: '02 out 2025' },
]
