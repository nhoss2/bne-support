import type { EventData } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Clock, MapPin, Phone, Info } from "lucide-react";
import { formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: EventData;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ServiceCard({
  service,
  isSelected,
  onSelect,
}: ServiceCardProps) {
  return (
    <Card
      className={cn(
        "transition-colors cursor-pointer hover:bg-secondary/50",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={onSelect}
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
          <address className="flex items-start gap-2 not-italic">
            <MapPin className="h-4 w-4 mt-1 shrink-0 text-muted-foreground" />
            <span className="text-base">
              {service.location.address}
              {service.location.address && ", "}
              <span className="font-medium">{service.location.suburb}</span>
            </span>
          </address>

          {service.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
              <a
                href={`tel:${service.phone}`}
                className="text-base text-primary hover:underline"
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
        </div>
      </CardContent>
    </Card>
  );
}
