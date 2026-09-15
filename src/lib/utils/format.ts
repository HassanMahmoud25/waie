/**
 * Arabic-first formatting helpers shared across the content layer and UI.
 * Kept framework-free so they can be unit tested and reused from Server
 * and Client Components alike.
 */

/** Formats a duration given in seconds as a short Arabic string, e.g. "1 س 14 د" or "56 د". */
export function formatDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.round((safeSeconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} س ${minutes} د` : `${hours} س`;
  }

  return `${minutes} د`;
}

/** Formats a duration as HH:MM:SS or MM:SS for timestamps (transcript, recommendations, player). */
export function formatTimestamp(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;
  const pad = (value: number) => value.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

/** Formats a date as an Arabic month name with Western (Latin) digits, e.g. "19 يونيو 2026". */
export function formatArabicDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** Formats a relative-ish short date for compact metadata rows. */
export function formatShortArabicDate(date: Date): string {
  return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** ISO 8601 duration for structured data (VideoObject.duration), e.g. "PT1H14M". */
export function toIso8601Duration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  let result = "PT";
  if (hours > 0) result += `${hours}H`;
  if (minutes > 0) result += `${minutes}M`;
  if (seconds > 0 || (hours === 0 && minutes === 0)) result += `${seconds}S`;
  return result;
}
