"use client";

/**
 * Reusable icon-only refresh trigger for catalog/dashboard/list toolbars.
 */
export default function RefreshButton({
  onClick,
  isLoading = false,
  label = "Segarkan data",
  variant = "app",
  className = "",
}) {
  const variantClass =
    variant === "public"
      ? "bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]"
      : "bg-[#FFFFFF] text-[#0F172A] border border-[#CBD5E1] hover:bg-[#EEF2F7] hover:text-[#1D4ED8]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors cursor-pointer disabled:opacity-60 touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${variantClass} ${className}`}
    >
      <svg
        className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.9}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
      </svg>
    </button>
  );
}
