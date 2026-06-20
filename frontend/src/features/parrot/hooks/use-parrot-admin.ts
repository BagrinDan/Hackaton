import { useQuery } from "@tanstack/react-query";
import {
  getAdminMetrics,
  getConversations,
  getConversationTranscript,
} from "@/features/parrot/api/parrot-client";
import { PARROT_KEYS } from "@/features/parrot/query-keys";
import { POLL_INTERVAL_MS } from "@/lib/polling";

export function useParrotMetrics() {
  const query = useQuery({
    queryKey: PARROT_KEYS.ADMIN_METRICS,
    queryFn: getAdminMetrics,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    ...query,
    metrics: query.data ?? null,
    errorMessage: query.error?.message ?? null,
  };
}

export function useParrotConversations() {
  const query = useQuery({
    queryKey: PARROT_KEYS.CONVERSATIONS,
    queryFn: getConversations,
    refetchInterval: POLL_INTERVAL_MS,
  });

  return {
    ...query,
    conversations: query.data?.conversations ?? [],
    errorMessage: query.error?.message ?? null,
  };
}

export function useParrotConversationTranscript(guestId: string | null) {
  const query = useQuery({
    queryKey: [...PARROT_KEYS.CONVERSATION, guestId],
    queryFn: () => getConversationTranscript(guestId!),
    enabled: guestId !== null,
  });

  return {
    ...query,
    transcript: query.data ?? null,
    errorMessage: query.error?.message ?? null,
  };
}
