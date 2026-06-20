import { IconAlertCircle } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Spinner } from "@/components/ui/spinner";
import { getActivities } from "@/features/beach/api/beach-client";
import { BEACH_KEYS } from "@/features/beach/query-keys";
import { ActivityCard } from "@/features/beach/components/activity-card";
import { POLL_INTERVAL_MS } from "@/lib/polling";

export function BeachAdminActivitiesSummary() {
  const { data, isLoading, error } = useQuery({
    queryKey: [...BEACH_KEYS.ACTIVITIES],
    queryFn: getActivities,
    refetchInterval: POLL_INTERVAL_MS,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconAlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p>{error?.message ?? "Activity state could not be loaded."}</p>
        </div>
      </div>
    );
  }

  const activities = data.activities;
  const totalRemaining = activities.reduce((sum, a) => sum + a.remaining, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm font-medium">
          Beach activities
        </span>
        <span className="text-xs text-muted-foreground">
          {totalRemaining} slots left
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <ActivityCard key={activity.activity_id} activity={activity} />
        ))}
      </div>
    </div>
  );
}
