import { useAuth0 } from '@auth0/auth0-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Activity, FileText, CheckCircle, Clock, AlertTriangle, Sparkles, LogOut, FileSearch } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Chatbot from '../components/Chatbot'

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

const clinicData = [
    { time: '9 AM', patients: 4 },
    { time: '10 AM', patients: 3 },
    { time: '11 AM', patients: 5 },
    { time: '1 PM', patients: 2 },
    { time: '2 PM', patients: 4 },
    { time: '3 PM', patients: 1 },
]

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
    const [toast, setToast] = useState(null)

    const filtered = mockPatients.filter(p =>
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    function handleRequest(id) {
        setRequestSent(prev => ({ ...prev, [id]: true }))
        setToast(`Request sent securely for ${mockPatients.find(p => p.id === id)?.name}`)
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
                            className="flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Welcome */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Welcome, Dr. {user?.family_name || user?.name || 'there'} 🩺
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">{user?.email} · {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid gap-8"
                >
                    
                    {/* Top row: Search + Quick Stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Search + Request Access */}
                        <motion.section variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <FileSearch size={18} className="text-green-600" />
                                Search Patient & Request Access
                            </h3>
                            <div className="flex gap-3">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="Search patient by email or name..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-gray-50 focus:bg-white"
                                    />
                                </div>
                            </div>
                            <AnimatePresence>
                                {search && filtered.length > 0 && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 border border-gray-100 rounded-lg divide-y divide-gray-100 shadow-sm overflow-hidden"
                                    >
                                        {filtered.map(p => (
                                            <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                                                        {p.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{p.name}</p>
                                                        <p className="text-xs text-gray-500">{p.email} · {p.mrn}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRequest(p.id)}
                                                    disabled={requestSent[p.id]}
                                                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${requestSent[p.id] ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                                >
                                                    {requestSent[p.id] ? <><CheckCircle size={14} /> Requested</> : 'Request Access'}
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            {search && filtered.length === 0 && (
                                <p className="text-sm text-gray-400 mt-3 text-center py-4">No patients found matching "{search}"</p>
                            )}
                        </motion.section>

                        {/* Quick Stats Chart */}
                        <motion.section variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" />
                                Today's Clinic Load
                            </h3>
                            <div className="flex-1 min-h-[150px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={clinicData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                        <Tooltip 
                                            cursor={{ fill: '#f3f4f6' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="patients" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.section>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Patient Records */}
                        <motion.section variants={itemVariants} className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="text-green-600" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">Patient Directory</h3>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="px-5 py-4 text-left font-semibold">Patient</th>
                                            <th className="px-5 py-4 text-left hidden sm:table-cell font-semibold">MRN</th>
                                            <th className="px-5 py-4 text-left hidden md:table-cell font-semibold">Condition</th>
                                            <th className="px-5 py-4 text-left hidden sm:table-cell font-semibold">Last Visit</th>
                                            <th className="px-5 py-4 text-left font-semibold">Access</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {mockPatients.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-700 font-bold text-sm border border-green-100 shadow-sm">
                                                            {p.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 group-hover:text-green-700 transition-colors">{p.name}</p>
                                                            <p className="text-xs text-gray-400">Age {p.age}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4 text-gray-500 hidden sm:table-cell font-mono text-xs">{p.mrn}</td>
                                                <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{p.condition}</td>
                                                <td className="px-5 py-4 text-gray-500 hidden sm:table-cell">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={12} className="text-gray-400" />
                                                        {p.lastVisit}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4"><StatusBadge status={p.status} /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.section>

                        {/* AI Clinical Summary */}
                        <motion.section variants={itemVariants}>
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="text-purple-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">AI Clinical Summary</h3>
                                <span className="bg-purple-100 text-purple-700 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">Beta</span>
                            </div>
                            <div className="bg-gradient-to-br from-white to-purple-50/30 rounded-xl shadow-sm border border-purple-100 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="relative">
                                    <div className="flex items-start justify-between mb-5">
                                        <div>
                                            <p className="font-bold text-gray-900 text-lg">{mockAISummary.patient}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                                <Clock size={12} /> Last updated {mockAISummary.lastUpdated}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {mockAISummary.flags.map(f => (
                                            <span key={f} className="flex items-center gap-1 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                                                <AlertTriangle size={12} /> {f}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="bg-white/60 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-purple-50 shadow-sm backdrop-blur-sm">
                                        {mockAISummary.summary}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-4 italic flex items-start gap-1">
                                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                        AI summaries are for informational purposes only. Always verify with primary source records before clinical decisions.
                                    </p>
                                </div>
                            </div>
                        </motion.section>
                    </div>
                </motion.div>
            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl font-medium"
                    >
                        <CheckCircle size={20} className="text-green-400" />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <Chatbot context="doctor" />
        </div>
    )
}
