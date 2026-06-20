import type { RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChatErrorMessage,
  ChatMessage,
  ChatThinkingMessage,
} from "@/features/parrot/components/chat-message";
import type { ParrotThreadItem } from "@/features/parrot/hooks/use-parrot-chat";
import type { GuestProfile } from "@/types/guest";

interface ChatThreadProps {
  guest: GuestProfile | null;
  items: ParrotThreadItem[];
  onRetry: () => void;
  isSending: boolean;
  scrollAnchorRef: RefObject<HTMLDivElement | null>;
}

export function ChatThread({
  guest,
  items,
  onRetry,
  isSending,
  scrollAnchorRef,
}: ChatThreadProps) {
  return (
    <div className="h-full">
      <ScrollArea className="h-full">
        <div className="flex min-h-full flex-col justify-end gap-4 p-4">
          {items.map((item) => {
            switch (item.kind) {
              case "message":
                return (
                  <ChatMessage
                    key={item.key}
                    message={item.message}
                    guest={guest}
                  />
                );
              case "thinking":
                return <ChatThinkingMessage key={item.key} guest={guest} />;
              case "error":
                return (
                  <ChatErrorMessage
                    key={item.key}
                    message={item.message}
                    onRetry={onRetry}
                    disabled={isSending}
                  />
                );
            }
          })}
          <div ref={scrollAnchorRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
