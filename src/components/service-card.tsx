import type { EventData } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ServiceCardProps {
  service: EventData;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-bold leading-none tracking-tight">
          {service.name}
        </h3>
        <time className="text-sm text-muted-foreground">
          {service.schedule.time.start} - {service.schedule.time.end}
        </time>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          <address className="text-sm not-italic">
            <span className="text-muted-foreground">
              {service.location.address}
              {service.location.address && ", "}
              <span className="font-medium text-foreground">
                {service.location.suburb}
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
  );
}
