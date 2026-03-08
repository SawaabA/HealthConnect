import * as React from "react";

import { cn } from "../lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

const baseClass = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold";
const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-sky-100 text-sky-800",
  success: "border-transparent bg-emerald-100 text-emerald-800",
  warning: "border-transparent bg-amber-100 text-amber-900",
  danger: "border-transparent bg-rose-100 text-rose-900",
  muted: "border-slate-300 bg-slate-100 text-slate-700"
};

export interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children?: React.ReactNode;
}

export function Badge({ className, variant = "default", children }: BadgeProps) {
  return <div className={cn(baseClass, variantClasses[variant], className)}>{children}</div>;
}
