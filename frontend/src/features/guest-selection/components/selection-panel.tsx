import { Button } from "@/components/ui/button";

interface SelectionPanelProps {
  title: string;
  description: string;
  flipLabel: string;
  onFlip: () => void;
  children: React.ReactNode;
}

export function SelectionPanel({
  title,
  description,
  flipLabel,
  onFlip,
  children,
}: SelectionPanelProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-background/95 p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-primary md:text-6xl">
            {title}
          </h1>
          <p className="text-base leading-7 text-muted-foreground">
            {description}
          </p>
        </div>
        <Button
          variant="pill"
          size="sm"
          data-testid="admin-flip"
          className="mt-1 shrink-0"
          onClick={onFlip}
        >
          {flipLabel}
        </Button>
      </div>
      {children}
    </div>
  );
}
