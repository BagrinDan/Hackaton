import { IconAlertCircle } from "@tabler/icons-react";

import { Spinner } from "@/components/ui/spinner";
import { ParrotConversationRow } from "@/features/parrot/components/parrot-conversation-row";
import { useParrotConversations } from "@/features/parrot/hooks/use-parrot-admin";

interface ParrotConversationListProps {
  selectedGuestId: string | null;
  onSelect: (guestId: string) => void;
}

export function ParrotConversationList({
  selectedGuestId,
  onSelect,
}: ParrotConversationListProps) {
  const { conversations, errorMessage, isLoading } = useParrotConversations();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconAlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-medium">Conversations</span>
        <span className="text-xs text-muted-foreground">
          {conversations.length} active
        </span>
      </div>

      {conversations.length === 0 ? (
        <p className="text-xs text-muted-foreground/60">
          No conversations in memory.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <ParrotConversationRow
              key={conversation.guest_id}
              conversation={conversation}
              isSelected={conversation.guest_id === selectedGuestId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
