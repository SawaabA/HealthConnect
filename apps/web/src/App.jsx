import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LandingPage from './pages/LandingPage'
import RoleSelectPage from './pages/RoleSelectPage'
import PatientDashboard from './pages/PatientDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorVerifyPage from './pages/DoctorVerifyPage'
import EmergencyCard from './pages/EmergencyCard'
import AdminDashboard from './pages/AdminDashboard'
import { extractRole } from './lib/auth'

const ADMIN_ENABLED = import.meta.env.VITE_ENABLE_ADMIN === 'true'

// Extract role from Auth0 token claims
function useUserRole() {
  const { user } = useAuth0()
  return extractRole(user)
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
  const { isAuthenticated, isLoading } = useAuth0()
  const role = useUserRole()

  if (isLoading) return <Spinner message="Signing you in..." />
  if (!isAuthenticated) return <LandingPage />

  // Use Auth0 role if set, otherwise fall back to what the user selected before login.
  // This lets the app work even before the Auth0 Post-Login Action is configured.
  const effectiveRole = role || sessionStorage.getItem('hc_intended_role')

  if (effectiveRole === 'patient') return <Navigate to="/patient" replace />
  if (effectiveRole === 'guardian') return <Navigate to="/guardian" replace />
  if (effectiveRole === 'doctor') return <Navigate to="/doctor-verify" replace />
  if (effectiveRole === 'admin') {
    return <Navigate to={ADMIN_ENABLED ? "/admin" : "/doctor"} replace />
  }
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
          path="/guardian"
          element={
            <ProtectedRoute requiredRole="guardian">
              <PatientDashboard roleOverride="guardian" />
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
        {ADMIN_ENABLED ? (
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        ) : null}

        <Route path="/emergency/:patientId" element={<EmergencyCard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
