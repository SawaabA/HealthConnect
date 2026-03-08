import * as React from "react";

import { cn } from "../lib/cn";

interface DivProps {
  className?: string;
  children?: React.ReactNode;
}

export function Card({ className, children }: DivProps) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur", className)}>{children}</div>;
}

export function CardHeader({ className, children }: DivProps) {
  return <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>{children}</div>;
}

export function CardTitle({ className, children }: DivProps) {
  return <h3 className={cn("text-lg font-semibold text-slate-900", className)}>{children}</h3>;
}

export function CardDescription({ className, children }: DivProps) {
  return <p className={cn("text-sm text-slate-600", className)}>{children}</p>;
}

export function CardContent({ className, children }: DivProps) {
  return <div className={cn("space-y-3", className)}>{children}</div>;
}
