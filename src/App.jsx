import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LandingPage from './pages/LandingPage'
import RoleSelectPage from './pages/RoleSelectPage'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorVerifyPage from './pages/DoctorVerifyPage'
import EmergencyCard from './pages/EmergencyCard'

// Extract role from Auth0 token claims
function useUserRole() {
  const { user } = useAuth0()
  if (!user) return null
  const roles = user['https://healthconnect.app/roles'] || []
  if (Array.isArray(roles) && roles.length > 0) return roles[0].toLowerCase()
  if (user['https://healthconnect.app/role']) return user['https://healthconnect.app/role'].toLowerCase()
  return null
}

// Loading spinner shared between guards
function Spinner({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Protected route: bounces to / if not authenticated, or wrong role
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, isLoading } = useAuth0()
  const role = useUserRole()

  if (isLoading) return <Spinner />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (requiredRole && role && role !== requiredRole) return <Navigate to={`/${role}`} replace />
  return children
}

// Doctor route: requires auth + doctor role + credential verification
function DoctorRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()
  const role = useUserRole()
  const verified = sessionStorage.getItem('hc_doctor_verified') === '1'

  if (isLoading) return <Spinner message="Signing you in..." />
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (role && role !== 'doctor') return <Navigate to={`/${role}`} replace />
  // Must complete credential verification first
  if (!verified) return <Navigate to="/doctor-verify" replace />
  return children
}

// After Auth0 callback, read role and redirect
function RoleRedirect() {
  const { isAuthenticated, isLoading, error } = useAuth0()
  const role = useUserRole()

  if (isLoading) return <Spinner message="Signing you in..." />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-900 mb-2">Authentication Error</h2>
          <p className="text-red-700 text-sm mb-6">{error.message}</p>
          <button onClick={() => window.location.href = '/'} className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return <LandingPage />

  // Use Auth0 role if set, otherwise fall back to what the user selected before login.
  // This lets the app work even before the Auth0 Post-Login Action is configured.
  const effectiveRole = role || sessionStorage.getItem('hc_intended_role')

  if (effectiveRole === 'patient') return <Navigate to="/patient" replace />
  if (effectiveRole === 'doctor') return <Navigate to="/doctor-verify" replace />
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

        {/* Credential verification gate (only for authenticated doctors) */}
        <Route
          path="/doctor-verify"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorVerifyPage />
            </ProtectedRoute>
          }
        />

        {/* Doctor dashboard — requires verification */}
        <Route
          path="/doctor"
          element={
            <DoctorRoute>
              <DoctorDashboard />
            </DoctorRoute>
          }
        />

        <Route path="/emergency/:patientId" element={<EmergencyCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
