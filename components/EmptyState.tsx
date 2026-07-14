import type { ReactNode } from "react";

/**
 * Craft pass · calm, branded empty state.
 * The point: a blank module should read as "ready and waiting" — not broken.
 * Editorial serif headline + one clear next action.
 */
export function EmptyState({
  icon,
  title,
  body,
  action,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-16 text-center">
      <div className="mx-auto max-w-[440px]">
        {icon && <div className="mb-5 flex justify-center text-accent/70">{icon}</div>}
        <h2 className="display text-[26px] leading-[1.15] text-navy">{title}</h2>
        {body && <p className="mt-3 text-[14px] leading-relaxed text-text-dim">{body}</p>}
        {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
        {hint && <p className="mt-4 text-[12px] text-muted">{hint}</p>}
      </div>
    </div>
  );
}
