import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router'
import App from './App'
import HomeRoute from './routes/index'
import BlogRoute from './routes/blog'
import BlogPostRoute from './routes/blog.$slug'
import ProjectsRoute from './routes/projects'
import './styles/global.css'
import './styles/prose.css'

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        Component: HomeRoute,
      },
      {
        path: 'blog',
        Component: BlogRoute,
      },
      {
        path: 'blog/:slug',
        Component: BlogPostRoute,
      },
      {
        path: 'projects',
        Component: ProjectsRoute,
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
