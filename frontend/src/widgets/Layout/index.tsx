import type { ReactNode } from 'react'
import { Sidebar } from '@/widgets/Sidebar'
import { Header } from '@/widgets/Header'

interface Props {
  children: ReactNode
  title: string
  actions?: ReactNode
  breadcrumb?: string
}

export function Layout({ children, title, actions, breadcrumb }: Props) {
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-60">
        <Header title={title} actions={actions} breadcrumb={breadcrumb} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
