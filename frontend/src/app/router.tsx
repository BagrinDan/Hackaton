import { createBrowserRouter } from "react-router";

import { GuestSelectionPage } from "@/features/guest-selection/pages/guest-selection-page";
import { RequireSession } from "@/features/map/components/require-session";
import { MapPage } from "@/features/map/pages/map-page";
import { QuitPage } from "@/features/map/pages/quit-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestSelectionPage />,
  },
  {
    path: "/map",
    element: (
      <RequireSession>
        <MapPage />
      </RequireSession>
    ),
  },
  {
    path: "/quit",
    element: <QuitPage />,
  },
]);
