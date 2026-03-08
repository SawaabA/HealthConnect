import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthconnect/ui";

import { StatusBadge } from "../../../components/status-badge";
import { formatDateTime } from "../../../lib/format";
import { getDoctorRequests } from "../../../lib/api";

export default async function AccessRequestDetailPage({ params }: { params: { id: string } }) {
  const requestId = Number(params.id);
  const requests = await getDoctorRequests();
  const request = requests.find((item) => item.id === requestId);

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Access Request #{request.id}</h1>
        <StatusBadge status={request.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Scope</CardTitle>
          <CardDescription>Doctor-specified scope and consent decision state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            <span className="font-semibold">Reason:</span> {request.reason}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Requested duration:</span> {request.requestedDurationHours} hours
          </p>
          <div className="flex flex-wrap gap-2">
            {request.requestedCategories.map((category) => (
              <Badge key={category} variant="muted">
                {category}
              </Badge>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Requested At</p>
              <p className="text-sm font-medium">{formatDateTime(request.requestedAt)}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Decision Time</p>
              <p className="text-sm font-medium">{request.decidedAt ? formatDateTime(request.decidedAt) : "Pending"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Link href="/doctor" className="text-sky-700 underline">
        Back to Doctor Dashboard
      </Link>
    </div>
  );
}
