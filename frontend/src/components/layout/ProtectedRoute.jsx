import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui'

/**
 * Gate for history / analytics / saved boards. While the cached session is
 * being revalidated we hold the route rather than bouncing to /login, so a page
 * refresh never logs the user out visually.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Restoring session" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
