import { KIKI_OUTFITS } from "@/data/kiki-outfits";
import { useKikiOutfitStore } from "@/stores/kiki-outfit-store";

export function KikiCompanion() {
  const outfitId = useKikiOutfitStore((state) => state.outfitId);
  const outfit = KIKI_OUTFITS.find((item) => item.id === outfitId);

  if (!outfit) return null;

  return (
    <img
      src={outfit.image}
      alt={`Kiki wearing ${outfit.label}`}
      data-testid="kiki-companion"
      className="whale-bob pointer-events-none fixed bottom-8 right-8 z-40 h-28 w-auto drop-shadow-xl select-none sm:h-36"
    />
  );
}
