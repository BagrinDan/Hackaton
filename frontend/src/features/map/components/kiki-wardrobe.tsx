import { IconMenu2 } from "@tabler/icons-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { KIKI_OUTFITS } from "@/data/kiki-outfits";
import { cn } from "@/lib/utils";
import { useKikiOutfitStore } from "@/stores/kiki-outfit-store";

export function KikiWardrobeButton() {
  const outfitId = useKikiOutfitStore((state) => state.outfitId);
  const setOutfit = useKikiOutfitStore((state) => state.setOutfit);

  return (
    <Sheet>
      <SheetTrigger
        data-testid="kiki-wardrobe-trigger"
        className="fixed top-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-sidebar/90 text-sidebar-foreground shadow-xl backdrop-blur-sm transition-transform duration-150 hover:scale-105 active:scale-95"
        aria-label="Choose Kiki's outfit"
      >
        <IconMenu2 size={22} />
      </SheetTrigger>

      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Dress up Kiki</SheetTitle>
          <SheetDescription>
            Pick an outfit for Kiki&apos;s vacation. Your choice is saved on
            this device.
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3">
          {KIKI_OUTFITS.map((outfit) => {
            const selected = outfit.id === outfitId;

            return (
              <button
                key={outfit.id}
                type="button"
                data-testid={`kiki-outfit-${outfit.id}`}
                onClick={() => setOutfit(outfit.id)}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl border-2 bg-card p-3 transition duration-150 hover:-translate-y-0.5 hover:shadow-md",
                  selected
                    ? "border-primary bg-accent/60 shadow-md"
                    : "border-border"
                )}
              >
                <img
                  src={outfit.image}
                  alt={outfit.label}
                  className="h-24 w-full rounded-lg object-contain transition-transform duration-150 group-hover:scale-105"
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    selected ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {outfit.label}
                </span>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
