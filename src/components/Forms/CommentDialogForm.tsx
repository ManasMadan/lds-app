import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { REJECTION_REASONS } from "@/constants/qc_rejection_reasons";

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
  const [selectedComment, setSelectedComment] = useState("");

  const handleConfirm = () => {
    onConfirm(selectedComment);
    setSelectedComment("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action === "APPROVED" ? "Approve" : "Reject"} Questions
          </DialogTitle>
        </DialogHeader>
        {/* Replace Textarea with a select dropdown */}
        <select
          value={selectedComment}
          onChange={(e) => setSelectedComment(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="" disabled>
            Select an option
          </option>
          {REJECTION_REASONS.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
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
