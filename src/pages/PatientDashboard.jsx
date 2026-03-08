import { useAuth0 } from '@auth0/auth0-react'
import { useState, useEffect } from 'react'
import { getRecords, getPendingRequests, respondToRequest, getAuditLog } from '../api'

function StatusBadge({ status }) {
    const colors = {
        Active: 'bg-green-100 text-green-800',
        Reviewed: 'bg-blue-100 text-blue-800',
        Complete: 'bg-gray-100 text-gray-700',
        Pending: 'bg-yellow-100 text-yellow-800',
    }
    return (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    )
}

export default function PatientDashboard() {
    const { user, logout } = useAuth0()
    const [requests, setRequests] = useState([])
    const [records, setRecords] = useState([])
    const [auditLog, setAuditLog] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showQR, setShowQR] = useState(false)

    useEffect(() => {
        if (!user?.sub) return

        const fetchData = async () => {
            try {
                // Step 1: Get the patient's internal database record using their Auth0 ID
                const patient = await getPatient(user.sub)
                if (!patient?.id) {
                    setError('Could not find your patient record. Please contact support.')
                    setLoading(false)
                    return
                }

                // Step 2: Use the real database ID for all subsequent calls
                const [reqs, recs, audits] = await Promise.all([
                    getPendingRequests(patient.id).catch(() => []),
                    getRecords(patient.id).catch(() => []),
                    getAuditLog(patient.id).catch(() => [])
                ])

                setRequests(Array.isArray(reqs) ? reqs : [])
                setRecords(Array.isArray(recs) ? recs : [])
                setAuditLog(Array.isArray(audits) ? audits : [])
            } catch (err) {
                console.error("Error fetching data:", err)
                setError('Failed to load dashboard data. Please check your connection and try again.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.sub])

    async function handleRequest(id, action) {
        // Optimistic UI update
        const originalRequests = [...requests]
        setRequests(prev => prev.filter(r => r.id !== id))

        try {
            // "approved" -> "granted", "denied" -> "denied"
            const status = action === 'approved' ? 'granted' : 'denied'
            await respondToRequest(id, status)
        } catch (err) {
            console.error("Error responding to request:", err)
            // Revert on failure
            setRequests(originalRequests)
            alert("Failed to update request status. Please check your connection.")
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading Dashboard Data...</p>
                </div>
            </div>
        )
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
                            <p className="text-green-200 text-xs">Patient Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-white text-sm font-medium">{user?.name || user?.email}</p>
                            <p className="text-green-200 text-xs">Patient</p>
                        </div>
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(user?.name || user?.email || 'P')[0].toUpperCase()}
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

            {/* Welcome banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Good morning, {user?.given_name || 'there'} 👋</h2>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                    </div>
                    <button
                        onClick={() => setShowQR(true)}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        View Emergency QR
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8">

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl shadow-sm">
                        <p className="font-semibold text-sm">{error}</p>
                    </div>
                )}

                {/* Pending Access Requests */}
                {requests.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                            <h3 className="text-lg font-bold text-gray-900">Pending Access Requests</h3>
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                        </div>
                        <div className="space-y-3">
                            {requests.map(r => (
                                <div key={r.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{r.doctor_name || r.doctor}</p>
                                            <p className="text-sm text-gray-500">{r.specialty || 'General'} · {r.hospital || 'Hospital'}</p>
                                            <p className="text-sm text-gray-600 mt-1">Reason: <span className="italic">{r.reason || 'Medical review'}</span></p>
                                            <p className="text-xs text-gray-400 mt-1">Requested {r.date || new Date(r.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleRequest(r.id, 'approved')}
                                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleRequest(r.id, 'denied')}
                                                className="bg-white hover:bg-red-50 text-red-600 border border-red-300 text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
                                            >
                                                Deny
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* My Records */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">My Records</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {records.length > 0 ? (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Date</th>
                                        <th className="px-5 py-3 text-left">Type</th>
                                        <th className="px-5 py-3 text-left hidden sm:table-cell">Doctor</th>
                                        <th className="px-5 py-3 text-left hidden md:table-cell">Summary</th>
                                        <th className="px-5 py-3 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.map(r => (
                                        <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-4 text-gray-600">{r.date || new Date(r.created_at).toLocaleDateString()}</td>
                                            <td className="px-5 py-4 font-medium text-gray-900">{r.type}</td>
                                            <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{r.doctor_name || r.doctor}</td>
                                            <td className="px-5 py-4 text-gray-500 hidden md:table-cell max-w-xs truncate">{r.summary}</td>
                                            <td className="px-5 py-4"><StatusBadge status={r.status || 'Active'} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                No records found in your file.
                            </div>
                        )}
                    </div>
                </section>

                {/* Audit Log */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">Audit Log</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {auditLog.length > 0 ? auditLog.map(log => (
                            <div key={log.id} className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                        {(log.actor_name || log.actor || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.actor_name || log.actor}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">{log.time || new Date(log.created_at).toLocaleString()}</p>
                            </div>
                        )) : (
                            <div className="p-6 text-center text-gray-500 text-sm">
                                No recent activity logged.
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* QR Modal */}
            {showQR && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowQR(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full" onClick={e => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-red-600 text-xl">🚨</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Emergency QR Code</h3>
                            <p className="text-gray-500 text-sm mb-6">Scan to view emergency medical information without login.</p>
                            <div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl mx-auto flex items-center justify-center mb-6">
                                <div className="text-center">
                                    <p className="text-4xl mb-2">▣</p>
                                    <p className="text-gray-400 text-xs">QR Code</p>
                                    <p className="text-gray-300 text-xs">/emergency/{user?.sub?.split('|')[1] || 'id'}</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-6">Share this only with first responders and trusted contacts.</p>
                            <button onClick={() => setShowQR(false)} className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
