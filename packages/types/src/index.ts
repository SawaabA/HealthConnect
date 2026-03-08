export type RoleName = "patient" | "guardian" | "doctor" | "admin";

export type RequestStatus = "pending" | "approved" | "denied" | "expired" | "revoked";

export type RecordCategory =
  | "allergies"
  | "medications"
  | "labs"
  | "imaging_reports"
  | "referral_notes"
  | "emergency_summary";

export interface UserIdentity {
  id: number;
  role: RoleName;
  displayName: string;
}

export interface HealthRecord {
  id: number;
  patientId: number;
  category: RecordCategory;
  title: string;
  uploadedAt: string;
  sourceProvider: string;
  storageKey: string;
  mimeType: string;
}

export interface AccessRequest {
  id: number;
  doctorUserId: number;
  patientId: number;
  requestedCategories: RecordCategory[];
  reason: string;
  requestedDurationHours: number;
  breakGlassRequested: boolean;
  status: RequestStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedByUserId?: number;
}

export interface AccessGrant {
  id: number;
  accessRequestId: number;
  doctorUserId: number;
  patientId: number;
  grantedCategories: RecordCategory[];
  startsAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface AISummary {
  id: number;
  patientId: number;
  type: "patient_explanation" | "doctor_brief" | "audit_digest";
  content: string;
  disclaimer: string;
  createdAt: string;
  audioUrl?: string;
}

export interface AuditLogEntry {
  id: number;
  actorUserId?: number;
  action: string;
  accessRequestId?: number;
  accessGrantId?: number;
  details: Record<string, unknown>;
  createdAt: string;
}
