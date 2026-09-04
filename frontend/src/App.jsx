import { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Spinner } from '@/components/ui'

import LandingPage from '@/pages/Landing'
import VisualizerPage from '@/pages/Visualizer'
import AlgorithmsPage from '@/pages/Algorithms'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import NotFoundPage from '@/pages/NotFound'
import ApiUnavailablePage from '@/pages/ApiUnavailable'
import { DEMO_MODE } from '@/lib/constants'

// Chart-heavy routes are split out so the visualiser bundle stays lean.
const ComparePage = lazy(() => import('@/pages/Compare'))
const AnalyticsPage = lazy(() => import('@/pages/Analytics'))
const HistoryPage = lazy(() => import('@/pages/History'))
const SavedGridsPage = lazy(() => import('@/pages/SavedGrids'))
const TechnicalPage = lazy(() => import('@/pages/Technical'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner label="Loading page" />
    </div>
  )
}

/**
 * Routes that require the Django API. In the static demo build they render an
 * explainer instead of a login redirect that could never succeed.
 */
function ApiRoute({ children }) {
  if (DEMO_MODE) return <ApiUnavailablePage />
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/visualizer" element={<VisualizerPage />} />
            <Route path="/algorithms" element={<AlgorithmsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/technical" element={<TechnicalPage />} />
            <Route
              path="/login"
              element={DEMO_MODE ? <ApiUnavailablePage /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={DEMO_MODE ? <ApiUnavailablePage /> : <RegisterPage />}
            />
            <Route
              path="/history"
              element={
                <ApiRoute>
                  <HistoryPage />
                </ApiRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ApiRoute>
                  <AnalyticsPage />
                </ApiRoute>
              }
            />
            <Route
              path="/grids"
              element={
                <ApiRoute>
                  <SavedGridsPage />
                </ApiRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
