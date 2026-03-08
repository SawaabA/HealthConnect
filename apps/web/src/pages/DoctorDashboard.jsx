import { useAuth0 } from '@auth0/auth0-react'
import { useMemo, useState } from 'react'
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, Activity, FileText, CheckCircle, Clock, AlertTriangle, Sparkles, LogOut, FileSearch, Plus, Edit2, X, Send, Paperclip, Trash2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Chatbot from '../components/Chatbot'
import Logo from '../components/Logo'
import { getPatients, upsertPatient, addPatient as storeAddPatient } from '../store/patients'
import { resolveRoleAndUserId } from '../lib/auth'
import { createAccessRequest, getAllRecordCategories } from '../lib/api'


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
    const { user, logout, getAccessTokenSilently } = useAuth0()
    const [search, setSearch] = useState('')
    const [requestSent, setRequestSent] = useState({})
    const [toast, setToast] = useState(null)

    // Patient Management State
    const [patients, setPatients] = useState(() => getPatients())
    const [modal, setModal] = useState({ isOpen: false, mode: 'add', patient: null })
    const [formData, setFormData] = useState({ name: '', age: '', mrn: '', condition: '', description: '', newFeedback: '', email: '', status: 'Active', attachments: [] })
    const [pendingFiles, setPendingFiles] = useState([]) // File objects not yet saved
    const [requestDataModal, setRequestDataModal] = useState(false)
    const [requestForm, setRequestForm] = useState({ patientName: '', fromEmergencyContact: false })
    const authContext = useMemo(() => resolveRoleAndUserId(user, 'doctor'), [user])

    const filtered = patients.filter(p =>
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    async function resolveTokenIfConfigured() {
        if (!import.meta.env.VITE_AUTH0_AUDIENCE) return null
        return getAccessTokenSilently()
    }

    async function submitAccessRequest({ patientId, reason, breakGlassRequested = false }) {
        const token = await resolveTokenIfConfigured()
        await createAccessRequest({
            patientId,
            reason,
            durationHours: breakGlassRequested ? 4 : 24,
            categories: getAllRecordCategories(),
            breakGlassRequested,
            userId: authContext.userId,
            token,
        })
    }

    async function handleRequest(id) {
        try {
            if (id !== 1) {
                throw new Error('Only the seeded demo patient is mapped to the backend right now.')
            }

            const patientName = patients.find(p => p.id === id)?.name || 'this patient'
            await submitAccessRequest({
                patientId: 1,
                reason: `Doctor requested standard review access for ${patientName}.`,
            })
            setRequestSent(prev => ({ ...prev, [id]: true }))
            setToast(`Access request sent for ${patientName}`)
        } catch (error) {
            setToast(error?.message || 'Could not create access request')
        } finally {
            setTimeout(() => setToast(null), 3000)
        }
    }

    // Modal Helpers
    function openAddModal() {
        setFormData({ name: '', age: '', mrn: `MRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`, condition: '', description: '', newFeedback: '', email: '', status: 'Active', attachments: [] })
        setPendingFiles([])
        setModal({ isOpen: true, mode: 'add', patient: null })
    }

    function openEditModal(patient) {
        setFormData({ ...patient, attachments: patient.attachments || [], newFeedback: '' })
        setPendingFiles([])
        setModal({ isOpen: true, mode: 'edit', patient })
    }

    function closeModal() {
        setModal({ isOpen: false, mode: 'add', patient: null })
        setFormData({ name: '', age: '', mrn: '', condition: '', description: '', newFeedback: '', email: '', status: 'Active', attachments: [] })
        setPendingFiles([])
    }

    function handleFileChange(e) {
        const files = Array.from(e.target.files)
        setPendingFiles(prev => [...prev, ...files])
        e.target.value = '' // reset so same file can be re-added
    }

    function removePendingFile(idx) {
        setPendingFiles(prev => prev.filter((_, i) => i !== idx))
    }

    function removeExistingAttachment(url) {
        setFormData(prev => ({ ...prev, attachments: prev.attachments.filter(a => a.url !== url) }))
    }

    function fireStars() {
        const defaults = { spread: 360, ticks: 50, gravity: 0, decay: 0.94, startVelocity: 30, colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'] };

        function shoot() {
            confetti({
                ...defaults,
                particleCount: 40,
                scalar: 1.2,
                shapes: ['star']
            });

            confetti({
                ...defaults,
                particleCount: 10,
                scalar: 0.75,
                shapes: ['circle']
            });
        }

        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 200);
    }

    function handleSavePatient(e) {
        e.preventDefault()

        // Convert any pending File objects to blob URLs
        const newAttachments = pendingFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f) }))
        const allAttachments = [...(formData.attachments || []), ...newAttachments]

        // Append new feedback entry if provided
        const existingFeedback = modal.patient?.feedback || []
        const allFeedback = formData.newFeedback?.trim()
            ? [{ date: new Date().toISOString().split('T')[0], message: formData.newFeedback.trim() }, ...existingFeedback]
            : existingFeedback

        if (modal.mode === 'add') {
            const newPatient = {
                ...formData,
                attachments: allAttachments,
                feedback: allFeedback,
                id: Date.now(),
                lastVisit: new Date().toISOString().split('T')[0],
                age: parseInt(formData.age, 10) || 0
            }
            const updated = storeAddPatient(newPatient)
            setPatients([...updated])
            setToast(`Added new patient ${newPatient.name}`)
            fireStars()
        } else {
            const updatedPatient = { ...formData, attachments: allAttachments, feedback: allFeedback, id: modal.patient.id, lastVisit: modal.patient.lastVisit, age: parseInt(formData.age, 10) || modal.patient.age }
            upsertPatient(updatedPatient)
            setPatients(prev => prev.map(p => p.id === modal.patient.id ? updatedPatient : p))
            setToast(`Updated details for ${formData.name}`)
        }

        closeModal()
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
            <header style={{ backgroundColor: '#adebb3' }} className="shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Logo className="w-9 h-9" />
                        <div>
                            <h1 className="text-gray-900 font-bold text-lg">HealthConnect</h1>
                            <p className="text-gray-700 text-xs">Physician Portal</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-gray-900 text-sm font-medium">{user?.name || user?.email}</p>
                            <p className="text-gray-700 text-xs">Physician</p>
                        </div>
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {(user?.name || user?.email || 'D')[0].toUpperCase()}
                        </div>
                        <button
                            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-900 text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <Users className="text-green-600" size={20} />
                                    <h3 className="text-lg font-bold text-gray-900">Patient Directory</h3>
                                </div>
                                <button
                                    onClick={openAddModal}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    <Plus size={16} /> Add Patient
                                </button>
                                <button
                                    onClick={() => { setRequestDataModal(true); setRequestForm({ patientName: '', fromEmergencyContact: false }) }}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    <Send size={16} /> Request Data
                                </button>
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
                                            <th className="px-5 py-4 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {patients.map(p => (
                                            <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
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
                                                <td className="px-5 py-4 text-right">
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                                                        title="Edit Patient"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                </td>
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

            {/* Request Data Modal */}
            <AnimatePresence>
                {requestDataModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setRequestDataModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Request Patient Data</h3>
                                    <p className="text-sm text-gray-500">Send a secure access request</p>
                                </div>
                                <button onClick={() => setRequestDataModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X size={18} className="text-gray-400" />
                                </button>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault()
                                try {
                                    await submitAccessRequest({
                                        patientId: 1,
                                        reason: requestForm.fromEmergencyContact
                                            ? `Emergency request for ${requestForm.patientName}.`
                                            : `Doctor requested records for ${requestForm.patientName}.`,
                                        breakGlassRequested: requestForm.fromEmergencyContact,
                                    })
                                    const msg = requestForm.fromEmergencyContact
                                        ? `Emergency request sent for ${requestForm.patientName}`
                                        : `Data request sent for ${requestForm.patientName}`
                                    setToast(msg)
                                } catch (error) {
                                    setToast(error?.message || 'Could not send access request')
                                } finally {
                                    setRequestDataModal(false)
                                    setTimeout(() => setToast(null), 3000)
                                }
                            }} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Patient Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={requestForm.patientName}
                                        onChange={e => setRequestForm({ ...requestForm, patientName: e.target.value })}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="Enter patient's full name"
                                    />
                                </div>

                                <div className={`rounded-xl border-2 p-4 transition-colors cursor-pointer ${requestForm.fromEmergencyContact ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:border-gray-300'}`}
                                    onClick={() => setRequestForm({ ...requestForm, fromEmergencyContact: !requestForm.fromEmergencyContact })}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`w-5 h-5 mt-0.5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${requestForm.fromEmergencyContact ? 'bg-red-500 border-red-500' : 'border-gray-300 bg-white'}`}>
                                            {requestForm.fromEmergencyContact && (
                                                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">🚨 Request from Emergency Contact</p>
                                            <p className="text-xs text-gray-500 mt-1">Use this if the patient is unable to consent (e.g. unconscious in the ER). The request will be routed to their registered emergency contact or legal guardian.</p>
                                        </div>
                                    </div>
                                </div>

                                {requestForm.fromEmergencyContact && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="bg-red-50 border border-red-200 rounded-lg p-3"
                                    >
                                        <p className="text-xs text-red-700"><strong>⚠️ Emergency Protocol:</strong> This request bypasses normal patient consent. The system will locate the patient's emergency contact or legal guardian and route the access request to them for immediate approval.</p>
                                    </motion.div>
                                )}

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setRequestDataModal(false)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">Cancel</button>
                                    <button type="submit" className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white rounded-lg transition-colors shadow-sm ${requestForm.fromEmergencyContact ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                        <Send size={14} />
                                        {requestForm.fromEmergencyContact ? 'Send Emergency Request' : 'Send Request'}
                                    </button>
                                </div>
                            </form>
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
                        <CheckCircle size={20} className="text-green-400" />
                        <span>{toast}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {modal.isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {modal.mode === 'add' ? 'Add New Patient' : 'Edit Patient'}
                                </h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSavePatient} className="p-6 overflow-y-auto space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. Jane Doe" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                                        <input required type="number" min="0" max="150" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. 45" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">MRN</label>
                                        <input required type="text" value={formData.mrn} onChange={e => setFormData({ ...formData, mrn: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono" placeholder="MRN-..." />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Condition(s)</label>
                                        <input type="text" value={formData.condition} onChange={e => setFormData({ ...formData, condition: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="e.g. Hypertension, Diabetes" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                                        <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" placeholder="patient@email.com" />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Clinical Notes / Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm min-h-[80px]"
                                            placeholder="Enter patient background, symptoms, or visit notes..."
                                        />
                                    </div>

                                    {/* Doctor Feedback */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                                            Visit Feedback <span className="text-xs font-normal text-gray-400">(visible to patient)</span>
                                        </label>
                                        <textarea
                                            value={formData.newFeedback}
                                            onChange={e => setFormData({ ...formData, newFeedback: e.target.value })}
                                            className="w-full px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm min-h-[70px]"
                                            placeholder="e.g. Great progress this visit. Continue current plan and follow up in 3 months..."
                                        />
                                        {/* Show previous feedback entries */}
                                        {(modal.patient?.feedback?.length > 0) && (
                                            <div className="mt-2 space-y-1.5">
                                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Previous Feedback</p>
                                                {modal.patient.feedback.map((f, i) => (
                                                    <div key={i} className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                                                        <p className="text-xs text-gray-400 mb-0.5">{f.date}</p>
                                                        <p className="text-xs text-gray-600">{f.message}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* PDF Attachments */}
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            <span className="flex items-center gap-1.5"><Paperclip size={14} /> PDF Attachments</span>
                                        </label>

                                        {/* Existing saved attachments */}
                                        {formData.attachments?.length > 0 && (
                                            <div className="mb-2 space-y-1">
                                                {formData.attachments.map(att => (
                                                    <div key={att.url} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                                                        <a href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 truncate">
                                                            <FileText size={14} />
                                                            {att.name}
                                                        </a>
                                                        <button type="button" onClick={() => removeExistingAttachment(att.url)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Pending (not yet saved) files */}
                                        {pendingFiles.length > 0 && (
                                            <div className="mb-2 space-y-1">
                                                {pendingFiles.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                                                        <span className="flex items-center gap-2 text-sm text-emerald-700 truncate">
                                                            <FileText size={14} />
                                                            {f.name}
                                                            <span className="text-xs text-emerald-500">(pending)</span>
                                                        </span>
                                                        <button type="button" onClick={() => removePendingFile(i)} className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* File picker */}
                                        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-emerald-400 rounded-xl p-4 cursor-pointer transition-colors group">
                                            <Paperclip size={16} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                                            <span className="text-sm text-gray-500 group-hover:text-emerald-600 transition-colors">Click to attach PDF files</span>
                                            <input type="file" accept=".pdf" multiple onChange={handleFileChange} className="hidden" />
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm">
                                        {modal.mode === 'add' ? 'Add Patient' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Chatbot context="doctor" />
        </div>
    )
}
