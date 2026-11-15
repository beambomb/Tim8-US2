import Link from "next/link";

/**
 * Shared portal page header row: plain <h1> title, optional back link & subtitle,
 * and right-aligned action buttons separated by a 1px hairline.
 */
export default function PortalPageHeader({
  title,
  subtitle,
  actions = null,
  backHref = null,
  backLabel = "Kembali",
  bordered = true,
  className = "",
}) {
  return (
    <header
      className={`flex flex-col gap-2 ${
        bordered ? "pb-4 border-b border-[#E2E8F0]" : ""
      } ${className}`}
    >
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#475569] hover:text-[var(--accent)] transition-colors w-fit"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          <span>{backLabel}</span>
        </Link>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[#475569]">{subtitle}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
