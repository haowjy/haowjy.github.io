import { Outlet } from 'react-router'
import '@/styles/prose.css'
import '@/styles/notes-reader.css'
import '@/styles/notes-prose.css'
import '@/styles/notes-viz.css'

export default function NotesLayout() {
  return (
    <main className="site-main-notes">
      <Outlet />
    </main>
  )
}
