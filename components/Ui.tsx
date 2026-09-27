"use client";

import React from "react";
import { cn } from "@/lib/cn";
import type { Toast } from "@/lib/store";
import { useDocStore } from "@/lib/store";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

export function Button({
  children,
  onClick,
  variant = "default",
  size = "md",
  disabled,
  ariaLabel,
  title,
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "icon";
  disabled?: boolean;
  ariaLabel?: string;
  title?: string;
  className?: string;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:pointer-events-none",
        size === "sm" && "h-7 px-2.5 text-xs",
        size === "md" && "h-9 px-3.5 text-sm",
        size === "icon" && "h-8 w-8",
        variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
        variant === "default" && "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white",
        variant === "outline" && "border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
        variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
        className
      )}
    >
      {children}
    </button>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
      {children}
    </p>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { value: T; label: React.ReactNode; title?: string }[];
  value: T;
  onChange: (v: T) => void;
  ariaLabel: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden text-xs">
      {options.map((o) => (
        <button
          key={String(o.value)}
          title={o.title}
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 px-2 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
            value === o.value
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Switch({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        "relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
        checked ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
          checked ? "left-[18px]" : "left-0.5"
        )}
      />
    </button>
  );
}

export function Toasts({ toasts }: { toasts: Toast[] }) {
  const dismiss = useDocStore((s) => s.dismissToast);
  return (
    <div aria-live="polite" className="no-print fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,360px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in flex items-start gap-2 rounded-lg border border-zinc-200 bg-white/95 backdrop-blur px-3 py-2.5 text-sm shadow-xl dark:border-zinc-700 dark:bg-zinc-900/95"
        >
          {t.kind === "error" ? (
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          ) : t.kind === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          ) : (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          )}
          <p className="flex-1">{t.message}</p>
          <button aria-label="Dismiss notification" onClick={() => dismiss(t.id)} className="rounded p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
