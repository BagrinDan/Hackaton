import { useQuery } from "@tanstack/react-query";
import { getActivities } from "@/features/beach/api/beach-client";
import { BEACH_KEYS } from "@/features/beach/query-keys";

export function useActivities() {
  const query = useQuery({
    queryKey: [...BEACH_KEYS.ACTIVITIES],
    queryFn: getActivities,
    select: (data) => data.activities,
  });

  return {
    activities: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
