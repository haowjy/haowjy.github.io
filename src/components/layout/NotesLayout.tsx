import { Outlet } from 'react-router'
import '@/styles/notes/index.css'

export default function NotesLayout() {
  return (
    <main className="site-main-notes">
      <Outlet />
    </main>
  )
}
