import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'

const mockPatients = [
    { id: 1, name: 'Sarah Chen', age: 34, mrn: 'MRN-2024-0042', condition: 'Type 1 Diabetes', lastVisit: '2026-02-14', status: 'Active', email: 'sarah.chen@email.com' },
    { id: 2, name: 'Daniel Okafor', age: 58, mrn: 'MRN-2024-0087', condition: 'Hypertension + CKD', lastVisit: '2026-01-30', status: 'Active', email: 'daniel.okafor@email.com' },
    { id: 3, name: 'Priya Sharma', age: 42, mrn: 'MRN-2024-0103', condition: 'Rheumatoid Arthritis', lastVisit: '2026-03-01', status: 'Pending', email: 'priya.sharma@email.com' },
]

const mockAISummary = {
    patient: 'Sarah Chen',
    summary: 'Patient presents with well-controlled Type 1 Diabetes (HbA1c 6.8%, target <7%). Current regimen of Insulin and Metformin is effective. No evidence of nephropathy or retinopathy at last screening. Recent cardiac risk factors are low. Recommend continuation of current management with 3-month HbA1c follow-up. Penicillin and Sulfa drug allergies documented — avoid in prescriptions.',
    flags: ['Allergy: Penicillin', 'Allergy: Sulfa drugs'],
    lastUpdated: '2026-03-07',
}

function StatusBadge({ status }) {
    const colors = {
        Active: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Inactive: 'bg-gray-100 text-gray-700',
    }
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth0()
    const [search, setSearch] = useState('')
    const [requestSent, setRequestSent] = useState({})

    const filtered = mockPatients.filter(p =>
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    function handleRequest(id) {
        setRequestSent(prev => ({ ...prev, [id]: true }))
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-green-700 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                            <span className="text-green-700 font-bold">HC</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">HealthConnect</h1>
                            <p className="text-green-200 text-xs">Physician Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-medium">{user?.name || user?.email}</p>
                            <p className="text-green-200 text-xs">Physician</p>
                        </div>
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(user?.name || user?.email || 'D')[0].toUpperCase()}
                        </div>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            className="bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            {/* Welcome */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome, Dr. {user?.family_name || user?.name || 'there'}</h2>
                    <p className="text-gray-500 text-sm mt-1">{user?.email} · {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8">

                {/* Search + Request Access */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Search Patient & Request Access</h3>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="email"
                                placeholder="Search patient by email"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    {search && filtered.length > 0 && (
                        <div className="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-100 shadow-sm">
                            {filtered.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.email} · {p.mrn}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRequest(p.id)}
                                        disabled={requestSent[p.id]}
                                        className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${requestSent[p.id] ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        {requestSent[p.id] ? 'Requested ✓' : 'Request Access'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {search && filtered.length === 0 && (
                        <p className="text-sm text-gray-400 mt-3">No patients found matching "{search}"</p>
                    )}
                </section>

                {/* Patient Records */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">Patient Records</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-5 py-3 text-left">Patient</th>
                                    <th className="px-5 py-3 text-left hidden sm:table-cell">MRN</th>
                                    <th className="px-5 py-3 text-left hidden md:table-cell">Condition</th>
                                    <th className="px-5 py-3 text-left hidden sm:table-cell">Last Visit</th>
                                    <th className="px-5 py-3 text-left">Access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mockPatients.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-xs">
                                                    {p.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-400">Age {p.age}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{p.mrn}</td>
                                        <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{p.condition}</td>
                                        <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{p.lastVisit}</td>
                                        <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* AI Clinical Summary */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">AI Clinical Summary</h3>
                        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">Beta</span>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="font-semibold text-gray-900">{mockAISummary.patient}</p>
                                <p className="text-xs text-gray-400">AI-generated · Last updated {mockAISummary.lastUpdated}</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-purple-600 font-medium">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Generated
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {mockAISummary.flags.map(f => (
                                <span key={f} className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold px-3 py-1 rounded-full">⚠ {f}</span>
                            ))}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{mockAISummary.summary}</p>
                        <p className="text-xs text-gray-400 mt-4 italic">
                            ⚠ AI summaries are for informational purposes only. Always verify with primary source records.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    )
}
