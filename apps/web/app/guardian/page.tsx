import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthconnect/ui";

import { StatusBadge } from "../../components/status-badge";
import { formatDateTime } from "../../lib/format";
import { getPatientRequests } from "../../lib/api";

export default async function GuardianDashboardPage() {
  const requests = await getPatientRequests(1);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Guardian Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dependent Patients</CardTitle>
          <CardDescription>Guardian-managed approvals for linked patient accounts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200 p-4">
            <p className="font-semibold">Priya Patient (ID: 1)</p>
            <p className="text-sm text-slate-500">Consent decision authority: active</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approval Queue</CardTitle>
          <CardDescription>Approve or deny requests for dependent records.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell className="space-x-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="destructive">
                      Deny
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
