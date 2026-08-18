const NE_DIGITS: Record<string, string> = {
  "0": "०", "1": "१", "2": "२", "3": "३", "4": "४",
  "5": "५", "6": "६", "7": "७", "8": "८", "9": "९",
};

export function toNepaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => NE_DIGITS[d]);
}

// Relative time in Nepali, e.g. "१५ मिनेट अगाडि", "३ घण्टा अगाडि", "२ दिन अगाडि"
export function timeAgoNe(iso: string | null): string {
  if (!iso) return "";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "भर्खरै";
  if (minutes < 60) return `${toNepaliDigits(minutes)} मिनेट अगाडि`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toNepaliDigits(hours)} घण्टा अगाडि`;

  const days = Math.floor(hours / 24);
  return `${toNepaliDigits(days)} दिन अगाडि`;
}
