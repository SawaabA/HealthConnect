import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthconnect/ui";

import { StatusBadge } from "../../components/status-badge";
import { formatDateTime } from "../../lib/format";
import { getPatientRecords, getPatientRequests, getPatientSummaries } from "../../lib/api";

export default async function PatientDashboardPage() {
  const [records, requests, summaries] = await Promise.all([
    getPatientRecords(1),
    getPatientRequests(1),
    getPatientSummaries(1)
  ]);

  const pendingRequests = requests.filter((request) => request.status === "pending");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Patient Dashboard</h1>

      <div className="data-grid">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Your Records</CardTitle>
            <CardDescription>Only approved providers can view scoped categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="capitalize">{record.category.replace("_", " ")}</TableCell>
                    <TableCell>{record.title}</TableCell>
                    <TableCell>{record.sourceProvider}</TableCell>
                    <TableCell>{formatDateTime(record.uploadedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Approve or deny doctor access requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length === 0 ? (
              <p className="text-sm text-slate-500">No pending requests.</p>
            ) : (
              <ul className="space-y-4">
                {pendingRequests.map((request) => (
                  <li key={request.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold">Request #{request.id}</p>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-sm text-slate-600">{request.reason}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Categories: {request.requestedCategories.join(", ")} | Duration: {request.requestedDurationHours}h
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="destructive">
                        Deny
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Summaries</CardTitle>
          <CardDescription>Patient-friendly summaries with accessible audio playback.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {summaries.map((summary) => (
              <li key={summary.id} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm font-semibold capitalize">{summary.type.replace("_", " ")}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{summary.content}</p>
                <p className="mt-2 text-xs text-slate-500">{summary.disclaimer}</p>
                <div className="mt-3">
                  {summary.audioUrl ? (
                    <audio controls preload="none" className="w-full">
                      <source src={summary.audioUrl} type="audio/mpeg" />
                    </audio>
                  ) : (
                    <Button variant="secondary" size="sm">
                      Generate Audio
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
