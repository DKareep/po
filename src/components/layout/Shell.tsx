import Header from '@/components/layout/header/Header.tsx'
import Sidebar from '@/components/layout/sidebar/Sidebar.tsx'
import { Outlet } from 'react-router-dom'

interface Props {
  variant: 'admin' | 'driver'
}
const Shell = ({ variant }: Props) => {
  return (
    <div className="flex h-screen">
      <Sidebar variant={variant} />

      <div className="flex flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Shell
