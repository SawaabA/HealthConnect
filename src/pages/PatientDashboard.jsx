import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, HeartPulse, Activity, FileText, Calendar, Clock, AlertCircle, Share2, LogOut, CheckCircle, XCircle } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Chatbot from '../components/Chatbot'

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

const healthData = [
    { name: 'Sep', hba1c: 7.4 },
    { name: 'Oct', hba1c: 7.2 },
    { name: 'Nov', hba1c: 7.1 },
    { name: 'Dec', hba1c: 6.9 },
    { name: 'Jan', hba1c: 6.8 },
    { name: 'Feb', hba1c: 6.8 },
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
    const [toast, setToast] = useState(null)

    function handleRequest(id, action) {
        setRequests(prev => prev.filter(r => r.id !== id))
        
        // Custom animated toast notification instead of alert()
        setToast({ id, action })
        setTimeout(() => setToast(null), 3000)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

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
                            className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Welcome banner */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Good morning, {user?.given_name || 'there'} 👋
                        </h2>
                        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                            <Clock size={14} /> Last login: Today at 9:14 AM
                        </p>
                    </motion.div>
                    <motion.button
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowQR(true)}
                        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm"
                    >
                        <AlertCircle size={18} />
                        View Emergency QR
                    </motion.button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8"
                >
                    {/* Health Overview Cards */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                            <div className="bg-blue-100 text-blue-600 p-3 rounded-lg"><Activity size={24} /></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Latest HbA1c</p>
                                <p className="text-2xl font-bold text-gray-900">6.8%</p>
                                <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                                    ↓ 0.1% from last month
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                            <div className="bg-purple-100 text-purple-600 p-3 rounded-lg"><HeartPulse size={24} /></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Blood Pressure</p>
                                <p className="text-2xl font-bold text-gray-900">118/76</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Recorded Oct 02, 2025</p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-start gap-4">
                            <div className="bg-orange-100 text-orange-600 p-3 rounded-lg"><Calendar size={24} /></div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Next Appointment</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">Apr 12, 2:00 PM</p>
                                <p className="text-xs text-gray-400 font-medium">Dr. James Wright · Checkup</p>
                            </div>
                        </div>
                    </motion.section>

                    {/* Pending Access Requests */}
                    {requests.length > 0 && (
                        <motion.section variants={itemVariants}>
                            <div className="flex items-center gap-2 mb-4">
                                <Bell className="text-red-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">Pending Access Requests</h3>
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{requests.length}</span>
                            </div>
                            <div className="space-y-3">
                                {requests.map(r => (
                                    <div key={r.id} className="bg-white rounded-xl border border-red-100 shadow-sm p-5 hover:shadow-md transition-shadow">
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
                                                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
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
                        </motion.section>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* My Records - spans 2 columns */}
                        <motion.section variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="text-green-600" size={20} />
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
                                            <tr key={r.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                <td className="px-5 py-4 text-gray-600">{r.date}</td>
                                                <td className="px-5 py-4 font-medium text-gray-900 group-hover:text-green-700 transition-colors">{r.type}</td>
                                                <td className="px-5 py-4 text-gray-600 hidden sm:table-cell">{r.doctor}</td>
                                                <td className="px-5 py-4 text-gray-500 hidden md:table-cell max-w-xs truncate">{r.summary}</td>
                                                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>

                        <div className="space-y-8">
                            {/* Health Trends */}
                            <motion.section variants={itemVariants}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Activity className="text-blue-500" size={20} />
                                    <h3 className="text-lg font-bold text-gray-900">Health Trends</h3>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-[280px] flex flex-col">
                                    <p className="text-sm font-medium text-gray-500 mb-4">HbA1c Levels (%)</p>
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={healthData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorHba1c" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                                <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Area type="monotone" dataKey="hba1c" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorHba1c)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </motion.section>

                            {/* Audit Log */}
                            <motion.section variants={itemVariants}>
                                <div className="flex items-center gap-2 mb-4">
                                    <Share2 className="text-gray-400" size={20} />
                                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                </div>
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                                    {mockAuditLog.slice(0, 3).map(log => (
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
                                            <p className="text-[10px] text-gray-400">{log.time.split(' ')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.section>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* QR Modal */}
            <AnimatePresence>
                {showQR && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
                        onClick={() => setShowQR(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                    <AlertCircle size={32} className="text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Emergency Access</h3>
                                <p className="text-gray-500 text-sm mb-6">Scan to view emergency medical information without login.</p>
                                <div className="w-48 h-48 bg-white border border-gray-200 shadow-sm rounded-xl mx-auto flex items-center justify-center mb-6">
                                    <div className="text-center">
                                        {/* Placeholder for QR - In real app use qrcode.react */}
                                        <div className="grid grid-cols-2 gap-1 mb-2">
                                            <div className="w-8 h-8 bg-black"></div><div className="w-8 h-8 bg-black"></div>
                                            <div className="w-8 h-8 bg-black"></div><div className="w-8 h-8 bg-white border border-black"></div>
                                        </div>
                                        <p className="text-gray-400 text-xs">Emergency QR</p>
                                    </div>
                                </div>
                                <p className="text-xs text-red-600 font-medium mb-6 bg-red-50 p-2 rounded-lg">Share this only with first responders.</p>
                                <button onClick={() => setShowQR(false)} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-md">
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl font-medium"
                    >
                        {toast.action === 'approved' ? (
                            <CheckCircle size={20} className="text-green-400" />
                        ) : (
                            <XCircle size={20} className="text-red-400" />
                        )}
                        <span>Request #{toast.id} {toast.action}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <Chatbot context="patient" />
        </div>
    )
}
