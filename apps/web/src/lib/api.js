const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const RECORD_CATEGORIES = [
  "allergies",
  "medications",
  "labs",
  "imaging_reports",
  "referral_notes",
  "emergency_summary",
];

function buildUrl(path) {
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

function extractErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail) && payload.detail.length > 0) {
    const first = payload.detail[0];
    if (first?.msg) return first.msg;
  }
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, userId, token, headers = {} } = options;

  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  if (userId) {
    requestHeaders["x-user-id"] = String(userId);
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(path), {
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
  return apiRequest(`/access-requests/patient/${patientId}`, { userId, token });
}

export async function listDoctorAccessRequests({ userId, token }) {
  return apiRequest("/access-requests/doctor/me", { userId, token });
}

export async function approveAccessRequest({
  requestId,
  approvedCategories = null,
  durationHours = null,
  userId,
  token,
}) {
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
  return apiRequest(`/consent/${requestId}/deny`, {
    method: "POST",
    userId,
    token,
  });
}

export async function listPatientRecords({ patientId, userId, token }) {
  return apiRequest(`/records/patients/${patientId}`, { userId, token });
}

export async function listAuditLogs({ userId, token, limit = 100 }) {
  return apiRequest(`/audit-logs/?limit=${limit}`, { userId, token });
}
