import { useEffect, useState, useCallback, memo } from "react";
import type { EventData, ServiceType } from "./types";
import { getServicesData } from "./lib/parse-csv";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceCard } from "@/components/service-card";
import { DateTime } from "luxon";
import { MapView } from "@/components/map-view";
import { DayPicker } from "@/components/day-picker";
import { DAYS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Map, List } from "lucide-react";
import { useIsMobile } from "@/hooks/use-is-mobile";

const ViewToggle = memo(function ViewToggle({
  showMap,
  onToggle,
}: {
  showMap: boolean;
  onToggle: (show: boolean) => void;
}) {
  return (
    <Button
      variant="default"
      className="h-16 fixed bottom-0 inset-x-0 transition-colors lg:hidden rounded-none hover:bg-black hover:opacity-100"
      onClick={() => onToggle(!showMap)}
    >
      {showMap ? (
        <>
          <List className="mr-2 h-5 w-5" />
          Show List
        </>
      ) : (
        <>
          <Map className="mr-2 h-5 w-5" />
          Show Map
        </>
      )}
    </Button>
  );
});

const ServiceList = memo(function ServiceList({
  groupedServices,
  selectedDay,
  selectedServiceId,
  onDaySelect,
  onServiceSelect,
  onShowMap,
}: {
  groupedServices: Record<ServiceType, EventData[]>;
  selectedDay: string;
  selectedServiceId: string | null;
  onDaySelect: (day: string) => void;
  onServiceSelect: (serviceId: string | null) => void;
  onShowMap: () => void;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="h-full overflow-y-auto">
      <div className="px-4 pt-4 pb-16 lg:pb-0 @container min-h-full">
        <header className="mb-4">
          <h1 className="scroll-m-20 text-3xl sm:text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
            Brisbane Support Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            Find free food, support and medical services in Brisbane
          </p>
        </header>

        <div className="sticky top-0 bg-background py-4 -mx-4 px-4 z-20 border-b">
          <DayPicker selectedDay={selectedDay} onDaySelect={onDaySelect} />
        </div>

        <main className="space-y-12 mt-4">
          {Object.entries(groupedServices).length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No services available on {selectedDay}
              </p>
            </div>
          ) : (
            Object.entries(groupedServices).map(([type, services]) => (
              <section key={type}>
                <div className="sticky top-[68px] bg-background py-4 -mx-4 px-4 z-10 border-b">
                  <h2 className="text-3xl font-semibold tracking-tight">
                    {type.charAt(0) + type.slice(1).toLowerCase()} Services
                  </h2>
                </div>
                <div className="grid gap-6 @[600px]:grid-cols-2 @[1000px]:grid-cols-3 mt-6">
                  {services.map((service, index) => (
                    <ServiceCard
                      key={index}
                      service={service}
                      isSelected={selectedServiceId === service.name}
                      onSelect={() => {
                        onServiceSelect(service.name);
                        if (isMobile) {
                          onShowMap();
                        }
                      }}
                      onShowMap={onShowMap}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        <footer className="mt-12 py-4 px-4 text-sm text-white bg-black -mx-4">
          Made by{" "}
          <a href="https://www.nwcg.org.au/">Northwest Community Group Inc</a>{" "}
          using Inner Brisbane Free Food Locations and Times Guide
        </footer>
      </div>
    </div>
  );
});

function App() {
  const today = DateTime.now().weekday - 1;

  const [services, setServices] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(DAYS[today].full);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [showMap, setShowMap] = useState(false);
  const isMobile = useIsMobile();

  const handleServiceSelect = useCallback(
    (serviceId: string | null) => {
      setSelectedServiceId(serviceId);
      if (!isMobile) {
        setShowMap(true);
      }
    },
    [isMobile]
  );

  const handleDaySelect = useCallback((day: string) => {
    setSelectedDay(day);
    setSelectedServiceId(null); // Clear the selected service when changing days
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

  const mapView = (
    <MapView
      services={filteredServices}
      selectedServiceId={selectedServiceId}
      onMarkerSelect={handleServiceSelect}
      selectedDay={selectedDay}
      onDaySelect={handleDaySelect}
    />
  );

  return (
    <div className="h-[100dvh] overflow-hidden relative">
      <div className="h-full grid lg:grid-cols-[60%_40%] overflow-hidden">
        <div
          className={`h-full lg:relative absolute inset-0 transition-transform duration-300 overflow-hidden ${
            showMap ? "translate-x-full lg:translate-x-0" : "translate-x-0"
          }`}
        >
          <ServiceList
            groupedServices={groupedServices}
            selectedDay={selectedDay}
            selectedServiceId={selectedServiceId}
            onDaySelect={handleDaySelect}
            onServiceSelect={handleServiceSelect}
            onShowMap={() => setShowMap(true)}
          />
        </div>
        <div
          className={`h-full lg:relative absolute inset-0 transition-transform duration-300 ${
            showMap ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {mapView}
        </div>
      </div>

      <ViewToggle showMap={showMap} onToggle={setShowMap} />
    </div>
  );
}

export default App;
