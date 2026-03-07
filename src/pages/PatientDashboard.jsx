import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'

const mockRecords = [
    { id: 1, date: '2025-11-14', type: 'Lab Results', doctor: 'Dr. Amir Patel', status: 'Reviewed', summary: 'HbA1c: 6.8% — within target range.' },
    { id: 2, date: '2025-10-02', type: 'Prescription', doctor: 'Dr. Amir Patel', status: 'Active', summary: 'Metformin 500mg twice daily.' },
    { id: 3, date: '2025-08-19', type: 'Imaging', doctor: 'Dr. Susan Kwan', status: 'Reviewed', summary: 'Chest X-ray — No abnormalities detected.' },
    { id: 4, date: '2025-06-05', type: 'Consultation', doctor: 'Dr. James Wright', status: 'Complete', summary: 'Annual physical — all vitals normal.' },
]

const mockRequests = [
    { id: 1, doctor: 'Dr. Emily Sharma', specialty: 'Endocrinology', hospital: 'Toronto General', date: '2026-03-06', reason: 'Diabetes management follow-up' },
    { id: 2, doctor: 'Dr. Marcus Lee', specialty: 'Cardiology', hospital: 'St. Michael\'s Hospital', date: '2026-03-07', reason: 'Cardiac risk assessment' },
]

const mockAuditLog = [
    { id: 1, action: 'Record Accessed', actor: 'Dr. Amir Patel', time: '2026-03-07 09:14 AM' },
    { id: 2, action: 'Access Granted', actor: 'You', time: '2026-03-06 03:22 PM' },
    { id: 3, action: 'Login', actor: 'You', time: '2026-03-06 03:20 PM' },
    { id: 4, action: 'Record Accessed', actor: 'Dr. Susan Kwan', time: '2026-03-05 11:45 AM' },
]

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
    const [requests, setRequests] = useState(mockRequests)
    const [showQR, setShowQR] = useState(false)

    function handleRequest(id, action) {
        setRequests(prev => prev.filter(r => r.id !== id))
        // In production: call API to grant/deny access
        alert(`Access ${action} for request #${id}`)
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
                        <p className="text-gray-500 text-sm mt-1">{user?.email} · Last login: Today at 9:14 AM</p>
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
                                            <p className="font-semibold text-gray-900">{r.doctor}</p>
                                            <p className="text-sm text-gray-500">{r.specialty} · {r.hospital}</p>
                                            <p className="text-sm text-gray-600 mt-1">Reason: <span className="italic">{r.reason}</span></p>
                                            <p className="text-xs text-gray-400 mt-1">Requested {r.date}</p>
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
                                {mockRecords.map(r => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 text-gray-600">{r.date}</td>
                                        <td className="px-5 py-4 font-medium text-gray-900">{r.type}</td>
                                        <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{r.doctor}</td>
                                        <td className="px-5 py-4 text-gray-500 hidden md:table-cell max-w-xs truncate">{r.summary}</td>
                                        <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Audit Log */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                        <h3 className="text-lg font-bold text-gray-900">Audit Log</h3>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                        {mockAuditLog.map(log => (
                            <div key={log.id} className="px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                        {log.actor[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.actor}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400">{log.time}</p>
                            </div>
                        ))}
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
                                    <p className="text-gray-300 text-xs">/emergency/sarah-chen</p>
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
