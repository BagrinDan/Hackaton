import { IconAlertCircle, IconChevronDown } from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Spinner } from "@/components/ui/spinner";
import { ParrotQualityRow } from "@/features/parrot/components/parrot-quality-row";
import { ParrotStatCard } from "@/features/parrot/components/parrot-stat-card";
import { ParrotToolBreakdown } from "@/features/parrot/components/parrot-tool-breakdown";
import { useParrotMetrics } from "@/features/parrot/hooks/use-parrot-admin";

export function ParrotMetrics() {
  const { metrics, errorMessage, isLoading } = useParrotMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <IconAlertCircle
            size={16}
            className="mt-0.5 shrink-0 text-destructive"
          />
          <p>{errorMessage ?? "Metrics could not be loaded."}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="parrot-metrics" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ParrotStatCard
          label="Conversations"
          value={metrics.total_conversations}
          hint={`of ${metrics.max_conversations}`}
        />
        <ParrotStatCard label="Messages" value={metrics.total_messages} />
        <ParrotStatCard
          label="Turns"
          value={`${metrics.total_user_turns} / ${metrics.total_assistant_turns}`}
          hint="user / assistant"
        />
        <ParrotStatCard label="Tool calls" value={metrics.tool_calls_total} />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
          <span>Tool usage &amp; quality</span>
          <IconChevronDown
            size={14}
            className="ml-auto transition-transform [[data-state=open]_&]:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3 flex flex-col gap-4">
          <ParrotToolBreakdown byName={metrics.tool_calls_by_name} />
          <ParrotQualityRow metrics={metrics} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
