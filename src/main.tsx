import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import { appRoutes } from '@/router'
import './styles/global.css'
import './styles/prose.css'

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
