import { clients, type Entrada } from '../../data/reportsData'
import { formatCurrency } from '../../lib/utils'
import { Drawer, DetailRow, DrawerSection, StatusBadge, TypeBadge, Timeline } from './reportsPrimitives'

const fmtDateTime = (d: Date) =>
  `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`

function timelineFor(status: string): { steps: string[]; current: number } {
  switch (status) {
    case 'Aprovado':
      return { steps: ['Criado', 'Processando', 'Aprovado'], current: 2 }
    case 'Pendente':
      return { steps: ['Criado', 'Processando'], current: 1 }
    case 'Estornado':
      return { steps: ['Criado', 'Processando', 'Aprovado', 'Estornado'], current: 3 }
    case 'Bloqueado':
      return { steps: ['Criado', 'Processando', 'Bloqueado'], current: 2 }
    case 'Chargeback':
      return { steps: ['Criado', 'Processando', 'Aprovado', 'Chargeback'], current: 3 }
    default:
      return { steps: ['Criado', 'Processando'], current: 1 }
  }
}

export function EntradaDrawer({ entrada, onClose }: { entrada: Entrada | null; onClose: () => void }) {
  const client = entrada ? clients.find((c) => c.id === entrada.clientId) : null

  return (
    <Drawer open={!!entrada} title="Detalhes da transação" onClose={onClose}>
      {entrada && client && (
        <>
          <DrawerSection title="Transação">
            <DetailRow label="ID" value={<span className="font-mono">{entrada.txId}</span>} />
            <DetailRow label="Data" value={fmtDateTime(entrada.date)} />
            <DetailRow label="Produto" value={entrada.product} />
            <DetailRow label="Tipo" value={<TypeBadge type={entrada.type} />} />
            <DetailRow label="Status" value={<StatusBadge status={entrada.status} />} />
            <DetailRow label="Valor" value={formatCurrency(entrada.value)} />
            <DetailRow label="Comissão (nummo)" value={formatCurrency(entrada.commission)} />
          </DrawerSection>

          <DrawerSection title="Comprador">
            <DetailRow label="Nome" value={client.name} />
            <DetailRow label="E-mail" value={client.email} />
            <DetailRow label="CPF / CNPJ" value={client.document} />
          </DrawerSection>

          <DrawerSection title="Pagamento">
            <DetailRow label="Método" value={entrada.method} />
            <DetailRow label="NSU" value={entrada.nsu} />
            <DetailRow label="Autorizadora" value={entrada.authorizer} />
            {entrada.brand && <DetailRow label="Bandeira" value={entrada.brand} />}
            {entrada.barcode && (
              <DetailRow label="Código de barras" value={<span className="font-mono text-xs">{entrada.barcode}</span>} />
            )}
            {entrada.pixKey && <DetailRow label="Chave Pix" value={entrada.pixKey} />}
          </DrawerSection>

          <DrawerSection title="Linha do tempo">
            <Timeline {...timelineFor(entrada.status)} />
          </DrawerSection>
        </>
      )}
    </Drawer>
  )
}
