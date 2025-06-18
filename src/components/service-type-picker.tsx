import { Button } from "@/components/ui/button";
import type { ServiceType } from "@/types";

interface ServiceTypePickerProps {
  selectedServiceType: ServiceType;
  onServiceTypeSelect: (type: ServiceType) => void;
}

export function ServiceTypePicker({
  selectedServiceType,
  onServiceTypeSelect,
}: ServiceTypePickerProps) {
  const serviceTypes = [
    { type: "FOOD" as const, label: "Food" },
    { type: "SUPPORT" as const, label: "Support" },
    { type: "MEDICAL" as const, label: "Medical" },
  ];

  return (
    <div className="grid grid-cols-3 gap-1">
      {serviceTypes.map((serviceType) => (
        <Button
          key={serviceType.type}
          onClick={() => onServiceTypeSelect(serviceType.type)}
          variant={
            selectedServiceType === serviceType.type ? "default" : "secondary"
          }
          className="w-full text-sm shadow-none px-1 @[600px]:text-base"
        >
          {serviceType.label}
        </Button>
      ))}
    </div>
  );
}
