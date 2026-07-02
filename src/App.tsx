import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Conta from './pages/Conta'
import ClienteDetalhe from './pages/ClienteDetalhe'
import { ReportsLayout } from './components/reports/ReportsLayout'
import { ClientesTab } from './components/reports/ClientesTab'
import { EntradasTab } from './components/reports/EntradasTab'
import { SaidasTab } from './components/reports/SaidasTab'
import AssinaturaDetalhe from './pages/AssinaturaDetalhe'
import { FinanceiroLayout } from './components/financeiro/FinanceiroLayout'
import { GeralTab } from './components/financeiro/GeralTab'
import { AssinaturasTab } from './components/financeiro/AssinaturasTab'
import { LinkPagamentoTab } from './components/financeiro/LinkPagamentoTab'
import { ContestacoesTab } from './components/financeiro/ContestacoesTab'
import { TaxasTab } from './components/financeiro/TaxasTab'
import Webhooks from './pages/Webhooks'
import ConfigDominio from './pages/ConfigDominio'
import MeusDominios from './pages/MeusDominios'
import GerenciadorAfiliados from './pages/GerenciadorAfiliados'
import MeusAfiliados from './pages/MeusAfiliados'
import { Placeholder } from './pages/Placeholder'
import { navItems } from './data/mockData'

/** Sub-rotas com página própria — não geram placeholder automático. */
const EXPLICIT_CHILD_PATHS = new Set([
  '/produto/config-dominio',
  '/produto/meus-dominios',
  '/afiliados/gerenciador',
  '/afiliados/meus-afiliados',
  '/integracoes/webhooks',
])

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configuracoes" element={<Settings />} />
        <Route path="/conta" element={<Conta />} />

        {/* Relatórios — abas reais */}
        <Route element={<ReportsLayout />}>
          <Route path="/relatorio/clientes" element={<ClientesTab />} />
          <Route path="/relatorio/entradas" element={<EntradasTab />} />
          <Route path="/relatorio/saidas" element={<SaidasTab />} />
        </Route>
        <Route path="/relatorio/clientes/:id" element={<ClienteDetalhe />} />

        {/* Financeiro — abas reais */}
        <Route element={<FinanceiroLayout />}>
          <Route path="/financeiro/geral" element={<GeralTab />} />
          <Route path="/financeiro/assinaturas" element={<AssinaturasTab />} />
          <Route path="/financeiro/link-de-pagamento" element={<LinkPagamentoTab />} />
          <Route path="/financeiro/contestacoes" element={<ContestacoesTab />} />
          <Route path="/financeiro/taxas" element={<TaxasTab />} />
        </Route>
        <Route path="/financeiro/assinaturas/:id" element={<AssinaturaDetalhe />} />

        {/* Produto — domínios do checkout */}
        <Route path="/produto/config-dominio" element={<ConfigDominio />} />
        <Route path="/produto/meus-dominios" element={<MeusDominios />} />

        {/* Afiliados */}
        <Route path="/afiliados/gerenciador" element={<GerenciadorAfiliados />} />
        <Route path="/afiliados/meus-afiliados" element={<MeusAfiliados />} />

        {/* Integrações — Webhooks (movido das Configurações) */}
        <Route path="/integracoes/webhooks" element={<Webhooks />} />

        {/* Telas em construção — geradas a partir do menu */}
        {navItems.flatMap((item) => {
          if (item.label === 'Relatório' || item.label === 'Financeiro') return []
          if (item.children) {
            return item.children
              .filter((child) => !EXPLICIT_CHILD_PATHS.has(child.path))
              .map((child) => (
                <Route
                  key={child.path}
                  path={child.path}
                  element={<Placeholder title={child.label} />}
                />
              ))
          }
          if (item.path && item.path !== '/') {
            return [
              <Route
                key={item.path}
                path={item.path}
                element={<Placeholder title={item.label} />}
              />,
            ]
          }
          return []
        })}

        <Route path="*" element={<Placeholder title="Página não encontrada" />} />
      </Route>
    </Routes>
  )
}
