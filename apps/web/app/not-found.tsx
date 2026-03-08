import Link from "next/link";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@healthconnect/ui";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader>
        <CardTitle>Page Not Found</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600">The requested resource is missing or you no longer have access.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
