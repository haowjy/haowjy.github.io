import { Navigate, useLocation, type RouteObject } from 'react-router'
import App from '@/App'
import HomeRoute from '@/routes/index'
import NotesIndexRoute from '@/routes/notes'
import NotesPostRoute from '@/routes/notes/$slug'

function BlogRedirect() {
  const location = useLocation()
  const rest = location.pathname.replace(/^\/blog\/?/, '')
  const target = rest ? `/notes/${rest}` : '/notes'
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />
}

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    children: [
      {
        index: true,
        Component: HomeRoute,
      },
      {
        path: 'notes',
        Component: NotesIndexRoute,
      },
      {
        path: 'notes/:slug',
        Component: NotesPostRoute,
      },
      {
        path: 'blog',
        Component: BlogRedirect,
      },
      {
        path: 'blog/*',
        Component: BlogRedirect,
      },
    ],
  },
]
