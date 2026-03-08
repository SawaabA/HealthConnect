import type { RequestStatus } from "@healthconnect/types";
import { Badge } from "@healthconnect/ui";

const variantByStatus: Record<RequestStatus, "warning" | "success" | "danger" | "muted"> = {
  pending: "warning",
  approved: "success",
  denied: "danger",
  expired: "muted",
  revoked: "danger"
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return <Badge variant={variantByStatus[status]}>{status}</Badge>;
}
