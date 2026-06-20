import { Spinner } from "@/components/ui/spinner";
import { ActivityCard } from "@/features/beach/components/activity-card";
import { ActivityAction } from "@/features/beach/components/activity-action";
import { useActivities } from "@/features/beach/hooks/use-activities";
import { useBookActivity } from "@/features/beach/hooks/use-book-activity";

export function ActivitiesList() {
  const { activities, isLoading } = useActivities();
  const {
    bookedActivityId,
    isLoadingBooked,
    book,
    cancel,
    isBooking,
    isCancelling,
  } = useBookActivity();

  if (isLoading || isLoadingBooked) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No activities available.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {activities.map((activity) => {
        const isBooked = bookedActivityId === activity.activity_id;
        const isReplacing = bookedActivityId !== null && !isBooked;

        return (
          <ActivityCard
            key={activity.activity_id}
            activity={activity}
            isBooked={isBooked}
            action={
              <ActivityAction
                isBooked={isBooked}
                isReplacing={isReplacing}
                isFull={activity.remaining === 0}
                isBooking={isBooking}
                isCancelling={isCancelling}
                onBook={() => book(activity.activity_id)}
                onCancel={() => cancel(activity.activity_id)}
              />
            }
          />
        );
      })}
    </div>
  );
}
