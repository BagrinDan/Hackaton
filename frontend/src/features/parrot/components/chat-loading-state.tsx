import { Spinner } from "@/components/ui/spinner";

export function ChatLoadingState() {
  return (
    <div className="flex items-center justify-center py-8">
      <Spinner className="size-6" />
    </div>
  );
}
