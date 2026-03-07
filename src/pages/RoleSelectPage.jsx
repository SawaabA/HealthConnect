import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'

export default function RoleSelectPage() {
    const { loginWithRedirect } = useAuth0()
    const navigate = useNavigate()

    function handleRoleSelect(role) {
        // Store intended role so we can validate after login (nice-to-have hint)
        sessionStorage.setItem('hc_intended_role', role)
        loginWithRedirect({
            authorizationParams: {
                redirect_uri: window.location.origin,
            },
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex flex-col">
            {/* Header */}
            <header className="bg-green-700 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-bold">HC</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">HealthConnect</h1>
                            <p className="text-green-200 text-xs">Secure Medical Records Platform</p>
                        </div>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-green-200 hover:text-white text-sm transition-colors flex items-center gap-1"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>
            </header>

            {/* Role Selection */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-black text-gray-900 mb-3">How are you accessing<br />HealthConnect?</h2>
                    <p className="text-gray-500 text-lg">Choose your role to be taken to the right login experience.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
                    {/* Patient Card */}
                    <button
                        onClick={() => handleRoleSelect('patient')}
                        className="group bg-white border-2 border-gray-200 hover:border-green-500 rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-green-100 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200">
                            <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors">I'm a Patient</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">View your medical records, manage who has access to your data, and control your health information.</p>
                        <div className="mt-5 flex items-center gap-2 text-green-600 font-semibold text-sm">
                            Sign in as Patient
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>

                    {/* Doctor Card */}
                    <button
                        onClick={() => handleRoleSelect('doctor')}
                        className="group bg-white border-2 border-gray-200 hover:border-blue-500 rounded-2xl p-8 text-left shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                    >
                        <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-600 rounded-2xl flex items-center justify-center mb-5 transition-colors duration-200">
                            <svg className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">I'm a Doctor</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Access patient records you've been authorized to view, request access, and review AI clinical summaries.</p>
                        <div className="mt-5 flex items-center gap-2 text-blue-600 font-semibold text-sm">
                            Sign in as Doctor
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                </div>

                {/* Emergency access link */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm mb-2">First responder or emergency contact?</p>
                    <button
                        onClick={() => navigate('/emergency/sarah-chen')}
                        className="text-red-600 hover:text-red-700 font-semibold text-sm underline underline-offset-2 transition-colors"
                    >
                        🚨 Emergency Access Portal
                    </button>
                </div>

                {/* Trust note */}
                <p className="mt-10 text-xs text-gray-400 text-center max-w-sm">
                    Your credentials are managed securely by Auth0. HealthConnect never stores your password.
                </p>
            </main>
        </div>
    )
}
