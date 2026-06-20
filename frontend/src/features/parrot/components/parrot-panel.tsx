import { useEffect, useRef } from "react";
import { useLanded } from "@/features/airport/hooks/use-airport";
import { NotLandedGate } from "@/features/map/components/not-landed-gate";
import { useParrotChat } from "@/features/parrot/hooks/use-parrot-chat";
import { useIsAdmin } from "@/stores/session-selectors";
import { ChatComposer } from "./chat-composer";
import { ChatLoadingState } from "./chat-loading-state";
import { ChatLoadErrorState } from "./chat-load-error-state";
import { ChatThread } from "./chat-thread";
import { ParrotAdminPanel } from "./parrot-admin-panel";

export function ParrotPanel() {
  const isAdmin = useIsAdmin();
  const landed = useLanded();

  const {
    guest,
    threadItems,
    errorMessage,
    isLoadingHistory,
    isHistoryReady,
    isSending,
    sendMessage,
    retryFailedMessage,
    refetchHistory,
  } = useParrotChat();

  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: "end" });
  }, [isHistoryReady, threadItems]);

  if (isAdmin) return <ParrotAdminPanel />;

  if (guest && !landed) return <NotLandedGate />;

  const composerDisabled = isLoadingHistory || !isHistoryReady || isSending;

  return (
    <div className="-mx-7 -my-6 flex h-[calc(100vh-15rem)] min-h-[32rem] flex-col overflow-hidden">
      <div className="min-h-0 flex-1 px-7">
        {isLoadingHistory ? (
          <ChatLoadingState />
        ) : errorMessage ? (
          <ChatLoadErrorState
            message={errorMessage}
            onRetry={() => {
              void refetchHistory();
            }}
            disabled={isSending}
          />
        ) : (
          <ChatThread
            guest={guest}
            items={threadItems}
            onRetry={retryFailedMessage}
            isSending={isSending}
            scrollAnchorRef={scrollAnchorRef}
          />
        )}
      </div>

      <ChatComposer
        key={guest?.id}
        disabled={composerDisabled}
        onSend={sendMessage}
      />
    </div>
  );
}
