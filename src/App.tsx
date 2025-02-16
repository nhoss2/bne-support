import { useEffect, useState, useCallback } from "react";
import type { EventData, ServiceType } from "./types";
import { getServicesData } from "./lib/parse-csv";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service-card";
import { DateTime } from "luxon";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { MapView } from "@/components/map-view";
import { DayPicker } from "@/components/day-picker";
import { DAYS } from "@/lib/constants";
import { useMediaQuery } from "@/hooks/use-media-query";

function App() {
  const today = DateTime.now().weekday - 1;

  const [services, setServices] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[today].full);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const handleServiceSelect = useCallback((serviceId: string | null) => {
    setSelectedServiceId(serviceId);
  }, []);

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
    <div className="h-[100dvh] overflow-hidden">
      <ResizablePanelGroup
        direction={isDesktop ? "horizontal" : "vertical"}
        className="h-full"
      >
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <header className="mb-8">
                <h1 className="scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                  Brisbane Support Services
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Find free food, support and medical services in Brisbane
                </p>
                <DayPicker
                  selectedDay={selectedDay}
                  onDaySelect={setSelectedDay}
                />
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
                      <div className="grid gap-6 @[800px]:grid-cols-2">
                        {services.map((service, index) => (
                          <ServiceCard
                            key={index}
                            service={service}
                            isSelected={selectedServiceId === service.name}
                            onSelect={() => handleServiceSelect(service.name)}
                          />
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </main>

              <footer className="mt-12 py-4 px-4 text-sm text-white bg-black -mx-4">
                Made by{" "}
                <a href="https://www.nwcg.org.au/">
                  Northwest Community Group Inc
                </a>{" "}
                using Inner Brisbane Free Food Locations and Times Guide
              </footer>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle className="border border-gray-300" />

        <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
          <MapView
            services={filteredServices}
            selectedServiceId={selectedServiceId}
            onMarkerSelect={handleServiceSelect}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default App;
