import * as React from "react";

import { cn } from "../lib/cn";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg";

const baseClass =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-sky-600 text-white hover:bg-sky-500 focus-visible:ring-sky-500",
  secondary: "bg-slate-200 text-slate-900 hover:bg-slate-300 focus-visible:ring-slate-400",
  outline: "border border-slate-300 bg-white hover:bg-slate-100 focus-visible:ring-slate-400",
  ghost: "hover:bg-slate-100 focus-visible:ring-slate-400",
  destructive: "bg-rose-600 text-white hover:bg-rose-500 focus-visible:ring-rose-500"
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3",
  lg: "h-11 rounded-md px-8"
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(baseClass, variantClasses[variant], sizeClasses[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
