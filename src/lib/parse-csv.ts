import Papa from "papaparse";
import type { EventData, ServiceType, RecurrenceRule } from "../types";
import { getSheetCsv } from "./load-sheets";

function parseTime(timeStr: string): string {
  if (!timeStr) return "";
  return timeStr.trim();
}

function parseRecurrencePattern(days: string): RecurrenceRule {
  const daysArray = days.split(",").map((day) => day.trim());

  // Check for special patterns
  if (days.includes("First Sunday")) {
    return {
      pattern: "MONTHLY",
      weekOfMonth: 1,
      daysOfWeek: ["Sunday"],
    };
  }

  if (days.toLowerCase().includes("fortnightly")) {
    return {
      pattern: "FORTNIGHTLY",
      daysOfWeek: daysArray,
    };
  }

  // Default to weekly pattern
  return {
    pattern: "WEEKLY",
    daysOfWeek: daysArray,
  };
}

export interface RawServiceData {
  name: string;
  type: string;
  address: string;
  suburb: string;
  days: string;
  start_time: string;
  end_time: string;
  exclusions: string;
  services: string;
  requirements: string;
  phone: string;
  notes: string;
  latitude?: string;
  longitude?: string;
}

export function parseServicesCSV(csvContent: string): EventData[] {
  const { data } = Papa.parse<RawServiceData>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row, index): EventData => {
    const services = row.services.split(",").map((s: string) => s.trim());
    const exclusions = row.exclusions
      ? row.exclusions.split(",").map((e: string) => e.trim())
      : undefined;

    const coordinates =
      row.latitude && row.longitude
        ? {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
          }
        : undefined;

    // Support multiple categories per service
    const types = row.type.split(",").map((t) => t.trim() as ServiceType);

    const parsed = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${index}`,
      name: row.name,
      types,
      location: {
        address: row.address,
        suburb: row.suburb,
        coordinates,
      },
      schedule: {
        recurrence: parseRecurrencePattern(row.days),
        time: {
          start: parseTime(row.start_time),
          end: parseTime(row.end_time),
        },
        exclusions: exclusions?.length ? exclusions : undefined,
      },
      services,
      requirements: row.requirements || undefined,
      phone: row.phone || undefined,
      notes: row.notes || undefined,
    };

    return parsed;
  });
}

export async function getServicesData(): Promise<EventData[]> {
  try {
    const csvContent = await getSheetCsv();
    return parseServicesCSV(csvContent);
  } catch (error) {
    console.error("Failed to fetch or parse services data:", error);
    throw error;
  }
}
