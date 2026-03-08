import Link from "next/link";

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@healthconnect/ui";

const capabilities = [
  "Patient/guardian consent workflows",
  "Scope-limited doctor record access",
  "Time-bound grants with automatic expiry",
  "Full audit trail and admin visibility",
  "Backboard AI summaries + ElevenLabs audio"
];

export default function LandingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-100 bg-white/90 p-8 shadow-sm">
        <Badge variant="default" className="mb-4">
          Canadian Healthcare Consent Layer
        </Badge>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight [font-family:var(--font-heading)]">
          HealthConnect secures patient-controlled healthcare data access across fragmented systems.
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-slate-600">
          Doctors request only what they need. Patients or guardians approve explicitly. Every access event is
          scoped, time-bound, and auditable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/doctor">
            <Button>Open Doctor Dashboard</Button>
          </Link>
          <Link href="/patient">
            <Button variant="outline">Open Patient Dashboard</Button>
          </Link>
        </div>
      </section>

      <section className="data-grid">
        {capabilities.map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle className="text-base">{item}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                MVP scaffolding built for hackathon speed while preserving service boundaries for production growth.
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
