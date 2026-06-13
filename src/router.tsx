import type { RouteObject } from 'react-router'
import App from '@/App'
import BlogPostRoute from '@/routes/blog.$slug'
import BlogRoute from '@/routes/blog'
import HomeRoute from '@/routes/index'

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
        path: 'blog',
        Component: BlogRoute,
      },
      {
        path: 'blog/:slug',
        Component: BlogPostRoute,
      },
    ],
  },
]
