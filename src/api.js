// Use Vite environment variable syntax or fallback to local IP
const API_URL = import.meta.env.VITE_API_URL || 'http://100.100.30.114:3000';

// ==========================================
// PATIENTS
// ==========================================
export const getPatient = (auth0_id) =>
    fetch(`${API_URL}/api/patients/${auth0_id}`).then(r => r.json());

export const createPatient = (data) =>
    fetch(`${API_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());

// Added: Search for patient by email
export const searchPatients = (email) =>
    fetch(`${API_URL}/api/patients/search?email=${encodeURIComponent(email)}`).then(r => r.json());

// Added: Fetch AI summary for a patient
export const getAISummary = (patient_id) =>
    fetch(`${API_URL}/api/patients/${patient_id}/summary`).then(r => r.json());


// ==========================================
// DOCTORS
// ==========================================
export const getDoctor = (auth0_id) =>
    fetch(`${API_URL}/api/doctors/${auth0_id}`).then(r => r.json());

export const createDoctor = (data) =>
    fetch(`${API_URL}/api/doctors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());

// Added: Fetch a doctor's assigned / approved patients
export const getDoctorPatients = (doctor_id) =>
    fetch(`${API_URL}/api/doctors/${doctor_id}/patients`).then(r => r.json());


// ==========================================
// RECORDS
// ==========================================
export const getRecords = (patient_id) =>
    fetch(`${API_URL}/api/records/${patient_id}`).then(r => r.json());

export const uploadRecord = (formData) =>
    fetch(`${API_URL}/api/records/upload`, {
        method: 'POST',
        body: formData
    }).then(r => r.json());

// ==========================================
// ACCESS REQUESTS
// ==========================================
export const requestAccess = (data) =>
    fetch(`${API_URL}/api/access/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json());

export const getPendingRequests = (patient_id) =>
    fetch(`${API_URL}/api/access/pending/${patient_id}`).then(r => r.json());

export const respondToRequest = (id, status) =>
    fetch(`${API_URL}/api/access/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    }).then(r => r.json());

// ==========================================
// AUDIT
// ==========================================
export const getAuditLog = (patient_id) =>
    fetch(`${API_URL}/api/audit/${patient_id}`).then(r => r.json());