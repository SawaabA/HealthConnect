import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Logo from '../components/Logo'

const CREDENTIAL_TYPES = [
    { value: '', label: 'Select credential type...' },
    { value: 'cpso', label: 'CPSO — College of Physicians and Surgeons of Ontario' },
    { value: 'minc', label: 'MINC — Medical Identification Number Canada' },
    { value: 'hospital', label: 'Hospital ID — Badge / Employee Number' },
]

// Very basic client-side format check (real verification would be server-side)
function validate({ type, number, hospital, badge }) {
    if (!type) return 'Please select a credential type.'
    if (type === 'cpso' && !number.trim()) return 'Please enter your CPSO number.'
    if (type === 'minc' && !number.trim()) return 'Please enter your MINC number.'
    if (type === 'hospital') {
        if (!hospital.trim()) return 'Please enter the name of your hospital.'
        if (!badge.trim()) return 'Please enter your badge / employee number.'
    }
    return null
}

export default function DoctorVerifyPage() {
    const navigate = useNavigate()
    const { user, logout } = useAuth0()

    const [type, setType] = useState('')
    const [number, setNumber] = useState('')
    const [hospital, setHospital] = useState('')
    const [badge, setBadge] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleSubmit(e) {
        e.preventDefault()
        const err = validate({ type, number, hospital, badge })
        if (err) { setError(err); return }

        setLoading(true)
        setError('')
        // Simulate a short verification delay, then proceed
        setTimeout(() => {
            sessionStorage.setItem('hc_doctor_verified', '1')
            sessionStorage.setItem('hc_credential_type', type)
            navigate('/doctor', { replace: true })
        }, 900)
    }

    // Change type → reset number fields
    function handleTypeChange(e) {
        setType(e.target.value)
        setNumber('')
        setHospital('')
        setBadge('')
        setError('')
    }

    const label = {
        cpso: { title: 'CPSO Number', placeholder: 'e.g. 123456', hint: 'Enter your 6-digit CPSO registration number to verify your licence.' },
        minc: { title: 'MINC Number', placeholder: 'e.g. M-1234567', hint: 'Enter your MINC number exactly as it appears on your credential.' },
        hospital: { title: 'Hospital ID', placeholder: '', hint: '' },
    }[type] ?? {}

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
            {/* Header */}
            <header style={{ backgroundColor: '#1d4ed8' }} className="shadow-md flex-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="w-9 h-9" />
                        <div>
                            <p className="text-white font-bold text-lg leading-tight">HealthConnect</p>
                            <p className="text-blue-200 text-xs">Doctor Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                        className="text-blue-200 hover:text-white text-sm transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="w-full max-w-lg">

                    {/* Icon + heading */}
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                            <svg className="w-9 h-9 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">Verify Your Credentials</h1>
                        <p className="text-gray-500">
                            Welcome, <strong>{user?.name ?? user?.email}</strong>. Before accessing patient records,
                            please verify your medical credentials.
                        </p>
                    </div>

                    {/* Card */}
                    <form onSubmit={handleSubmit}
                        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6">

                        {/* Credential type dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Credential Type
                            </label>
                            <div className="relative">
                                <select
                                    value={type}
                                    onChange={handleTypeChange}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                                >
                                    {CREDENTIAL_TYPES.map(opt => (
                                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                {/* Chevron */}
                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* CPSO or MINC — single number field */}
                        {(type === 'cpso' || type === 'minc') && (
                            <div className="animate-[fade-in_0.2s_ease]">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {label.title}
                                </label>
                                <input
                                    type="text"
                                    value={number}
                                    onChange={e => { setNumber(e.target.value); setError('') }}
                                    placeholder={label.placeholder}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    autoFocus
                                />
                                {label.hint && (
                                    <p className="text-xs text-gray-400 mt-2">{label.hint}</p>
                                )}
                            </div>
                        )}

                        {/* Hospital ID — two fields */}
                        {type === 'hospital' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Hospital Name
                                    </label>
                                    <input
                                        type="text"
                                        value={hospital}
                                        onChange={e => { setHospital(e.target.value); setError('') }}
                                        placeholder="e.g. Toronto General Hospital"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Badge / Employee Number
                                    </label>
                                    <input
                                        type="text"
                                        value={badge}
                                        onChange={e => { setBadge(e.target.value); setError('') }}
                                        placeholder="e.g. EMP-00542"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        Enter your badge number exactly as printed on your hospital ID card.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-none" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading || !type}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-xl transition-colors text-base shadow-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying…
                                </>
                            ) : (
                                <>
                                    Verify & Continue
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </>
                            )}
                        </button>

                        <p className="text-xs text-gray-400 text-center leading-relaxed">
                            This information is used to confirm your registration as a licensed medical professional
                            in Canada. It is not stored or shared beyond this verification step.
                        </p>
                    </form>
                </div>
            </main>
        </div>
    )
}
