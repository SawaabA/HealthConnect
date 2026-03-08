import type { AISummary, AccessRequest, AuditLogEntry, HealthRecord, RequestStatus } from "@healthconnect/types";

export const demoPatientRecords: HealthRecord[] = [
  {
    id: 1,
    patientId: 1,
    category: "allergies",
    title: "Peanut Allergy Record",
    uploadedAt: "2026-02-11T13:00:00Z",
    sourceProvider: "Toronto General Hospital",
    storageKey: "records/patient-1/allergy-peanut.pdf",
    mimeType: "application/pdf"
  },
  {
    id: 2,
    patientId: 1,
    category: "medications",
    title: "Current Medication List",
    uploadedAt: "2026-02-20T10:30:00Z",
    sourceProvider: "Family Clinic EHR",
    storageKey: "records/patient-1/medications.json",
    mimeType: "application/json"
  },
  {
    id: 3,
    patientId: 1,
    category: "labs",
    title: "Blood Test - Feb 2026",
    uploadedAt: "2026-02-24T16:10:00Z",
    sourceProvider: "LifeLabs",
    storageKey: "records/patient-1/labs-feb-2026.pdf",
    mimeType: "application/pdf"
  },
  {
    id: 4,
    patientId: 1,
    category: "referral_notes",
    title: "Cardiology Referral Note",
    uploadedAt: "2026-02-25T08:40:00Z",
    sourceProvider: "Primary Care Referral Desk",
    storageKey: "records/patient-1/referral-cardiology.txt",
    mimeType: "text/plain"
  }
];

export const demoAccessRequests: AccessRequest[] = [
  {
    id: 11,
    doctorUserId: 3,
    patientId: 1,
    requestedCategories: ["allergies", "labs", "medications"],
    reason: "Pre-visit review before medication adjustment and risk screening.",
    requestedDurationHours: 48,
    breakGlassRequested: false,
    status: "pending",
    requestedAt: "2026-03-06T09:15:00Z"
  },
  {
    id: 9,
    doctorUserId: 3,
    patientId: 1,
    requestedCategories: ["allergies", "medications"],
    reason: "Follow-up consultation for chronic symptom review.",
    requestedDurationHours: 72,
    breakGlassRequested: false,
    status: "approved",
    requestedAt: "2026-03-01T12:05:00Z",
    decidedAt: "2026-03-01T14:00:00Z",
    decidedByUserId: 1
  }
];

export const demoSummaries: AISummary[] = [
  {
    id: 100,
    patientId: 1,
    type: "patient_explanation",
    createdAt: "2026-03-06T09:30:00Z",
    disclaimer: "Assistive summary only. Not medical advice.",
    content:
      "You have one severe allergy alert and recent blood tests that your doctor wants to review before changing medications.\n\nAssistive summary only. Not medical advice.",
    audioUrl: "/demo-audio/patient-summary.mp3"
  },
  {
    id: 101,
    patientId: 1,
    type: "doctor_brief",
    createdAt: "2026-03-06T09:35:00Z",
    disclaimer: "Assistive summary only. Not medical advice.",
    content:
      "Patient has known peanut allergy, active medication list updated in February 2026, and recent bloodwork requiring follow-up discussion.\n\nAssistive summary only. Not medical advice."
  }
];

export const demoAuditLogs: AuditLogEntry[] = [
  {
    id: 901,
    actorUserId: 3,
    action: "access_request_created",
    accessRequestId: 11,
    details: { categories: ["allergies", "labs", "medications"], duration_hours: 48 },
    createdAt: "2026-03-06T09:15:02Z"
  },
  {
    id: 902,
    actorUserId: 1,
    action: "access_request_approved",
    accessRequestId: 9,
    accessGrantId: 77,
    details: { categories: ["allergies", "medications"], expires_at: "2026-03-04T14:00:00Z" },
    createdAt: "2026-03-01T14:00:03Z"
  },
  {
    id: 903,
    actorUserId: 3,
    action: "record_viewed",
    accessRequestId: 9,
    details: { record_id: 2, category: "medications" },
    createdAt: "2026-03-01T15:11:30Z"
  }
];

export const statusOrder: RequestStatus[] = ["pending", "approved", "denied", "expired", "revoked"];
