import { useEffect, useState } from "react";
import type { EventData, ServiceType } from "./types";
import { getServicesData } from "./lib/parse-csv";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service-card";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
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
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          Brisbane Support Services
        </h1>
        <p className="text-xl text-muted-foreground mb-6">
          Find free food, support and medical services in Brisbane
        </p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-md whitespace-nowrap text-lg ${
                selectedDay === day
                  ? "bg-primary text-primary-foreground font-bold"
                  : "bg-secondary"
              }`}
            >
              {day}
            </button>
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
