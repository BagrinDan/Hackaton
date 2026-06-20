import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/stores/session-store";
import { postChat } from "@/features/parrot/api/parrot-client";
import { useParrotHistory } from "@/features/parrot/hooks/use-parrot-history";
import { PARROT_KEYS } from "@/features/parrot/query-keys";
import type {
  ChatHistoryMessage,
  ChatHistoryResponse,
} from "@/features/parrot/types";

interface PendingTurn {
  guestId: string;
  message: string;
  localId: string;
}

interface FailedTurn extends PendingTurn {
  error: string;
}

export type ParrotThreadItem =
  | {
      key: string;
      kind: "message";
      message: ChatHistoryMessage;
    }
  | {
      key: string;
      kind: "thinking";
    }
  | {
      key: string;
      kind: "error";
      prompt: string;
      message: string;
    };

function appendMessagesToHistory(
  previous: ChatHistoryResponse | undefined,
  pendingTurn: PendingTurn,
  reply: string
): ChatHistoryResponse {
  return {
    guest_id: previous?.guest_id ?? pendingTurn.guestId,
    messages: [
      ...(previous?.messages ?? []),
      {
        content: pendingTurn.message,
        role: "user",
      },
      {
        content: reply,
        role: "assistant",
      },
    ],
  };
}

function getMessageKey(message: ChatHistoryMessage, index: number) {
  return `${message.role}:${message.content}:${index}`;
}

export function useParrotChat() {
  const guest = useSessionStore((state) => state.guest);
  const queryClient = useQueryClient();
  const participantId = guest?.id ?? null;
  const history = useParrotHistory(participantId);

  const [pendingTurn, setPendingTurn] = useState<PendingTurn | null>(null);
  const [failedTurn, setFailedTurn] = useState<FailedTurn | null>(null);

  const mutation = useMutation({
    mutationFn: ({
      guestId,
      message,
    }: {
      guestId: string;
      message: string;
      localId: string;
    }) => postChat({ guest_id: guestId, message }),
    onSuccess: (result, variables) => {
      const turn = {
        guestId: variables.guestId,
        message: variables.message,
        localId: variables.localId,
      };

      queryClient.setQueryData<ChatHistoryResponse>(
        [...PARROT_KEYS.HISTORY, variables.guestId],
        (previous) => appendMessagesToHistory(previous, turn, result.reply)
      );

      setPendingTurn(null);
      setFailedTurn(null);
    },
    onError: (error, variables) => {
      setPendingTurn(null);
      setFailedTurn({
        guestId: variables.guestId,
        message: variables.message,
        localId: variables.localId,
        error: error.message,
      });
    },
  });

  const threadItems = useMemo<ParrotThreadItem[]>(() => {
    const items: ParrotThreadItem[] = history.messages.map(
      (message, index) => ({
        key: getMessageKey(message, index),
        kind: "message",
        message,
      })
    );

    if (pendingTurn && pendingTurn.guestId === participantId) {
      items.push({
        key: `pending:${pendingTurn.localId}`,
        kind: "message",
        message: {
          content: pendingTurn.message,
          role: "user",
        },
      });
      items.push({
        key: `thinking:${pendingTurn.localId}`,
        kind: "thinking",
      });
    }

    if (failedTurn && failedTurn.guestId === participantId) {
      items.push({
        key: `failed:${failedTurn.localId}`,
        kind: "message",
        message: {
          content: failedTurn.message,
          role: "user",
        },
      });
      items.push({
        key: `error:${failedTurn.localId}`,
        kind: "error",
        prompt: failedTurn.message,
        message: failedTurn.error,
      });
    }

    return items;
  }, [failedTurn, history.messages, participantId, pendingTurn]);

  function sendMessage(message: string) {
    const trimmed = message.trim();
    if (!participantId || !trimmed || mutation.isPending) return;

    const localId = crypto.randomUUID();

    setFailedTurn(null);
    setPendingTurn({
      guestId: participantId,
      message: trimmed,
      localId,
    });

    mutation.mutate({ guestId: participantId, message: trimmed, localId });
  }

  function retryFailedMessage() {
    if (!participantId || !failedTurn || mutation.isPending) return;

    setPendingTurn({
      guestId: participantId,
      message: failedTurn.message,
      localId: failedTurn.localId,
    });
    setFailedTurn(null);
    mutation.mutate({
      guestId: participantId,
      message: failedTurn.message,
      localId: failedTurn.localId,
    });
  }

  return {
    guest,
    messages: history.messages,
    threadItems,
    errorMessage: history.errorMessage,
    isLoadingHistory: history.isLoading,
    isHistoryReady: !!history.data,
    isSending: mutation.isPending,
    sendMessage,
    retryFailedMessage,
    refetchHistory: history.refetch,
  };
}
