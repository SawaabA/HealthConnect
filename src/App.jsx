import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LandingPage from './pages/LandingPage'
import RoleSelectPage from './pages/RoleSelectPage'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import EmergencyCard from './pages/EmergencyCard'

// Extract role from Auth0 token claims
function useUserRole() {
  const { user } = useAuth0()
  if (!user) return null
  // Auth0 Post-Login Action injects role under this namespace
  const roles = user['https://healthconnect.app/roles'] || []
  if (Array.isArray(roles) && roles.length > 0) return roles[0].toLowerCase()
  // Fallback: check standard roles claim
  if (user['https://healthconnect.app/role']) return user['https://healthconnect.app/role'].toLowerCase()
  return null
}

// Protected route: redirects to / if not authenticated
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading } = useAuth0()
  const role = useUserRole()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/" replace />

  if (requiredRole && role && role !== requiredRole) {
    // Redirect to the correct dashboard based on actual role
    return <Navigate to={`/${role}`} replace />
  }

  return children
}

// After login, read role and redirect accordingly
function RoleRedirect() {
  const { isAuthenticated, isLoading } = useAuth0()
  const role = useUserRole()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Signing you in...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LandingPage />
  if (role === 'patient') return <Navigate to="/patient" replace />
  if (role === 'doctor') return <Navigate to="/doctor" replace />
  // No role assigned yet — still show landing with a message
  return <LandingPage noRole />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/role-select" element={<RoleSelectPage />} />
        <Route
          path="/patient"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/emergency/:patientId" element={<EmergencyCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
