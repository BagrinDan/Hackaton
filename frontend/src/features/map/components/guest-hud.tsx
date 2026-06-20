import { useNavigate } from "react-router";
import { IconShieldLock } from "@tabler/icons-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/guest";
import { cn } from "@/lib/utils";
import { useSession } from "@/stores/session-selectors";
import { useSessionStore } from "@/stores/session-store";

const hudClassName =
  "fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl bg-sidebar/90 px-4 py-3 shadow-xl backdrop-blur-sm";
const actionClassName = "text-left text-xs cursor-pointer transition-colors";

interface HudActionsProps {
  switchLabel: string;
  onSwitchSession: () => void;
  onQuit: () => void;
}

function HudActions({ switchLabel, onSwitchSession, onQuit }: HudActionsProps) {
  return (
    <div className="ml-1 flex flex-col gap-1 border-l border-sidebar-border pl-3">
      <button
        onClick={onSwitchSession}
        data-testid="logout"
        className={cn(
          actionClassName,
          "text-sidebar-foreground/70 hover:text-sidebar-foreground"
        )}
      >
        {switchLabel}
      </button>
      <button
        onClick={onQuit}
        className={cn(
          actionClassName,
          "text-sidebar-foreground/50 hover:text-destructive"
        )}
      >
        Quit
      </button>
    </div>
  );
}

export function GuestHud() {
  const session = useSession();
  const clearSession = useSessionStore((state) => state.clearSession);
  const navigate = useNavigate();

  function handleSwitchSession() {
    clearSession();
    navigate("/");
  }

  function handleQuit() {
    navigate("/quit");
  }

  if (!session) return null;

  if (session.role === "admin") {
    return (
      <div className={hudClassName} data-testid="session-role" data-role="admin">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-primary bg-primary text-primary-foreground">
          <IconShieldLock size={20} />
        </div>
        <div>
          <p
            data-testid="current-guest-name"
            className="font-display text-sm font-medium text-sidebar-foreground"
          >
            {session.displayName}
          </p>
          <p className="text-xs text-sidebar-foreground/60">
            Admin observer mode
          </p>
        </div>
        <HudActions
          switchLabel="Switch session"
          onSwitchSession={handleSwitchSession}
          onQuit={handleQuit}
        />
      </div>
    );
  }

  const { guest } = session;

  return (
    <div className={hudClassName} data-testid="session-role" data-role="guest">
      <Avatar className="size-10 shrink-0 border-2 border-sidebar-primary">
        <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
          {getInitials(guest)}
        </AvatarFallback>
      </Avatar>

      <div>
        <p
          data-testid="current-guest-name"
          className="font-display text-sm font-medium text-sidebar-foreground"
        >
          {guest.name} {guest.surname}
        </p>
        <p className="text-xs text-sidebar-foreground/60 capitalize">
          {guest.priority} guest
        </p>
      </div>

      <HudActions
        switchLabel="Switch guest"
        onSwitchSession={handleSwitchSession}
        onQuit={handleQuit}
      />
    </div>
  );
}
