import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DateTime } from "luxon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(time: string): string {
  if (!time) return "";

  try {
    // Parse time string (e.g. "14:00" or "2:00")
    const dt = DateTime.fromFormat(time, "H:mm");
    if (!dt.isValid) return time;

    return dt.toFormat("h:mm a"); // Will format as "2:00 PM"
  } catch {
    return time;
  }
}
