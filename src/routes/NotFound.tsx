import { Link } from 'react-router'
import Topbar from '@/components/layout/Topbar'

export default function NotFoundRoute() {
  return (
    <>
      <Topbar />
      <main id="main" className="archive">
        <h1 className="archive__title">Not here.</h1>
        <p className="archive__dek">
          That page doesn&rsquo;t exist. Try the <Link to="/">homepage</Link> or the{' '}
          <Link to="/notes">notes</Link>.
        </p>
      </main>
    </>
  )
}
