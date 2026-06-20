import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";

interface ActivityActionProps {
  isBooked: boolean;
  isReplacing: boolean;
  isFull: boolean;
  isBooking: boolean;
  isCancelling: boolean;
  onBook: () => void;
  onCancel: () => void;
}

export function ActivityAction({
  isBooked,
  isReplacing,
  isFull,
  isBooking,
  isCancelling,
  onBook,
  onCancel,
}: ActivityActionProps) {
  const isMutating = isBooking || isCancelling;

  if (isBooked) {
    return (
      <Button
        size="sm"
        variant="outline"
        data-testid="activity-cancel"
        disabled={isMutating}
        onClick={onCancel}
        className="shrink-0"
      >
        {isCancelling ? (
          <IconLoader2 size={13} className="animate-spin" />
        ) : (
          "Cancel"
        )}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      data-testid="activity-book"
      disabled={isFull || isMutating}
      onClick={onBook}
      className="shrink-0"
    >
      {isBooking ? (
        <IconLoader2 size={13} className="animate-spin" />
      ) : isReplacing ? (
        "Switch booking"
      ) : (
        "Book"
      )}
    </Button>
  );
}
