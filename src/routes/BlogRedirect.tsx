import { Navigate, useLocation } from 'react-router'

/** Old /blog URLs live on at /notes. */
export default function BlogRedirect() {
  const location = useLocation()
  const rest = location.pathname.replace(/^\/blog\/?/, '')
  const target = rest ? `/notes/${rest}` : '/notes'
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />
}
