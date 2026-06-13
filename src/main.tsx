import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { appRoutes } from '@/router'
import './styles/global.css'
import './styles/home.css'
import './styles/prose.css'
import './styles/notes-reader.css'
import './styles/notes-prose.css'
import './styles/notes-viz.css'

const router = createBrowserRouter(appRoutes)
const container = document.getElementById('root')!
const app = (
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)

if (container.hasChildNodes()) {
  hydrateRoot(container, app)
} else {
  createRoot(container).render(app)
}
