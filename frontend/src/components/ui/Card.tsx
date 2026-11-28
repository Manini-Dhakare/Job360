import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-slate-200/85 shadow-saas",
        hoverable && "transition-all duration-200 hover:border-indigo-200 hover:shadow-saas-lg hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

type BadgeVariant = "default" | "indigo" | "emerald" | "amber" | "rose" | "slate";

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  indigo: "bg-indigo-50 text-brand-indigo border-indigo-200/80",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  amber: "bg-amber-50 text-amber-800 border-amber-200/80",
  rose: "bg-rose-50 text-rose-700 border-rose-200/80",
  slate: "bg-slate-900 text-white border-slate-900",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        BADGE_CLASSES[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
