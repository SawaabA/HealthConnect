const DEFAULT_FASTAPI_BASE = "http://localhost:8000/api/v1";
const DEFAULT_LEGACY_BASE = "http://localhost:3000";
const DEFAULT_DISCLAIMER = "Assistive summary only. Not medical advice.";

const rawBackendMode = import.meta.env.VITE_BACKEND_MODE || "fastapi";
const BACKEND_MODE = rawBackendMode.toLowerCase() === "legacy" ? "legacy" : "fastapi";

const configuredBase = import.meta.env.VITE_API_URL;
const FASTAPI_BASE_URL =
  import.meta.env.VITE_FASTAPI_URL || configuredBase || DEFAULT_FASTAPI_BASE;
const LEGACY_BASE_URL =
  import.meta.env.VITE_LEGACY_API_URL || configuredBase || DEFAULT_LEGACY_BASE;

const RECORD_CATEGORIES = [
  "allergies",
  "medications",
  "labs",
  "imaging_reports",
  "referral_notes",
  "emergency_summary",
];

function isLegacyBackend() {
  return BACKEND_MODE === "legacy";
}

export function getBackendMode() {
  return BACKEND_MODE;
}

function resolveBaseUrl(mode = BACKEND_MODE) {
  return mode === "legacy" ? LEGACY_BASE_URL : FASTAPI_BASE_URL;
}

function buildUrl(baseUrl, path) {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload.detail === "string") return payload.detail;
  if (typeof payload.message === "string") return payload.message;
  if (typeof payload.error === "string") return payload.error;
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const first = payload.detail[0];
    if (first?.msg) return first.msg;
  }
  return fallback;
}

function normalizeLegacyCategory(rawCategory) {
  const normalized = String(rawCategory || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const aliasMap = {
    allergy: "allergies",
    allergies: "allergies",
    medication: "medications",
    medications: "medications",
    prescription: "medications",
    prescriptions: "medications",
    lab: "labs",
    labs: "labs",
    lab_results: "labs",
    blood_test: "labs",
    imaging: "imaging_reports",
    imaging_report: "imaging_reports",
    imaging_reports: "imaging_reports",
    referral: "referral_notes",
    referral_note: "referral_notes",
    referral_notes: "referral_notes",
    consultation: "referral_notes",
    emergency: "emergency_summary",
    emergency_summary: "emergency_summary",
  };

  return aliasMap[normalized] || "referral_notes";
}

function normalizeCategoryList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(normalizeLegacyCategory);
  return String(value)
    .split(",")
    .map((item) => normalizeLegacyCategory(item))
    .filter(Boolean);
}

function resolveLegacyPatientId(patientId) {
  return import.meta.env.VITE_LEGACY_PATIENT_ID || String(patientId);
}

function resolveLegacyDoctorId(userId) {
  return import.meta.env.VITE_LEGACY_DOCTOR_ID || String(userId);
}

function normalizeLegacyAccessRequest(accessRequest) {
  if (!accessRequest) return null;
  return {
    id: accessRequest.id,
    doctor_user_id: Number.parseInt(accessRequest.doctor_user_id ?? "0", 10) || 0,
    patient_id: Number.parseInt(accessRequest.patient_id ?? "0", 10) || 0,
    requested_categories: normalizeCategoryList(
      accessRequest.requested_categories ?? accessRequest.categories,
    ),
    reason: accessRequest.reason || "No reason provided",
    requested_duration_hours:
      Number.parseInt(accessRequest.requested_duration_hours ?? accessRequest.duration_hours ?? "24", 10) ||
      24,
    break_glass_requested: Boolean(accessRequest.break_glass_requested),
    status: accessRequest.status || "pending",
    requested_at: accessRequest.requested_at || accessRequest.created_at || new Date().toISOString(),
    decided_at: accessRequest.decided_at || accessRequest.updated_at || null,
    decided_by_user_id:
      Number.parseInt(accessRequest.decided_by_user_id ?? "0", 10) || null,
  };
}

