import { useActiveReservation } from "@/features/hotel/hooks/use-active-reservation";

export function useCheckedIn(): boolean {
  const { reservation, isLoading } = useActiveReservation();

  if (isLoading) {
    return false;
  }

  return reservation !== null;
}
