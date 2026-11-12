/**
 * Utility helper functions for CariKos frontend
 */

/**
 * Format number into Indonesian Rupiah currency string
 * Example: 1500000 -> "Rp 1.500.000"
 */
export function formatRupiah(amount) {
  if (typeof amount !== "number") {
    amount = Number(amount) || 0;
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format ISO date string into Indonesian readable format
 * Example: "2026-11-12T00:00:00.000Z" -> "12 November 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Format time from ISO date string
 * Example: "14:30"
 */
export function formatTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Class name concatenator helper (simple lightweight alternative to clsx)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