function normalizeLegacyRecord(record, fallbackPatientId) {
  const category = normalizeLegacyCategory(
    record.category || record.record_type || record.type || record.record_category,
  );
  return {
    id: Number.parseInt(record.id ?? "0", 10) || 0,
    patient_id:
      Number.parseInt(record.patient_id ?? fallbackPatientId ?? "0", 10) ||
      Number.parseInt(fallbackPatientId ?? "0", 10) ||
      0,
    category,
    title: record.title || record.summary || record.file_name || "Health record",
    uploaded_at:
      record.uploaded_at ||
      record.created_at ||
      record.date ||
      new Date().toISOString(),
    source_provider:
      record.source_provider || record.source || record.doctor || "Connected Provider",
    storage_key: record.storage_key || record.file_path || record.file_url || `records/${record.id || "unknown"}`,
    mime_type: record.mime_type || record.content_type || "application/pdf",
  };
}

function normalizeLegacyAuditLog(log, index) {
  return {
    id: Number.parseInt(log.id ?? String(index + 1), 10) || index + 1,
    actor_user_id: Number.parseInt(log.actor_user_id ?? "0", 10) || null,
    action: log.action || log.event || "event",
    access_request_id:
      Number.parseInt(log.access_request_id ?? "0", 10) || null,
    access_grant_id: Number.parseInt(log.access_grant_id ?? "0", 10) || null,
    details: log.details || log.metadata || log,
    created_at: log.created_at || log.time || new Date().toISOString(),
  };
}

function normalizeSummary(summary, fallbackType = "patient_explanation", fallbackPatientId = 1) {
  if (!summary) return null;
  return {
    id: summary.id || 0,
    patient_id:
      Number.parseInt(summary.patient_id ?? fallbackPatientId ?? "1", 10) ||
      Number.parseInt(fallbackPatientId ?? "1", 10) ||
      1,
    access_request_id: summary.access_request_id || null,
    summary_type: summary.summary_type || fallbackType,
    content: summary.content || summary.summary || summary.explanation || "",
    disclaimer: summary.disclaimer || DEFAULT_DISCLAIMER,
    audio_storage_key: summary.audio_storage_key || null,
    created_at: summary.created_at || new Date().toISOString(),
  };
}

function withDisclaimer(content) {
  if (!content) return DEFAULT_DISCLAIMER;
  if (content.includes(DEFAULT_DISCLAIMER)) return content;
  return `${content}\n\n${DEFAULT_DISCLAIMER}`;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, userId, token, headers = {}, mode = BACKEND_MODE } = options;
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (mode === "fastapi" && userId) {
    requestHeaders["x-user-id"] = String(userId);
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(resolveBaseUrl(mode), path), {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const fallback = `Request failed (${response.status})`;
    throw new Error(extractErrorMessage(payload, fallback));
  }

  return payload;
}

export function getAllRecordCategories() {
  return [...RECORD_CATEGORIES];
}

export function prettifyCategory(category) {
  return category
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function createAccessRequest({
  patientId,
  reason,
  durationHours = 24,
  categories = RECORD_CATEGORIES,
  breakGlassRequested = false,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/access/request", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        patient_id: resolveLegacyPatientId(patientId),
        doctor_id: resolveLegacyDoctorId(userId),
        reason,
        categories,
        requested_categories: categories,
        duration_hours: durationHours,
        requested_duration_hours: durationHours,
        break_glass_requested: breakGlassRequested,
      },
    });
    return normalizeLegacyAccessRequest(payload);
  }

  return apiRequest("/access-requests/", {
    method: "POST",
    userId,
    token,
    body: {
      patient_id: patientId,
      categories,
      reason,
      duration_hours: durationHours,
      break_glass_requested: breakGlassRequested,
    },
  });
}

