/* ----------------------------- Integrações ---------------------------- */
/* Catálogo mock de apps que o seller pode conectar. Tudo front-end — o    */
/* dev integra a conexão real (OAuth / API key / webhook) no backend.      */

import { Users, Mail, MessageCircle, Workflow, FileText, Boxes, Crosshair, type LucideIcon } from 'lucide-react'

export type IntegracaoCategoria =
  | 'Área de membros'
  | 'E-mail marketing'
  | 'WhatsApp & Chat'
  | 'Automação'
  | 'Nota fiscal'
  | 'ERP & Gestão'
  | 'Pixels & Rastreamento'

export type IntegracaoStatus = 'Conectado' | 'Disponível'

/** Tipo de credencial exigida — define os campos do drawer de configuração. */
export type IntegracaoConexao = 'apiKey' | 'token' | 'oauth' | 'webhook' | 'pixel'

export interface Integracao {
  id: string
  nome: string
  categoria: IntegracaoCategoria
  descricao: string
  conexao: IntegracaoConexao
  status: IntegracaoStatus
  /** Selo "Popular" no card. */
  popular?: boolean
  /** Campo extra no drawer (ex.: "URL da conta" do ActiveCampaign). */
  campoExtra?: string
  /** Conta/identificador exibido quando conectado (mock). */
  conta?: string
}

export interface CategoriaMeta {
  nome: IntegracaoCategoria
  descricao: string
  icon: LucideIcon
  /** Classes do tile do logo (fundo + texto). */
  tile: string
  /** Classes da pill da categoria. */
  pill: string
}

/* Cada categoria tem um acento de cor próprio (tiles + pills). */
export const CATEGORIAS: CategoriaMeta[] = [
  { nome: 'Área de membros', descricao: 'Entregue seus cursos e conteúdos.', icon: Users, tile: 'bg-violet-500/15 text-violet-300', pill: 'bg-violet-500/10 text-violet-300' },
  { nome: 'E-mail marketing', descricao: 'Dispare e-mails e automações a cada venda.', icon: Mail, tile: 'bg-sky-500/15 text-sky-300', pill: 'bg-sky-500/10 text-sky-300' },
  { nome: 'WhatsApp & Chat', descricao: 'Recupere vendas e avise clientes no zap.', icon: MessageCircle, tile: 'bg-emerald-500/15 text-emerald-300', pill: 'bg-emerald-500/10 text-emerald-300' },
  { nome: 'Automação', descricao: 'Conecte a Nummo a milhares de apps.', icon: Workflow, tile: 'bg-amber-500/15 text-amber-300', pill: 'bg-amber-500/10 text-amber-300' },
  { nome: 'Nota fiscal', descricao: 'Emita notas automaticamente nas vendas.', icon: FileText, tile: 'bg-teal-500/15 text-teal-300', pill: 'bg-teal-500/10 text-teal-300' },
  { nome: 'ERP & Gestão', descricao: 'Sincronize pedidos, estoque e financeiro.', icon: Boxes, tile: 'bg-cyan-500/15 text-cyan-300', pill: 'bg-cyan-500/10 text-cyan-300' },
  { nome: 'Pixels & Rastreamento', descricao: 'Rastreie conversões nas suas campanhas.', icon: Crosshair, tile: 'bg-rose-500/15 text-rose-300', pill: 'bg-rose-500/10 text-rose-300' },
]

export const categoriaMeta = (c: IntegracaoCategoria): CategoriaMeta =>
  CATEGORIAS.find((x) => x.nome === c) ?? CATEGORIAS[0]

/** Iniciais para o tile do logo (sem depender de imagens externas). */
export function initials(nome: string): string {
  const parts = nome.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const w = parts[0] ?? nome
  return w.slice(0, 2)
}

/** Eventos disparados para integrações de dados (e-mail, membros, automação…). */
export const EVENTOS_VENDA = [
  'Venda aprovada',
  'Venda pendente',
  'Venda recusada',
  'Reembolso',
  'Chargeback',
  'Assinatura cancelada',
]

/** Eventos rastreados por pixels. */
export const EVENTOS_PIXEL = ['Visita ao checkout', 'Pix/Boleto gerado', 'Compra aprovada']

