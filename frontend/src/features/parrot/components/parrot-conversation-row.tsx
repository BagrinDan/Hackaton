import { Badge } from "@/components/ui/badge";
import type { ConversationSummary } from "@/features/parrot/types";
import { formatRelativeFromEpoch } from "@/lib/format";
import { resolveGuestName } from "@/lib/guest";
import { cn } from "@/lib/utils";

interface ParrotConversationRowProps {
  conversation: ConversationSummary;
  isSelected: boolean;
  onSelect: (guestId: string) => void;
}

export function ParrotConversationRow({
  conversation,
  isSelected,
  onSelect,
}: ParrotConversationRowProps) {
  const flagged =
    conversation.has_tool_error ||
    conversation.has_fallback ||
    conversation.has_censored;

  return (
    <button
      type="button"
      data-testid={`conversation-row-${conversation.guest_id}`}
      onClick={() => onSelect(conversation.guest_id)}
      className={cn(
        "flex w-full cursor-pointer flex-col gap-1.5 rounded-md border p-3 text-left transition-colors hover:bg-accent/50",
        { "border-(--zone-accent) bg-(--zone-accent)/10": isSelected }
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-medium text-foreground">
          {resolveGuestName(conversation.guest_id)}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelativeFromEpoch(conversation.last_accessed)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground tabular-nums">
          {conversation.turns} turns · {conversation.total_messages} msgs ·{" "}
          {conversation.tool_calls_total} tools
        </span>

        {flagged && (
          <div className="flex shrink-0 items-center gap-1">
            {conversation.has_tool_error && (
              <Badge variant="destructive">tool error</Badge>
            )}
            {conversation.has_fallback && (
              <Badge variant="secondary">fallback</Badge>
            )}
            {conversation.has_censored && (
              <Badge variant="secondary">censored</Badge>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
