/**
 * Returns a date string in YYYY-MM-DD format representing the local date of the given Date object.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Normalizes any ISO date string (UTC or local) to a local YYYY-MM-DD string.
 * If the input is already a simple date (YYYY-MM-DD), it returns it directly to avoid timezone shift.
 */
export function toLocalDateString(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  // If it's already a simple date (YYYY-MM-DD), return it directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return dateStr.split('T')[0];
    }
    return getLocalDateString(date);
  } catch {
    return dateStr.split('T')[0];
  }
}
