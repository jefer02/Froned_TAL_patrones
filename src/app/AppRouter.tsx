import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { DashboardPage } from '../pages/DashboardPage'
import { LoginPage } from '../pages/LoginPage'
import { useAuth } from '../hooks/useAuth'

const LandingRedirect = () => {
  const { isAuthenticated } = useAuth()

  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<LandingRedirect />} />
    </Routes>
  )
}
