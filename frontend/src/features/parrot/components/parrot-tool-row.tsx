import { IconChevronDown, IconSettings } from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ParrotToolRowProps {
  variant: "call" | "result";
  name: string;
  payload: string;
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function ParrotToolRow({ variant, name, payload }: ParrotToolRowProps) {
  return (
    <Collapsible className="group/tool">
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
        <IconSettings size={14} className="shrink-0" />
        <span className="font-mono text-foreground">{name}</span>
        <span>{variant === "call" ? "called" : "returned"}</span>
        <IconChevronDown
          size={14}
          className="ml-auto transition-transform group-data-[state=open]/tool:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {prettyJson(payload)}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
