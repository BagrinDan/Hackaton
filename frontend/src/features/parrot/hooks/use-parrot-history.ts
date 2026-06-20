import { useQuery } from "@tanstack/react-query";
import { getChatHistory } from "@/features/parrot/api/parrot-client";
import { PARROT_KEYS } from "@/features/parrot/query-keys";

export function useParrotHistory(guestId: string | null) {
  const query = useQuery({
    queryKey: [...PARROT_KEYS.HISTORY, guestId],
    queryFn: () => getChatHistory(guestId!),
    enabled: guestId !== null,
  });

  const messages = query.data?.messages ?? [];
  const errorMessage = query.error?.message ?? null;

  return {
    ...query,
    messages,
    errorMessage,
  };
}