export async function listPatientAccessRequests({ patientId, userId, token }) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/access/pending/${resolveLegacyPatientId(patientId)}`, {
      mode: "legacy",
      token,
    });
    if (!Array.isArray(payload)) return [];
    return payload.map(normalizeLegacyAccessRequest).filter(Boolean);
  }

  return apiRequest(`/access-requests/patient/${patientId}`, { userId, token });
}

export async function listDoctorAccessRequests({ userId, token }) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/access/doctor/${resolveLegacyDoctorId(userId)}`, {
      mode: "legacy",
      token,
    }).catch(() => []);
    if (!Array.isArray(payload)) return [];
    return payload.map(normalizeLegacyAccessRequest).filter(Boolean);
  }

  return apiRequest("/access-requests/doctor/me", { userId, token });
}

export async function approveAccessRequest({
  requestId,
  approvedCategories = null,
  durationHours = null,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/access/${requestId}`, {
      method: "PATCH",
      mode: "legacy",
      token,
      body: {
        status: "approved",
        approved_categories: approvedCategories,
        duration_hours: durationHours,
        decided_by: String(userId ?? ""),
      },
    });
    return normalizeLegacyAccessRequest(payload);
  }

  return apiRequest(`/consent/${requestId}/approve`, {
    method: "POST",
    userId,
    token,
    body: {
      approved_categories: approvedCategories,
      duration_hours: durationHours,
    },
  });
}

export async function denyAccessRequest({ requestId, userId, token }) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/access/${requestId}`, {
      method: "PATCH",
      mode: "legacy",
      token,
      body: {
        status: "denied",
        decided_by: String(userId ?? ""),
      },
    });
    return normalizeLegacyAccessRequest(payload);
  }

  return apiRequest(`/consent/${requestId}/deny`, {
    method: "POST",
    userId,
    token,
  });
}

