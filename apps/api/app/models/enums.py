from enum import Enum


class RoleName(str, Enum):
    PATIENT = "patient"
    GUARDIAN = "guardian"
    DOCTOR = "doctor"
    ADMIN = "admin"


class RecordCategory(str, Enum):
    ALLERGIES = "allergies"
    MEDICATIONS = "medications"
    LABS = "labs"
    IMAGING_REPORTS = "imaging_reports"
    REFERRAL_NOTES = "referral_notes"
    EMERGENCY_SUMMARY = "emergency_summary"


class AccessRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"
    EXPIRED = "expired"
    REVOKED = "revoked"


class SummaryType(str, Enum):
    PATIENT_EXPLANATION = "patient_explanation"
    DOCTOR_BRIEF = "doctor_brief"
    AUDIT_DIGEST = "audit_digest"


class AuditAction(str, Enum):
    ACCESS_REQUEST_CREATED = "access_request_created"
    ACCESS_REQUEST_APPROVED = "access_request_approved"
    ACCESS_REQUEST_DENIED = "access_request_denied"
    ACCESS_GRANT_REVOKED = "access_grant_revoked"
    ACCESS_EXPIRED = "access_expired"
    RECORD_VIEWED = "record_viewed"
    SUMMARY_GENERATED = "summary_generated"
    AUDIO_GENERATED = "audio_generated"
    BREAK_GLASS_REQUESTED = "break_glass_requested"
