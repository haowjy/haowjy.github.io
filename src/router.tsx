import type { RouteObject } from 'react-router'
import AppShell from '@/components/layout/AppShell'
import BlogRedirect from '@/routes/BlogRedirect'
import HomeRoute from '@/routes/index'
import NotFoundRoute from '@/routes/NotFound'
import NotesIndexRoute from '@/routes/notes'
import NotesPostRoute from '@/routes/notes/$slug'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    Component: AppShell,
    children: [
      { index: true, Component: HomeRoute },
      { path: 'notes', Component: NotesIndexRoute },
      { path: 'notes/:slug', Component: NotesPostRoute },
      { path: 'blog', Component: BlogRedirect },
      { path: 'blog/*', Component: BlogRedirect },
      { path: '*', Component: NotFoundRoute },
    ],
  },
]
