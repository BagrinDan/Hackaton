import { Button } from "@/components/ui/button";
import { ParrotAvatar } from "@/features/parrot/components/parrot-avatar";
import { getInitials } from "@/lib/guest";
import { cn } from "@/lib/utils";
import type { GuestProfile } from "@/types/guest";
import type { ChatHistoryMessage } from "@/features/parrot/types";

interface ChatMessageProps {
  message: ChatHistoryMessage;
  guest: GuestProfile | null;
}

export function ChatMessage({ message, guest }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      data-testid="chat-message"
      data-role={message.role}
      className={cn(
        "group/message flex gap-3",
        isAssistant ? "justify-start" : "justify-end"
      )}
    >
      {isAssistant && <ParrotAvatar />}

      <div
        className={cn(
          "flex max-w-[82%] flex-col gap-1",
          isAssistant ? "items-start" : "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-xs transition-colors",
            isAssistant
              ? "bg-accent/60 text-foreground ring-1 ring-border/70"
              : "bg-(--zone-accent) text-white"
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            "flex items-center gap-2 px-1 text-[11px] text-muted-foreground opacity-0 transition-opacity duration-150 group-focus-within/message:opacity-100 group-hover/message:opacity-100",
            isAssistant ? "justify-start" : "justify-end"
          )}
        >
          {isAssistant ? <span>Island Parrot</span> : null}
          {!isAssistant && guest ? <span>{getInitials(guest)}</span> : null}
        </div>
      </div>
    </div>
  );
}

interface ChatThinkingMessageProps {
  guest: GuestProfile | null;
}

export function ChatThinkingMessage({ guest }: ChatThinkingMessageProps) {
  return (
    <div className="flex gap-3">
      <ParrotAvatar />

      <div className="flex max-w-[82%] flex-col items-start gap-1">
        <div className="rounded-2xl bg-accent/60 px-4 py-3 text-sm text-foreground shadow-xs ring-1 ring-border/70">
          <span className="text-muted-foreground">The parrot is thinking</span>
        </div>
        <div className="px-1 text-[11px] text-muted-foreground opacity-0 transition-opacity group-hover/message:opacity-100">
          {guest ? "Island Parrot" : "Assistant"}
        </div>
      </div>
    </div>
  );
}

interface ChatErrorMessageProps {
  message: string;
  onRetry: () => void;
  disabled?: boolean;
}

export function ChatErrorMessage({
  message,
  onRetry,
  disabled = false,
}: ChatErrorMessageProps) {
  return (
    <div className="flex gap-3">
      <ParrotAvatar variant="error" />

      <div className="flex max-w-[82%] flex-col items-start gap-2">
        <div className="rounded-2xl border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm text-foreground shadow-xs">
          {message}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={disabled}
        >
          Retry
        </Button>
      </div>
    </div>
  );
}
