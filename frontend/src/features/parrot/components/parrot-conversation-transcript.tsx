import { IconAlertCircle, IconChevronLeft } from "@tabler/icons-react";

import { Spinner } from "@/components/ui/spinner";
import { ChatMessage } from "@/features/parrot/components/chat-message";
import { ParrotToolRow } from "@/features/parrot/components/parrot-tool-row";
import { useParrotConversationTranscript } from "@/features/parrot/hooks/use-parrot-admin";
import type { TranscriptEntry } from "@/features/parrot/types";
import { formatRelativeFromEpoch } from "@/lib/format";
import { resolveGuestName } from "@/lib/guest";

interface ParrotConversationTranscriptProps {
  guestId: string;
  onBack: () => void;
}

function TranscriptItem({ entry }: { entry: TranscriptEntry }) {
  if (entry.role === "tool") {
    return (
      <ParrotToolRow
        variant="result"
        name={entry.name ?? "tool"}
        payload={entry.content ?? ""}
      />
    );
  }

  if (entry.tool_calls?.length) {
    return (
      <div className="flex flex-col gap-2">
        {entry.tool_calls.map((call) => (
          <ParrotToolRow
            key={call.id}
            variant="call"
            name={call.name ?? "unknown"}
            payload={call.arguments ?? ""}
          />
        ))}
        {entry.content && (
          <ChatMessage
            message={{ role: "assistant", content: entry.content }}
            guest={null}
          />
        )}
      </div>
    );
  }

  if (entry.content !== null) {
    return (
      <ChatMessage
        message={{ role: entry.role, content: entry.content }}
        guest={null}
      />
    );
  }

  return null;
}

export function ParrotConversationTranscript({
  guestId,
  onBack,
}: ParrotConversationTranscriptProps) {
  const { transcript, errorMessage, isLoading } =
    useParrotConversationTranscript(guestId);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <IconChevronLeft size={16} />
          Back
        </button>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">
            {resolveGuestName(guestId)}
          </span>
          {transcript && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeFromEpoch(transcript.last_accessed)}
            </span>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="size-6" />
        </div>
      ) : !transcript ? (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <IconAlertCircle
              size={16}
              className="mt-0.5 shrink-0 text-destructive"
            />
            <p>{errorMessage ?? "Transcript could not be loaded."}</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {transcript.transcript.map((entry, index) => (
            <TranscriptItem key={index} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
