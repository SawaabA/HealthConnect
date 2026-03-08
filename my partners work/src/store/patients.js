/**
 * Shared in-memory patient store.
 * Both DoctorDashboard and PatientDashboard import from here so
 * doctor edits (including PDF attachments) are visible to patients
 * in the same browser session without a backend.
 */

const initialPatients = [
    {
        id: 1,
        name: 'Sarah Chen',
        age: 34,
        mrn: 'MRN-2024-0042',
        condition: 'Type 1 Diabetes',
        description: 'Patient presents with well-controlled Type 1 Diabetes (HbA1c 6.8%, target <7%). Current regimen is effective.',
        lastVisit: '2026-02-14',
        status: 'Active',
        email: 'sarah.chen@email.com',
        attachments: [],
        feedback: [
            { date: '2026-02-14', message: 'Great progress on HbA1c levels — down to 6.8% from 7.2% last quarter. Continue current insulin regimen and low-carb diet. Come back in 3 months for follow-up. No new concerns at this time.' },
        ],
    },
    {
        id: 2,
        name: 'Daniel Okafor',
        age: 58,
        mrn: 'MRN-2024-0087',
        condition: 'Hypertension + CKD',
        description: 'Monitoring blood pressure. Started on new low-sodium diet plan.',
        lastVisit: '2026-01-30',
        status: 'Active',
        email: 'daniel.okafor@email.com',
        attachments: [],
        feedback: [
            { date: '2026-01-30', message: 'Blood pressure is improving on the new diet plan. Keep reducing sodium. Increased Amlodipine to 10mg. Schedule a kidney function test in 6 weeks.' },
        ],
    },
    {
        id: 3,
        name: 'Priya Sharma',
        age: 42,
        mrn: 'MRN-2024-0103',
        condition: 'Rheumatoid Arthritis',
        description: 'First consultation regarding joint pain.',
        lastVisit: '2026-03-01',
        status: 'Pending',
        email: 'priya.sharma@email.com',
        attachments: [],
        feedback: [],
    },
]

// Mutable singleton — mutations here are visible everywhere that imports this module.
let patients = [...initialPatients]

export function getPatients() {
    return patients
}

export function upsertPatient(updated) {
    const idx = patients.findIndex(p => p.id === updated.id)
    if (idx >= 0) {
        patients = patients.map(p => p.id === updated.id ? updated : p)
    } else {
        patients = [updated, ...patients]
    }
    return patients
}

export function addPatient(patient) {
    patients = [patient, ...patients]
    return patients
}
