import type { ReactNode } from "react";
import { Navigate } from "react-router";

import { useSession } from "@/stores/session-selectors";

interface RequireSessionProps {
  children: ReactNode;
}

export function RequireSession({ children }: RequireSessionProps) {
  const session = useSession();

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
}
