import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface ChatLoadErrorStateProps {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}

export function ChatLoadErrorState({
  message,
  onRetry,
  disabled = false,
}: ChatLoadErrorStateProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-start justify-center bg-destructive/6 text-left">
      <p className="text-sm font-semibold text-foreground">
        The parrot went off course
      </p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={disabled}
        className="mt-4 cursor-pointer"
      >
        <IconRefresh size={14} className="mr-1.5" />
        Retry
      </Button>
    </div>
  );
}