export const integracoes: Integracao[] = [
  /* -------- Área de membros -------- */
  { id: 'memberkit', nome: 'Memberkit', categoria: 'Área de membros', descricao: 'Hospede seus cursos numa área de membros completa.', conexao: 'apiKey', status: 'Conectado', popular: true, conta: 'Conta #2210' },
  { id: 'themembers', nome: 'TheMembers', categoria: 'Área de membros', descricao: 'Plataforma de membros com aplicativo próprio.', conexao: 'token', status: 'Disponível' },
  { id: 'astron', nome: 'Astron Members', categoria: 'Área de membros', descricao: 'Área de membros integrada via webhook.', conexao: 'webhook', status: 'Disponível' },

  /* -------- E-mail marketing -------- */
  { id: 'activecampaign', nome: 'ActiveCampaign', categoria: 'E-mail marketing', descricao: 'Tags e automações de e-mail a cada compra.', conexao: 'apiKey', status: 'Conectado', popular: true, campoExtra: 'URL da conta', conta: 'conta-4821' },
  { id: 'rdstation', nome: 'RD Station', categoria: 'E-mail marketing', descricao: 'Marketing e CRM para nutrir seus leads.', conexao: 'oauth', status: 'Disponível', popular: true },
  { id: 'mailchimp', nome: 'Mailchimp', categoria: 'E-mail marketing', descricao: 'E-mail marketing com listas e segmentos.', conexao: 'apiKey', status: 'Disponível' },
  { id: 'leadlovers', nome: 'LeadLovers', categoria: 'E-mail marketing', descricao: 'Funis e sequências de e-mail automáticas.', conexao: 'apiKey', status: 'Disponível' },
  { id: 'getresponse', nome: 'GetResponse', categoria: 'E-mail marketing', descricao: 'E-mails, landing pages e automações.', conexao: 'apiKey', status: 'Disponível' },
  { id: 'brevo', nome: 'Brevo', categoria: 'E-mail marketing', descricao: 'E-mail e SMS marketing (ex-Sendinblue).', conexao: 'apiKey', status: 'Disponível' },

  /* -------- WhatsApp & Chat -------- */
  { id: 'botconversa', nome: 'BotConversa', categoria: 'WhatsApp & Chat', descricao: 'Automação de WhatsApp com chatbot.', conexao: 'apiKey', status: 'Conectado', popular: true, conta: '+55 11 9****-1234' },
  { id: 'manychat', nome: 'ManyChat', categoria: 'WhatsApp & Chat', descricao: 'Chatbots para WhatsApp, Instagram e Messenger.', conexao: 'apiKey', status: 'Disponível' },
  { id: 'voxuy', nome: 'Voxuy', categoria: 'WhatsApp & Chat', descricao: 'Recuperação de vendas por WhatsApp.', conexao: 'webhook', status: 'Disponível' },
  { id: 'sellflux', nome: 'SellFlux', categoria: 'WhatsApp & Chat', descricao: 'Recuperação e disparos multicanais.', conexao: 'webhook', status: 'Disponível' },
  { id: 'reportana', nome: 'Reportana', categoria: 'WhatsApp & Chat', descricao: 'WhatsApp e e-mail para e-commerce.', conexao: 'apiKey', status: 'Disponível' },
  { id: 'notif-inteligentes', nome: 'Notificações Inteligentes', categoria: 'WhatsApp & Chat', descricao: 'Avisos automáticos de venda por WhatsApp.', conexao: 'webhook', status: 'Disponível' },

  /* -------- Automação -------- */
  { id: 'zapier', nome: 'Zapier', categoria: 'Automação', descricao: 'Conecte a Nummo a mais de 6.000 apps.', conexao: 'oauth', status: 'Conectado', popular: true, conta: '3 Zaps ativos' },
  { id: 'pluga', nome: 'Pluga', categoria: 'Automação', descricao: 'Automações prontas, sem escrever código.', conexao: 'webhook', status: 'Disponível' },
  { id: 'n8n', nome: 'n8n', categoria: 'Automação', descricao: 'Automação open-source self-hosted.', conexao: 'webhook', status: 'Disponível' },

  /* -------- Nota fiscal -------- */
  { id: 'enotas', nome: 'eNotas', categoria: 'Nota fiscal', descricao: 'Emissão automática de NF-e e NFS-e.', conexao: 'token', status: 'Disponível' },
  { id: 'notazz', nome: 'Notazz', categoria: 'Nota fiscal', descricao: 'Notas fiscais automáticas nas vendas.', conexao: 'token', status: 'Disponível' },

  /* -------- ERP & Gestão -------- */
  { id: 'tiny', nome: 'Tiny', categoria: 'ERP & Gestão', descricao: 'ERP para pedidos, estoque e financeiro.', conexao: 'token', status: 'Disponível' },
  { id: 'bling', nome: 'Bling', categoria: 'ERP & Gestão', descricao: 'ERP com emissão de notas e logística.', conexao: 'oauth', status: 'Disponível' },

  /* -------- Pixels & Rastreamento -------- */
  { id: 'meta-pixel', nome: 'Meta Pixel', categoria: 'Pixels & Rastreamento', descricao: 'Rastreie conversões no Facebook e Instagram.', conexao: 'pixel', status: 'Conectado', popular: true, conta: '812•••234' },
  { id: 'google-ads', nome: 'Google Ads', categoria: 'Pixels & Rastreamento', descricao: 'Acompanhe conversões das suas campanhas.', conexao: 'pixel', status: 'Disponível' },
  { id: 'ga4', nome: 'Google Analytics 4', categoria: 'Pixels & Rastreamento', descricao: 'Meça o comportamento no seu checkout.', conexao: 'pixel', status: 'Disponível' },
  { id: 'tiktok-pixel', nome: 'TikTok Pixel', categoria: 'Pixels & Rastreamento', descricao: 'Otimize campanhas com eventos de compra.', conexao: 'pixel', status: 'Disponível' },
  { id: 'kwai-pixel', nome: 'Kwai Pixel', categoria: 'Pixels & Rastreamento', descricao: 'Rastreie conversões dos anúncios no Kwai.', conexao: 'pixel', status: 'Disponível' },
  { id: 'utmify', nome: 'UTMify', categoria: 'Pixels & Rastreamento', descricao: 'Atribua vendas às suas UTMs automaticamente.', conexao: 'apiKey', status: 'Conectado', popular: true, conta: 'workspace pedro' },
]
