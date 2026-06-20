import { useSessionStore } from "@/stores/session-store";
import type { AppSession, GuestSession } from "@/stores/session-store";
import type { GuestProfile } from "@/types/guest";

export function useSession(): AppSession | null {
  return useSessionStore((state) => state.session);
}

export function useSessionRole(): AppSession["role"] | null {
  return useSessionStore((state) => state.session?.role ?? null);
}

export function useIsAdmin(): boolean {
  return useSessionStore((state) => state.session?.role === "admin");
}

export function useGuestSession(): GuestSession | null {
  return useSessionStore((state) =>
    state.session?.role === "guest" ? state.session : null
  );
}

export function useGuest(): GuestProfile | null {
  return useSessionStore((state) => state.guest);
}
