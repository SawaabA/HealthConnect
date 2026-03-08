import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@healthconnect/ui";

import { formatDateTime } from "../../lib/format";
import { getAuditLogs } from "../../lib/api";

export default async function AdminDashboardPage() {
  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Admin Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log Viewer</CardTitle>
          <CardDescription>
            Track who requested access, who approved, what was shared, and when data was viewed or expired.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Request</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{formatDateTime(log.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant="muted">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.actorUserId ?? "system"}</TableCell>
                  <TableCell>{log.accessRequestId ?? "-"}</TableCell>
                  <TableCell className="max-w-sm text-xs text-slate-600">{JSON.stringify(log.details)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
