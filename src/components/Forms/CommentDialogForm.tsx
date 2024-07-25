import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type CommentDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  action: "APPROVED" | "REJECTED";
};

export function CommentDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
}: CommentDialogProps) {
  const [comment, setComment] = useState("");

  const handleConfirm = () => {
    onConfirm(comment);
    setComment("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "APPROVED" ? "Approve" : "Reject"} Questions
          </DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Enter your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant={action === "APPROVED" ? "default" : "destructive"}
          >
            Confirm {action === "APPROVED" ? "Approval" : "Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
