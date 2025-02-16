import { parse } from "papaparse";
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

interface RawServiceData {
  name: string;
  type: string;
  address: string;
  area: string;
  days: string;
  start_time: string;
  end_time: string;
  exclusions: string;
  services: string;
  requirements: string;
  phone: string;
  notes: string;
}

export function parseServicesCSV(csvContent: string): EventData[] {
  const { data } = parse<RawServiceData>(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  return data.map((row): EventData => {
    const services = row.services.split(",").map((s: string) => s.trim());
    const exclusions = row.exclusions
      ? row.exclusions.split(",").map((e: string) => e.trim())
      : undefined;

    return {
      name: row.name,
      type: row.type as ServiceType,
      location: {
        address: row.address,
        area: row.area,
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
