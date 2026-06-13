import { Outlet } from 'react-router'
import '@/styles/manuscript.css'

export default function ManuscriptLayout() {
  return (
    <main className="site-main-manuscript">
      <Outlet />
    </main>
  )
}
