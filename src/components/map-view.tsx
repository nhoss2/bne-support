import { useMemo, useState, useEffect } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";
import type { EventData, ServiceType } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Clock,
  Crosshair,
  Info,
  AlertCircle,
  MapPin,
  Flag,
} from "lucide-react";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReportNotHereDialog } from "@/components/report-not-here-dialog";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { DayPicker } from "@/components/day-picker";
import { ServiceTypePicker } from "@/components/service-type-picker";

interface MapViewProps {
  services: EventData[];
  selectedServiceId: string | null;
  onMarkerSelect: (serviceId: string | null) => void;
  selectedDay?: string;
  onDaySelect?: (day: string) => void;
  selectedServiceType?: ServiceType;
  onServiceTypeSelect?: (type: ServiceType) => void;
}

export function MapView({
  services,
  selectedServiceId,
  onMarkerSelect,
  selectedDay,
  onDaySelect,
  selectedServiceType,
  onServiceTypeSelect,
}: MapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const selectedService = services.find(
    (service) => service.id === selectedServiceId
  );

  // Brisbane CBD coordinates
  const defaultCenter = useMemo(() => ({ lat: -27.4698, lng: 153.0251 }), []);

  // Center map on selected service when it changes
  useEffect(() => {
    if (map && selectedService?.location.coordinates) {
      const center = selectedService.location.coordinates;
      map.panTo({
        lat: center.lat - 0.003, // Offset to account for InfoWindow
        lng: center.lng,
      });
    }
  }, [selectedServiceId, map, selectedService]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      scrollwheel: true,
      gestureHandling: "greedy",
      minZoom: 11,
      maxZoom: 18,
    }),
    []
  );

  const [userLocation, setUserLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const isMobile = useIsMobile();

  const handleLocationRequest = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setLocationError(null);

        // Pan map to user location
        if (map) {
          map.panTo(location);
          map.setZoom(15);
        }
      },
      (error) => {
        setLocationError("Unable to get your location");
        console.error("Geolocation error:", error);
      }
    );
  };

  if (loadError) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading Google Maps. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading map...
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      {isMobile && selectedDay && onDaySelect && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background py-2 px-4 border-b space-y-2">
          <DayPicker selectedDay={selectedDay} onDaySelect={onDaySelect} />
          {selectedServiceType && onServiceTypeSelect && (
            <ServiceTypePicker
              selectedServiceType={selectedServiceType}
              onServiceTypeSelect={onServiceTypeSelect}
            />
          )}
        </div>
      )}

      <GoogleMap
        options={mapOptions}
        zoom={15}
        center={defaultCenter}
        mapContainerClassName={cn(
          "h-full w-full",
          isMobile && selectedDay && selectedServiceType && "pt-[120px]",
          isMobile && selectedDay && !selectedServiceType && "pt-[68px]"
        )}
        onClick={() => onMarkerSelect(null)}
        onLoad={setMap}
      >
        {services.map(
          (service) =>
            service.location.coordinates && (
              <MarkerF
                key={service.id}
                position={service.location.coordinates}
                onClick={() => onMarkerSelect(service.id)}
              >
                {selectedServiceId === service.id && (
                  <InfoWindow
                    onCloseClick={() => {
                      onMarkerSelect(null);
                    }}
                    options={{
                      headerContent: (() => {
                        const div = document.createElement("div");
                        div.style.fontWeight = "bold";
                        div.textContent = service.name;
                        return div;
                      })(),
                    }}
                  >
                    <div className="min-w-[200px] max-w-[300px]">
                      <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                          <Clock className="h-4 w-4 shrink-0" />
                          <time className="text-muted-foreground">
                            {formatTime(service.schedule.time.start)} -{" "}
                            {formatTime(service.schedule.time.end)}
                          </time>
                        </div>
                        {service.services.length > 0 && (
                          <div className="flex gap-2">
                            <Info className="h-4 w-4 shrink-0" />
                            <p className="text-muted-foreground">
                              {service.services.join(", ")}
                            </p>
                          </div>
                        )}
                        {service.notes && (
                          <div className="flex gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-muted-foreground">
                              {service.notes}
                            </p>
                          </div>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                            `${service.location.address}, ${service.location.suburb}, QLD`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline mt-2"
                        >
                          <MapPin className="h-4 w-4 shrink-0" />
                          Get Directions
                        </a>
                        <div className="mt-2">
                          <ReportNotHereDialog
                            service={service}
                            triggerElement={
                              <a
                                href="#"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                              >
                                <Flag className="h-4 w-4 shrink-0" />
                                Report Not Here
                              </a>
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </MarkerF>
            )
        )}

        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            title="Your location"
          />
        )}
      </GoogleMap>

      <Button
        variant="default"
        size="icon"
        className={cn(
          "absolute right-4 h-10 w-10 shadow-md",
          isMobile ? "bottom-20" : "bottom-4"
        )}
        onClick={handleLocationRequest}
      >
        <Crosshair className="h-4 w-4" />
      </Button>

      {locationError && (
        <Alert
          variant="destructive"
          className={cn(
            "absolute right-4 w-auto max-w-[300px]",
            isMobile ? "bottom-32" : "bottom-16"
          )}
        >
          <AlertDescription>{locationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
