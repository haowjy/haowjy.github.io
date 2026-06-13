import { Navigate, useLocation, type RouteObject } from 'react-router'
import AppShell from '@/components/layout/AppShell'
import ManuscriptLayout from '@/components/layout/ManuscriptLayout'
import NotesLayout from '@/components/layout/NotesLayout'
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
    Component: AppShell,
    children: [
      {
        handle: { section: 'manuscript' },
        Component: ManuscriptLayout,
        children: [
          {
            index: true,
            Component: HomeRoute,
          },
        ],
      },
      {
        path: 'notes',
        handle: { section: 'notes' },
        Component: NotesLayout,
        children: [
          {
            index: true,
            Component: NotesIndexRoute,
          },
          {
            path: ':slug',
            Component: NotesPostRoute,
          },
        ],
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
