import type { EventData } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportNotHereDialog } from "@/components/report-not-here-dialog";
import { Clock, MapPin, Phone, Info, CalendarX, Flag } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useState } from "react";

interface ServiceCardProps {
  service: EventData;
  isSelected?: boolean;
  onSelect?: () => void;
  onShowMap: () => void;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
  onShowMap,
}: ServiceCardProps) {
  const isMobile = useIsMobile();

  const [reportClicked, setReportClicked] = useState(false);

  const handleCardClick = () => {
    if (reportClicked) {
      setReportClicked(false);
      return;
    }
    onSelect?.();
    if (isMobile) {
      onShowMap();
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={cn("cursor-pointer", isSelected && "ring-2 ring-primary")}
    >
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold leading-tight tracking-tight">
          {service.name}
        </h3>
        <div className="flex items-center gap-2 text-base text-muted-foreground">
          <Clock className="h-4 w-4" />
          <time>
            {formatTime(service.schedule.time.start)} -{" "}
            {formatTime(service.schedule.time.end)}
          </time>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2 not-italic w-full text-left p-2 mb-1 -m-2 rounded-md">
            <MapPin className="h-4 w-4 mt-1 shrink-0 text-blue-600" />
            <span className="text-base text-blue-600 underline">
              {service.location.address}
              {service.location.address && ", "}
              <span className="font-medium">{service.location.suburb}</span>
            </span>
          </div>

          {service.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a
                href={`tel:${service.phone}`}
                className="text-base text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {service.phone}
              </a>
            </div>
          )}

          {service.services.length > 0 && (
            <div className="bg-secondary rounded-md p-3">
              <p className="text-base leading-relaxed">
                {service.services.join(", ")}
              </p>
            </div>
          )}

          {service.notes && (
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
              <p className="text-base text-muted-foreground leading-normal">
                {service.notes}
              </p>
            </div>
          )}

          {service.schedule.exclusions &&
            service.schedule.exclusions.length > 0 && (
              <div className="flex items-start gap-2">
                <CalendarX className="h-4 w-4 mt-1 shrink-0 text-yellow-600" />
                <p className="text-base text-yellow-600 leading-normal">
                  Excluded: {service.schedule.exclusions.join(", ")}
                </p>
              </div>
            )}
          {/* Report not here */}
          <div>
            <ReportNotHereDialog
              service={service}
              triggerElement={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReportClicked(true);
                  }}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  Report Not Here
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
