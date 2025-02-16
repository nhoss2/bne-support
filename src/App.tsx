import { useEffect, useState } from "react";
import type { EventData, ServiceType } from "./types";
import { getServicesData } from "./lib/parse-csv";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service-card";
import { DateTime } from "luxon";
import { Button } from "@/components/ui/button";

const DAYS = [
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
  { full: "Saturday", short: "Sat" },
  { full: "Sunday", short: "Sun" },
];

function App() {
  const today = DateTime.now().weekday - 1;

  const [services, setServices] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[today].full);

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

  const groupedServices = filteredServices.reduce(
    (acc, service) => {
      const type = service.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(service);
      return acc;
    },
    {} as Record<ServiceType, EventData[]>
  );

  if (loading)
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-[80px] w-[400px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );

  if (error) return <div className="p-4 text-destructive">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Brisbane Support Services
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Find free food, support and medical services in Brisbane
        </p>
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => (
            <Button
              key={day.full}
              onClick={() => setSelectedDay(day.full)}
              variant={selectedDay === day.full ? "default" : "secondary"}
              className="whitespace-nowrap text-sm sm:text-base shadow-none px-2.5 sm:px-4"
            >
              <span className="block md:hidden">{day.short}</span>
              <span className="hidden md:block">{day.full}</span>
            </Button>
          ))}
        </div>
      </header>

      <main className="space-y-12">
        {Object.entries(groupedServices).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              No services available on {selectedDay}
            </p>
          </div>
        ) : (
          Object.entries(groupedServices).map(([type, services]) => (
            <section key={type}>
              <h2 className="text-3xl font-semibold tracking-tight mb-6">
                {type.charAt(0) + type.slice(1).toLowerCase()} Services
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {services.map((service, index) => (
                  <ServiceCard key={index} service={service} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
