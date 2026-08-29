import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/** Routes that behave like an application surface rather than a document. */
const FULL_BLEED_ROUTES = ['/visualizer', '/compare']

export function AppShell() {
  const { pathname } = useLocation()
  const isFullBleed = FULL_BLEED_ROUTES.some((route) => pathname.startsWith(route))

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-hairline focus:bg-elevated focus:px-3 focus:py-1.5 focus:text-xs focus:text-ink"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      {isFullBleed ? null : <Footer />}
    </div>
  )
}

export default AppShell
