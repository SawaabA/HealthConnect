import { useAuth0 } from '@auth0/auth0-react'
import { useParams, useNavigate } from 'react-router-dom'

// Mock patient data — in production, fetched from API by patientId
const mockPatient = {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    age: 34,
    dob: 'March 15, 1991',
    mrn: 'MRN-2024-0042',
    bloodType: 'O+',
    conditions: ['Type 1 Diabetes Mellitus', 'Insulin-dependent'],
    allergies: [
        { drug: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis' },
        { drug: 'Sulfa drugs', severity: 'Moderate', reaction: 'Rash, difficulty breathing' },
    ],
    medications: [
        { name: 'Insulin (Humalog)', dose: '10–15 units', frequency: 'With meals' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily' },
        { name: 'Dexcom G7 CGM', dose: 'Continuous', frequency: 'Monitor at all times' },
    ],
    emergencyContacts: [
        { name: 'David Chen', relation: 'Brother', phone: '+1 (416) 555-0182', email: 'david.chen@email.com' },
        { name: 'Linda Chen', relation: 'Mother', phone: '+1 (416) 555-0143', email: 'linda.chen@email.com' },
    ],
    physician: 'Dr. Amir Patel',
    physicianPhone: '+1 (416) 555-0100',
    lastUpdated: 'March 7, 2026',
    hospital: 'Toronto General Hospital',
}

// Check if the currently logged-in user is an authorized emergency contact for this patient
function isAuthorizedContact(userEmail, patient) {
    if (!userEmail) return false
    return patient.emergencyContacts.some(
        c => c.email.toLowerCase() === userEmail.toLowerCase()
    )
}

function SeverityBadge({ severity }) {
    const colors = {
        Severe: 'bg-red-100 text-red-800 border border-red-300',
        Moderate: 'bg-orange-100 text-orange-800 border border-orange-300',
        Mild: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
    }
    return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors[severity] || 'bg-gray-100 text-gray-700'}`}>{severity}</span>
}

// Loading spinner
function Spinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading emergency access...</p>
            </div>
        </div>
    )
}

export default function EmergencyCard() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, isLoading, logout, user } = useAuth0()

    const patient = mockPatient // in production: fetch by patientId
    const authorized = isAuthorizedContact(user?.email, patient)

    // ---- LOADING ----
    if (isLoading) return <Spinner />

    // ---- NOT LOGGED IN: redirect through the normal patient login ----
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-red-600 py-4 px-6">
                    <div className="max-w-2xl mx-auto flex items-center gap-3">
                        <span className="text-2xl">🚨</span>
                        <div>
                            <h1 className="text-white font-black text-lg tracking-wide">EMERGENCY ACCESS PORTAL</h1>
                            <p className="text-red-200 text-xs">HealthConnect · Authorized Contacts Only</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Sign In to Access Records</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-2">
                            Emergency contacts sign in using their <strong>own HealthConnect patient account</strong>.
                            If you're listed as this person's emergency contact, you'll automatically get access to their records.
                        </p>
                        <p className="text-gray-400 text-xs mb-8">
                            Access is logged and audited on behalf of the patient.
                        </p>

                        <button
                            onClick={() => navigate('/role-select')}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors text-base shadow-sm mb-4"
                        >
                            Sign In with My Patient Account
                        </button>

                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                        >
                            ← Back to HealthConnect
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ---- LOGGED IN BUT NOT AUTHORIZED ----
    if (!authorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <div className="bg-red-600 py-4 px-6">
                    <div className="max-w-2xl mx-auto flex items-center gap-3">
                        <span className="text-2xl">🚨</span>
                        <h1 className="text-white font-black text-lg tracking-wide">EMERGENCY ACCESS PORTAL</h1>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-red-100 max-w-md w-full p-8 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-3xl">⛔</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3">Access Denied</h2>
                        <p className="text-gray-500 text-sm leading-relaxed mb-2">
                            Your account (<strong>{user?.email}</strong>) is not listed as an authorized emergency contact for this patient.
                        </p>
                        <p className="text-gray-400 text-xs mb-8">
                            If you believe you should have access, please contact the patient or their healthcare provider.
                        </p>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: `${window.location.origin}/emergency/${patientId}` } })}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors text-sm mb-3"
                        >
                            Try a Different Account
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
                        >
                            ← Back to HealthConnect
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ---- AUTHORIZED EMERGENCY CONTACT: show full patient records ----
    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Emergency Header */}
                <div className="bg-red-600 rounded-t-2xl p-5 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">🚨</div>
                            <div>
                                <h1 className="font-black text-xl tracking-wide">EMERGENCY MEDICAL INFORMATION</h1>
                                <p className="text-red-200 text-xs mt-0.5">
                                    Accessed by {user?.email} · {new Date().toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-xs font-semibold">LIVE</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-b-2xl shadow-xl divide-y divide-gray-100">
                    {/* Authorized contact notice */}
                    <div className="px-6 py-4 bg-amber-50 flex items-start gap-3">
                        <span className="text-amber-500 text-lg mt-0.5">⚠</span>
                        <p className="text-amber-800 text-sm">
                            You are accessing <strong>{patient.name}</strong>'s records as an authorized emergency contact on their behalf.
                            This session is logged and audited.
                        </p>
                    </div>

                    {/* Patient Identity */}
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-black text-2xl">
                                {patient.name[0]}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">{patient.name}</h2>
                                <p className="text-gray-500 text-sm">{patient.age} years old · DOB: {patient.dob}</p>
                                <p className="text-gray-400 text-xs">{patient.mrn} · {patient.hospital}</p>
                            </div>
                            <div className="ml-auto text-center">
                                <div className="bg-red-600 text-white font-black text-2xl px-4 py-3 rounded-xl shadow-sm">{patient.bloodType}</div>
                                <p className="text-xs text-gray-400 mt-1">Blood Type</p>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {patient.conditions.map(c => (
                                <span key={c} className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">{c}</span>
                            ))}
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 font-black text-gray-900 text-base mb-4">
                            <span className="text-red-500">⚠</span> ALLERGIES
                        </h3>
                        <div className="space-y-3">
                            {patient.allergies.map(a => (
                                <div key={a.drug} className="bg-red-50 border border-red-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="font-bold text-gray-900 text-base">{a.drug}</p>
                                        <SeverityBadge severity={a.severity} />
                                    </div>
                                    <p className="text-red-700 text-sm font-medium">Reaction: {a.reaction}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Medications */}
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 font-black text-gray-900 text-base mb-4">
                            <span>💊</span> CURRENT MEDICATIONS
                        </h3>
                        <div className="space-y-3">
                            {patient.medications.map(m => (
                                <div key={m.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                                        <p className="text-gray-500 text-xs">{m.frequency}</p>
                                    </div>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{m.dose}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Emergency Contacts */}
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 font-black text-gray-900 text-base mb-4">
                            <span>📞</span> OTHER EMERGENCY CONTACTS
                        </h3>
                        <div className="space-y-3">
                            {patient.emergencyContacts.filter(c => c.email.toLowerCase() !== user?.email?.toLowerCase()).map(c => (
                                <div key={c.name} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                                        <p className="text-gray-500 text-xs">{c.relation}</p>
                                    </div>
                                    <a href={`tel:${c.phone.replace(/\D/g, '')}`} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                                        {c.phone}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Physician */}
                    <div className="p-6">
                        <h3 className="flex items-center gap-2 font-black text-gray-900 text-base mb-3">
                            <span>🩺</span> ATTENDING PHYSICIAN
                        </h3>
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-4">
                            <div>
                                <p className="font-bold text-gray-900">{patient.physician}</p>
                                <p className="text-gray-500 text-xs">{patient.hospital}</p>
                            </div>
                            <a href={`tel:${patient.physicianPhone.replace(/\D/g, '')}`} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                                {patient.physicianPhone}
                            </a>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
                        <p className="text-xs text-gray-400 text-center">
                            This session was opened by <strong>{user?.email}</strong> on {new Date().toLocaleDateString()}. Last record update: {patient.lastUpdated}.
                        </p>
                        <div className="mt-3 text-center">
                            <button
                                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                className="text-red-500 hover:text-red-700 text-xs font-semibold transition-colors"
                            >
                                End Emergency Session
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
