import { Outlet, useOutletContext } from 'react-router-dom'
import { Header } from '../Header'
import type { LayoutContext } from '../Layout'
import { ReportTabs } from './reportsPrimitives'

export function ReportsLayout() {
  const { onOpenMobile } = useOutletContext<LayoutContext>()
  return (
    <>
      <Header title="Relatórios" subtitle="Clientes, entradas e saídas da sua conta." onOpenMobile={onOpenMobile} />
      <ReportTabs />
      <Outlet />
    </>
  )
}
