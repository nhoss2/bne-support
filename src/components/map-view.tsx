import { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import type { EventData } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface MapViewProps {
  services: EventData[];
}

export function MapView({ services }: MapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

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
    >
      {services.map(
        (service, index) =>
          service.location.coordinates && (
            <MarkerF
              key={index}
              position={service.location.coordinates}
              title={service.name}
            />
          )
      )}
    </GoogleMap>
  );
}
