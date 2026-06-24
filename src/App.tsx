import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
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
import { Placeholder } from './pages/Placeholder'
import { navItems } from './data/mockData'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configuracoes" element={<Settings />} />

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

        {/* Integrações — Webhooks (movido das Configurações) */}
        <Route path="/integracoes/webhooks" element={<Webhooks />} />

        {/* Telas em construção — geradas a partir do menu */}
        {navItems.flatMap((item) => {
          if (item.label === 'Relatório' || item.label === 'Financeiro' || item.label === 'Integrações') return []
          if (item.children) {
            return item.children.map((child) => (
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
