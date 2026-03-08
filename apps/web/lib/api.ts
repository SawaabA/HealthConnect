import type { AccessRequest, AuditLogEntry, HealthRecord, RequestStatus } from "@healthconnect/types";

import { demoAccessRequests, demoAuditLogs, demoPatientRecords, demoSummaries } from "./mock-data";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function safeFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getPatientRecords(patientId: number): Promise<HealthRecord[]> {
  const apiResult = await safeFetch<HealthRecord[]>(`/records/patients/${patientId}`);
  return apiResult ?? demoPatientRecords.filter((record) => record.patientId === patientId);
}

export async function getPatientRequests(patientId: number): Promise<AccessRequest[]> {
  const apiResult = await safeFetch<AccessRequest[]>(`/access-requests/patient/${patientId}`);
  return apiResult ?? demoAccessRequests.filter((request) => request.patientId === patientId);
}

export async function getDoctorRequests(): Promise<AccessRequest[]> {
  const apiResult = await safeFetch<AccessRequest[]>("/access-requests/doctor/me");
  return apiResult ?? demoAccessRequests;
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  const apiResult = await safeFetch<AuditLogEntry[]>("/audit-logs");
  return apiResult ?? demoAuditLogs;
}

export async function getPatientSummaries(patientId: number) {
  const apiResult = await safeFetch<typeof demoSummaries>(`/summaries/patients/${patientId}`);
  return apiResult ?? demoSummaries.filter((summary) => summary.patientId === patientId);
}

export function summarizeStatusCounts(items: { status: RequestStatus }[]) {
  return items.reduce<Record<RequestStatus, number>>(
    (acc, item) => {
      acc[item.status] += 1;
      return acc;
    },
    {
      pending: 0,
      approved: 0,
      denied: 0,
      expired: 0,
      revoked: 0
    }
  );
}
