import { useEffect, useState } from "react";
import type { EventData, ServiceType } from "./types";
import { getServicesData } from "./lib/parse-csv";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function App() {
  const [services, setServices] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay()]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getServicesData();
        setServices(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load services"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredServices = services.filter((service) =>
    service.schedule.recurrence.daysOfWeek?.includes(selectedDay)
  );

  const groupedServices = filteredServices.reduce((acc, service) => {
    const type = service.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(service);
    return acc;
  }, {} as Record<ServiceType, EventData[]>);

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );

  if (error) return <div className="p-4 text-destructive">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Brisbane Support Services
        </h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </header>

      <main className="space-y-8">
        {Object.entries(groupedServices).map(([type, services]) => (
          <section key={type}>
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              {type}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <h3 className="text-lg font-bold leading-none tracking-tight">
                      {service.name}
                    </h3>
                    <time className="text-sm text-muted-foreground">
                      {service.schedule.time.start} -{" "}
                      {service.schedule.time.end}
                    </time>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      <address className="text-sm not-italic">
                        <span className="text-muted-foreground">
                          {service.location.address}
                          {service.location.address && ", "}
                          <span className="font-medium text-foreground">
                            {service.location.area}
                          </span>
                        </span>
                      </address>
                      {service.services.length > 0 && (
                        <p className="text-sm leading-relaxed">
                          {service.services.join(", ")}
                        </p>
                      )}
                      {service.notes && (
                        <p className="text-sm text-muted-foreground italic leading-normal">
                          {service.notes}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

export default App;
