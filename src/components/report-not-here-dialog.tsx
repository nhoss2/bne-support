import React, { useState } from "react";
import type { EventData } from "@/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flag } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ReportNotHereDialogProps {
  service: EventData;
  triggerElement?: React.ReactNode;
}

export function ReportNotHereDialog({
  service,
  triggerElement,
}: ReportNotHereDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    console.log("Report Not Here", {
      serviceId: service.id,
      serviceName: service.name,
      comment,
    });
    // TODO: Send email notification to admins
    setDialogOpen(false);
    setComment("");
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {triggerElement ?? (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Flag className="mr-2 h-4 w-4" />
            Report Not Here
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Service Not Here</DialogTitle>
          <DialogDescription>
            Let us know if this service wasn&apos;t present at the scheduled
            time. Your feedback helps keep the information accurate.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Optional comment (e.g., closed, moved, etc.)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setDialogOpen(false);
              setComment("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
