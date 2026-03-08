import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function LandingPage({ noRole }) {
    const { isAuthenticated, user } = useAuth0()
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
            {/* Header */}
            <header style={{ backgroundColor: '#adebb3' }} className="shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="w-10 h-10" />
                        <div>
                            <h1 className="text-gray-900 font-bold text-xl leading-tight">HealthConnect</h1>
                            <p className="text-gray-700 text-xs">Secure Medical Records Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                        <span className="text-gray-800 text-sm">System Operational</span>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        HIPAA-Compliant · End-to-End Encrypted · Role-Based Access
                    </div>
                    <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                        Medical Records,<br />
                        <span className="text-green-700">Reimagined.</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                        HealthConnect gives patients full control of their health data and
                        gives doctors instant, authorized access to the records they need —
                        securely, anywhere, anytime.
                    </p>

                    {noRole && isAuthenticated && (
                        <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-md mx-auto">
                            <p className="text-yellow-800 text-sm font-medium">
                                ⚠️ Your account <strong>{user?.email}</strong> hasn't been assigned a role yet.
                                Please contact your administrator to be assigned as a Patient or Doctor.
                            </p>
                        </div>
                    )}

                    {!isAuthenticated ? (
                        <button
                            onClick={() => navigate('/role-select')}
                            className="inline-flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Sign In to HealthConnect
                        </button>
                    ) : (
                        <p className="text-gray-600">Redirecting you to your dashboard...</p>
                    )}
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-3 gap-8 mt-8">
                    {[
                        {
                            icon: '🔒',
                            title: 'Role-Based Access',
                            desc: 'Patients own their data. Doctors request access. Every action is audited.',
                        },
                        {
                            icon: '🚨',
                            title: 'Emergency Access',
                            desc: 'Emergency contacts authenticate to access patient records on their behalf — always authorized, always audited.',
                        },
                        {
                            icon: '🤖',
                            title: 'AI Clinical Summaries',
                            desc: 'Doctors get AI-powered summaries of patient history to reduce cognitive load.',
                        },
                    ].map((f) => (
                        <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="text-3xl mb-4">{f.icon}</div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Trust badges */}
                <div className="mt-16 border-t border-gray-200 pt-10 text-center">
                    <p className="text-gray-400 text-sm mb-6">Trusted by healthcare providers across Canada</p>
                    <div className="flex flex-wrap justify-center gap-8 text-gray-300 font-semibold text-lg">
                        {['OHIP Integrated', 'PHIPA Compliant', 'HL7 FHIR Ready', 'ISO 27001'].map(b => (
                            <span key={b} className="text-gray-400 text-sm border border-gray-200 px-4 py-2 rounded-lg">{b}</span>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