export async function listPatientRecords({ patientId, userId, token }) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/records/${resolveLegacyPatientId(patientId)}`, {
      mode: "legacy",
      token,
    });
    if (!Array.isArray(payload)) return [];
    return payload.map((item) => normalizeLegacyRecord(item, patientId));
  }

  return apiRequest(`/records/patients/${patientId}`, { userId, token });
}

export async function listAuditLogs({ userId, token, limit = 100, patientId = 1 }) {
  if (isLegacyBackend()) {
    const payload = await apiRequest(`/api/audit/${resolveLegacyPatientId(patientId)}`, {
      mode: "legacy",
      token,
    });
    if (!Array.isArray(payload)) return [];
    return payload.slice(0, limit).map(normalizeLegacyAuditLog);
  }

  return apiRequest(`/audit-logs/?limit=${limit}`, { userId, token });
}

export async function generatePatientSummary({
  patientId,
  patientContext,
  visitContext = null,
  accessRequestId = null,
  patientName = "Patient",
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/ai/explain", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        record_text: patientContext,
        patient_name: patientName,
      },
    });
    return normalizeSummary(
      {
        summary_type: "patient_explanation",
        content: withDisclaimer(payload?.explanation || payload?.summary || ""),
      },
      "patient_explanation",
      patientId,
    );
  }

  const payload = await apiRequest(`/summaries/patients/${patientId}/patient-friendly`, {
    method: "POST",
    userId,
    token,
    body: {
      patient_context: patientContext,
      visit_context: visitContext,
      access_request_id: accessRequestId,
    },
  });
  return normalizeSummary(payload, "patient_explanation", patientId);
}

export async function generateDoctorBrief({
  requestId,
  patientId,
  patientName = "Patient",
  patientContext,
  visitContext = null,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/ai/brief", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        patient_name: patientName,
        records_text: patientContext,
      },
    });
    return normalizeSummary(
      {
        summary_type: "doctor_brief",
        content: withDisclaimer(payload?.briefing || payload?.summary || ""),
      },
      "doctor_brief",
      patientId,
    );
  }

  if (!requestId) {
    throw new Error("Create or select an access request before generating a doctor brief.");
  }

  const payload = await apiRequest(`/summaries/requests/${requestId}/doctor-brief`, {
    method: "POST",
    userId,
    token,
    body: {
      patient_context: patientContext,
      visit_context: visitContext,
      access_request_id: requestId,
    },
  });
  return normalizeSummary(payload, "doctor_brief", patientId);
}

export async function generateAuditDigest({
  patientId,
  auditEvents,
  accessRequestId = null,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/ai/audit-summary", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        audit_events: auditEvents,
      },
    });
    return normalizeSummary(
      {
        summary_type: "audit_digest",
        content: withDisclaimer(payload?.summary || ""),
      },
      "audit_digest",
      patientId,
    );
  }

  const payload = await apiRequest(`/summaries/patients/${patientId}/audit-digest`, {
    method: "POST",
    userId,
    token,
    body: {
      audit_events: auditEvents,
      access_request_id: accessRequestId,
    },
  });
  return normalizeSummary(payload, "audit_digest", patientId);
}

export async function generateContinuityReport({
  patientId,
  doctorId,
  patientContext,
  visitContext,
  requestId,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/reports/generate", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        patient_id: resolveLegacyPatientId(patientId),
        doctor_id: doctorId || resolveLegacyDoctorId(userId),
      },
    });
    return normalizeSummary(
      {
        summary_type: "doctor_brief",
        content: withDisclaimer(payload?.report || payload?.summary || ""),
      },
      "doctor_brief",
      patientId,
    );
  }

  return generateDoctorBrief({
    requestId,
    patientId,
    patientContext,
    visitContext,
    userId,
    token,
  });
}

export async function generateVisitRecommendation({
  patientId,
  patientName = "Patient",
  patientContext,
  lastPhysicalDate = null,
  currentSymptoms = [],
  accessRequestId = null,
  userId,
  token,
}) {
  if (isLegacyBackend()) {
    const payload = await apiRequest("/api/ai/brief", {
      method: "POST",
      mode: "legacy",
      token,
      body: {
        patient_name: patientName,
        records_text: `${patientContext}\nLast physical: ${lastPhysicalDate || "unknown"}\nSymptoms: ${
          currentSymptoms.join(", ") || "none reported"
        }`,
      },
    });

    return normalizeSummary(
      {
        summary_type: "visit_recommendation",
        content: withDisclaimer(payload?.recommendation || payload?.briefing || payload?.summary || ""),
      },
      "visit_recommendation",
      patientId,
    );
  }

  const payload = await apiRequest(`/summaries/patients/${patientId}/visit-recommendation`, {
    method: "POST",
    userId,
    token,
    body: {
      patient_context: patientContext,
      last_physical_date: lastPhysicalDate,
      current_symptoms: currentSymptoms,
      access_request_id: accessRequestId,
    },
  });
  return normalizeSummary(payload, "visit_recommendation", patientId);
}

export async function generateSummaryAudio({ summaryId, userId, token }) {
  if (isLegacyBackend()) {
    throw new Error("Summary audio generation is only available on the FastAPI backend.");
  }
  const payload = await apiRequest(`/summaries/${summaryId}/audio`, {
    method: "POST",
    userId,
    token,
  });
  return normalizeSummary(payload);
}

export async function updateSummaryContent({ summaryId, content, userId, token }) {
  if (isLegacyBackend()) {
    return normalizeSummary({
      id: summaryId,
      content: withDisclaimer(content),
      summary_type: "doctor_brief",
    });
  }

  const payload = await apiRequest(`/summaries/${summaryId}`, {
    method: "PATCH",
    userId,
    token,
    body: { content },
  });
  return normalizeSummary(payload);
}

export async function fetchSummaryAudioBlob({ summaryId, userId, token }) {
  if (isLegacyBackend()) {
    throw new Error("Summary audio streaming is only available on the FastAPI backend.");
  }

  const headers = { Accept: "audio/mpeg" };
  if (userId) headers["x-user-id"] = String(userId);
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(
    buildUrl(resolveBaseUrl("fastapi"), `/summaries/${summaryId}/audio/stream`),
    { method: "GET", headers },
  );

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const payload = await response.json();
      detail = extractErrorMessage(payload, detail);
    } catch {
      // Keep fallback status message.
    }
    throw new Error(detail);
  }

  return response.blob();
}
