import { Navigate } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebaseConfig'

export default function ProtectedRoute({ children }) {
  const [user, loading, error] = useAuthState(auth)
  console.log('Auth state:', { user, loading, error })

  if (loading) return <h1>Loading auth state...</h1>
  if (error) return <h1>Error: {error.message}</h1>
  if (!user) return <Navigate to="/" replace />

  return children
}
