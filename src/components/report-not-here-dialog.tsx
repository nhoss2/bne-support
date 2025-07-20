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
import { toast } from "sonner";

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

  const handleSubmit = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8787';
      const response = await fetch(`${apiUrl}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          serviceAddress: service.location.address,
          serviceLatitude: service.location.coordinates?.lat,
          serviceLongitude: service.location.coordinates?.lng,
          comment,
        }),
      });

      if (response.ok) {
        toast.success("Report submitted successfully", {
          description: "Thank you for helping us keep the information accurate!"
        });
      } else {
        toast.error("Failed to submit report", {
          description: "Please try again later"
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error("Failed to submit report", {
        description: "Please check your connection and try again"
      });
    }

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
