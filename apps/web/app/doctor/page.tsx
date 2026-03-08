import Link from "next/link";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthconnect/ui";

import { StatusBadge } from "../../components/status-badge";
import { formatDateTime } from "../../lib/format";
import { getDoctorRequests, getPatientRecords, getPatientSummaries } from "../../lib/api";

const categories = [
  "allergies",
  "medications",
  "labs",
  "imaging_reports",
  "referral_notes",
  "emergency_summary"
];

export default async function DoctorDashboardPage() {
  const [requests, records, summaries] = await Promise.all([getDoctorRequests(), getPatientRecords(1), getPatientSummaries(1)]);
  const approved = requests.filter((request) => request.status === "approved");
  const briefing = summaries.find((summary) => summary.type === "doctor_brief");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Doctor Dashboard</h1>

      <div className="data-grid">
        <Card>
          <CardHeader>
            <CardTitle>Request Access</CardTitle>
            <CardDescription>Specify category scope, reason, and duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3">
              <label className="block text-sm font-medium">
                Patient ID
                <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" defaultValue="1" />
              </label>
              <fieldset>
                <legend className="text-sm font-medium">Categories</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked={category !== "emergency_summary"} />
                      <span className="capitalize">{category.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-medium">
                Reason
                <textarea
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  rows={3}
                  defaultValue="Medication review and pre-visit risk assessment."
                />
              </label>
              <label className="block text-sm font-medium">
                Duration (hours)
                <input type="number" defaultValue={48} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" />
              </label>
              <Button type="button">Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Track pending, approved, denied, expired, and revoked states.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>#{request.id}</TableCell>
                    <TableCell>{request.requestedCategories.join(", ")}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(request.requestedAt)}</TableCell>
                    <TableCell>
                      <Link href={`/access-requests/${request.id}`} className="text-sky-700 underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="data-grid">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Approved Record Access</CardTitle>
            <CardDescription>Only categories from active grants are visible.</CardDescription>
          </CardHeader>
          <CardContent>
            {approved.length === 0 ? (
              <p className="text-sm text-slate-500">No approved grants yet.</p>
            ) : (
              <ul className="space-y-2">
                {records.map((record) => (
                  <li key={record.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                    <div>
                      <p className="font-medium">{record.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{record.category.replace("_", " ")}</p>
                    </div>
                    <Link href={`/records/${record.id}`} className="text-sm text-sky-700 underline">
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Pre-Visit Brief</CardTitle>
            <CardDescription>Generated by Backboard orchestration agent.</CardDescription>
          </CardHeader>
          <CardContent>
            {briefing ? (
              <>
                <Badge className="mb-2">Doctor Brief</Badge>
                <p className="text-sm whitespace-pre-line text-slate-700">{briefing.content}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500">Brief pending.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
