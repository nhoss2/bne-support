import { Button } from "@/components/ui/button";
import { DAYS } from "@/lib/constants";

interface DayPickerProps {
  selectedDay: string;
  onDaySelect: (day: string) => void;
}

export function DayPicker({ selectedDay, onDaySelect }: DayPickerProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {DAYS.map((day) => (
        <Button
          key={day.full}
          onClick={() => onDaySelect(day.full)}
          variant={selectedDay === day.full ? "default" : "secondary"}
          className="w-full text-sm shadow-none px-1 @[600px]:text-base"
        >
          <span className="block @[600px]:hidden">{day.short}</span>
          <span className="hidden @[600px]:block">{day.full}</span>
        </Button>
      ))}
    </div>
  );
}
