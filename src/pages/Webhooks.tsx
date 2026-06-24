import { useOutletContext } from 'react-router-dom'
import { Header } from '../components/Header'
import type { LayoutContext } from '../components/Layout'
import { WebhooksSection } from '../components/settings/AccountSections'

export default function Webhooks() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  return (
    <>
      <Header title="Integrações" subtitle="Conecte a Nummo aos seus sistemas." onOpenMobile={onOpenMobile} />
      <WebhooksSection />
    </>
  )
}
