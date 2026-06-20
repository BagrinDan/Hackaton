import { useEffect } from "react";

import oceanBg from "@/assets/ocean-bg.svg";
import { useSessionStore } from "@/stores/session-store";

export function QuitPage() {
  const clearGuest = useSessionStore((state) => state.clearGuest);
  useEffect(() => {
    clearGuest();
  }, [clearGuest]);
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden">
      <img
        src={oceanBg}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-background/95 p-6 text-center shadow-xl">
        <p className="font-display text-4xl font-semibold tracking-tight text-primary md:text-5xl">
          You've checked out.
        </p>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Close this tab to leave.
        </p>
      </div>
    </main>
  );
}
