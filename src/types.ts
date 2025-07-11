export type ServiceType = "FOOD" | "MIXED" | "SUPPORT" | "MEDICAL";

export type RecurrencePattern =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "FORTNIGHTLY"
  | "CUSTOM";

export interface EventTime {
  start: string;
  end: string;
}

export interface RecurrenceRule {
  pattern: RecurrencePattern;
  // For weekly events
  daysOfWeek?: string[];
  // For monthly events
  weekOfMonth?: number;
  dayOfMonth?: number;
  // For custom patterns
  description?: string;
}

export interface EventData {
  /** A unique identifier generated when the CSV is parsed */
  id: string;
  name: string;
  types: ServiceType[];
  location: {
    address: string;
    suburb: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  schedule: {
    recurrence: RecurrenceRule;
    time: EventTime;
    exclusions?: string[];
    // For events with multiple locations/times
    additionalTimes?: Array<{
      location?: string;
      time: EventTime;
    }>;
  };
  services: string[];
  requirements?: string;
  phone?: string;
  notes?: string;
}
