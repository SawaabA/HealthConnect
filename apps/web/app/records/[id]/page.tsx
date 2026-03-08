import { notFound } from "next/navigation";

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthconnect/ui";

import { formatDateTime } from "../../../lib/format";
import { getPatientRecords } from "../../../lib/api";

export default async function RecordViewerPage({ params }: { params: { id: string } }) {
  const recordId = Number(params.id);
  const records = await getPatientRecords(1);
  const record = records.find((item) => item.id === recordId);

  if (!record) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold [font-family:var(--font-heading)]">Record Viewer</h1>
      <Card>
        <CardHeader>
          <CardTitle>{record.title}</CardTitle>
          <CardDescription>Scope-limited record view rendered through HealthConnect consent controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>{record.category}</Badge>
            <Badge variant="muted">{record.mimeType}</Badge>
          </div>
          <p className="text-sm">
            <span className="font-semibold">Source provider:</span> {record.sourceProvider}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Uploaded:</span> {formatDateTime(record.uploadedAt)}
          </p>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-sm text-slate-600">
              Placeholder secure document viewer. In production, load encrypted file content from Vultr Object Storage
              using short-lived signed access.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
