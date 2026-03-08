import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect } from 'react'
import { searchPatients, getDoctorPatients, getAISummary, requestAccess } from '../api'

function StatusBadge({ status }) {
    const colors = {
        Active: 'bg-green-100 text-green-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Inactive: 'bg-gray-100 text-gray-700',
        Denied: 'bg-red-100 text-red-800',
    }
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

export default function DoctorDashboard() {
    const { user, logout } = useAuth0()

    // Search state
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [requestSent, setRequestSent] = useState({})

    // Dashboard state
    const [patients, setPatients] = useState([])
    const [loadingPatients, setLoadingPatients] = useState(true)
    const [error, setError] = useState('')

    // AI Summary state
    const [selectedPatientId, setSelectedPatientId] = useState(null)
    const [aiSummary, setAiSummary] = useState(null)
    const [loadingSummary, setLoadingSummary] = useState(false)

    // Load doctor's assigned / approved patients on mount
    useEffect(() => {
        if (!user?.sub) return

        getDoctorPatients(user.sub)
            .then(data => {
                setPatients(Array.isArray(data) ? data : [])
                // Automatically select the first patient for the AI summary if available
                if (Array.isArray(data) && data.length > 0) {
                    handleSelectPatient(data[0])
                }
            })
            .catch(err => {
                console.error("Error fetching patients:", err)
                setError("Failed to load your patients.")
            })
            .finally(() => setLoadingPatients(false))
    }, [user?.sub])

    // Search effect with debounce (or trigger on submit)
    useEffect(() => {
        if (search.length < 3) {
            setSearchResults([])
            return
        }

        const delay = setTimeout(() => {
            setSearching(true)
            searchPatients(search)
                .then(data => setSearchResults(Array.isArray(data) ? data : []))
                .catch(err => {
                    console.error("Search error:", err)
                    setSearchResults([])
                })
                .finally(() => setSearching(false))
        }, 500)

        return () => clearTimeout(delay)
    }, [search])

    function handleSelectPatient(p) {
        setSelectedPatientId(p.id)
        setLoadingSummary(true)
        setAiSummary(null)

        getAISummary(p.id)
            .then(data => {
                setAiSummary(data || {
                    summary: 'No AI summary available for this patient yet.',
                    flags: [],
                    lastUpdated: new Date().toLocaleDateString()
                })
            })
            .catch(err => {
                console.error("Error fetching AI summary:", err)
                setAiSummary({
                    summary: 'Failed to generate AI summary. Try again later.',
                    flags: [],
                    lastUpdated: new Date().toLocaleDateString()
                })
            })
            .finally(() => setLoadingSummary(false))
    }

    async function handleRequest(patientId) {
        setRequestSent(prev => ({ ...prev, [patientId]: true }))

        try {
            await requestAccess({
                doctor_id: user.sub,
                patient_id: patientId,
                reason: 'Requested via search portal'
            })
            // Optionally refetch patients list to see pending status
            getDoctorPatients(user.sub).then(data => setPatients(Array.isArray(data) ? data : []))
        } catch (err) {
            console.error("Failed to request access:", err)
            setRequestSent(prev => ({ ...prev, [patientId]: false }))
            alert("Failed to send access request. Check your connection.")
        }
    }

    // Find the currently selected patient object to display their name in the AI box
    const selectedPatientObj = patients.find(p => p.id === selectedPatientId)

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

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                )}

                {/* Search + Request Access */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Search Patient & Request Access</h3>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            {searching ? (
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            )}
                            <input
                                type="email"
                                placeholder="Search patient by email"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {search.length >= 3 && searchResults.length > 0 && (
                        <div className="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-100 shadow-sm">
                            {searchResults.map(p => (
                                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{p.name || 'Unnamed Patient'}</p>
                                        <p className="text-xs text-gray-500">{p.email} · {p.mrn || 'No MRN'}</p>
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

                    {search.length >= 3 && searchResults.length === 0 && !searching && (
                        <p className="text-sm text-gray-400 mt-3">No patients found matching "{search}"</p>
                    )}
                </section>

                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Patient Records List (2/3 width) */}
                    <section className="md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-900">Your Patients</h3>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[300px]">
                            {loadingPatients ? (
                                <div className="p-12 text-center text-gray-500">
                                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p>Loading patient records...</p>
                                </div>
                            ) : patients.length > 0 ? (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-5 py-3 text-left">Patient</th>
                                            <th className="px-5 py-3 text-left hidden sm:table-cell">MRN</th>
                                            <th className="px-5 py-3 text-left hidden lg:table-cell">Condition</th>
                                            <th className="px-5 py-3 text-left">Access</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {patients.map(p => (
                                            <tr
                                                key={p.id}
                                                onClick={() => handleSelectPatient(p)}
                                                className={`transition-colors cursor-pointer ${selectedPatientId === p.id ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${selectedPatientId === p.id ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'}`}>
                                                            {(p.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className={`font-medium ${selectedPatientId === p.id ? 'text-green-900' : 'text-gray-900'}`}>{p.name || 'Unnamed'}</p>
                                                            <p className="text-xs text-gray-400">Age {p.age || '--'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">{p.mrn || 'N/A'}</td>
                                                <td className="px-5 py-4 text-gray-600 hidden lg:table-cell max-w-[150px] truncate">{p.condition || 'N/A'}</td>
                                                <td className="px-5 py-4"><StatusBadge status={p.status || 'Active'} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center text-gray-500">
                                    No patients successfully requested yet. Search to request patient access!
                                </div>
                            )}
                        </div>
                    </section>

                    {/* AI Clinical Summary (1/3 width, sticky) */}
                    <section className="md:sticky md:top-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-900">Clinical Summary</h3>
                            <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">AI Beta</span>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 min-h-[300px]">
                            {loadingSummary ? (
                                <div className="flex flex-col items-center justify-center py-12 text-purple-500">
                                    <svg className="animate-spin w-8 h-8 mb-3" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-sm font-medium">Generating ML Insights...</p>
                                </div>
                            ) : selectedPatientId && aiSummary ? (
                                <div className="animate-[fade-in_0.3s_ease]">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{selectedPatientObj?.name || 'Selected Patient'}</p>
                                            <p className="text-xs text-gray-400">Last updated {aiSummary.lastUpdated}</p>
                                        </div>
                                        <span className="flex items-center gap-1.5 text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded-md">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            AI
                                        </span>
                                    </div>

                                    {aiSummary.flags?.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {aiSummary.flags.map(f => (
                                                <span key={f} className="bg-red-50 border border-red-200 text-red-700 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">⚠ {f}</span>
                                            ))}
                                        </div>
                                    )}

                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{aiSummary.summary}</p>

                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                                            ⚠ Verification Required
                                        </p>
                                        <p className="text-[11px] text-gray-400 mt-1 leading-tight">
                                            AI summaries are for informational purposes only. Always verify with primary hospital source records.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center py-12 text-gray-400">
                                    <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-500">No Patient Selected</p>
                                    <p className="text-xs mt-1">Select a patient from the list to view their automatically generated clinical summary.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
