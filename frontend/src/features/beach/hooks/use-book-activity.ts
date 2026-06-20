import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bookActivity,
  cancelActivity,
  getActivityByGuest,
} from "@/features/beach/api/beach-client";
import { useSessionStore } from "@/stores/session-store";
import { BEACH_KEYS } from "@/features/beach/query-keys";

export function useBookActivity() {
  const guest = useSessionStore((s) => s.guest);
  const queryClient = useQueryClient();

  const bookedQuery = useQuery({
    queryKey: [...BEACH_KEYS.BOOKED, guest?.id],
    queryFn: () => getActivityByGuest(guest!.id),
    enabled: !!guest,
    select: (data) => data.activity_id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [...BEACH_KEYS.ACTIVITIES] });
    queryClient.invalidateQueries({
      queryKey: [...BEACH_KEYS.BOOKED, guest?.id],
    });
  };

  const bookMutation = useMutation({
    mutationFn: (activityId: string) => bookActivity(activityId, guest!.id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (activityId: string) => cancelActivity(activityId, guest!.id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return {
    bookedActivityId: bookedQuery.data ?? null,
    isLoadingBooked: bookedQuery.isLoading,
    book: (activityId: string) => bookMutation.mutate(activityId),
    cancel: (activityId: string) => cancelMutation.mutate(activityId),
    isBooking: bookMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}
