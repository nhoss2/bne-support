import { useMemo, useState, useEffect, useCallback } from "react";
import {
  GoogleMap,
  useLoadScript,
  MarkerF,
  InfoWindow,
} from "@react-google-maps/api";
import type { EventData } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";
import { formatTime } from "@/lib/utils";

interface MapViewProps {
  services: EventData[];
  selectedServiceId: string | null;
  onMarkerSelect: (serviceId: string | null) => void;
}

export function MapView({
  services,
  selectedServiceId,
  onMarkerSelect,
}: MapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [activeMarker, setActiveMarker] = useState<string | null>(null);

  // Update marker when selection changes from outside
  useEffect(() => {
    setActiveMarker(selectedServiceId);
  }, [selectedServiceId]);

  const handleMarkerClick = useCallback(
    (serviceName: string) => {
      setActiveMarker(serviceName);
      onMarkerSelect(serviceName);
    },
    [onMarkerSelect]
  );

  // Brisbane CBD coordinates
  const center = useMemo(() => ({ lat: -27.4698, lng: 153.0251 }), []);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: true,
      clickableIcons: false,
      scrollwheel: true,
    }),
    []
  );

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
    <GoogleMap
      options={mapOptions}
      zoom={13}
      center={center}
      mapContainerClassName="h-full w-full"
      onClick={() => {
        setActiveMarker(null);
        onMarkerSelect(null);
      }}
    >
      {services.map(
        (service, index) =>
          service.location.coordinates && (
            <MarkerF
              key={index}
              position={service.location.coordinates}
              title={service.name}
              onClick={() => handleMarkerClick(service.name)}
            >
              {activeMarker === service.name && (
                <InfoWindow
                  onCloseClick={() => {
                    setActiveMarker(null);
                    onMarkerSelect(null);
                  }}
                >
                  <div className="min-w-[200px] p-3">
                    <h3 className="font-semibold text-base mb-2">
                      {service.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <time>
                          {formatTime(service.schedule.time.start)} -{" "}
                          {formatTime(service.schedule.time.end)}
                        </time>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </MarkerF>
          )
      )}
    </GoogleMap>
  );
}
