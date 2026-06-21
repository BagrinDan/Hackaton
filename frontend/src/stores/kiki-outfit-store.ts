import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { DEFAULT_KIKI_OUTFIT_ID } from "@/data/kiki-outfits";

interface KikiOutfitState {
  outfitId: string;
  setOutfit: (outfitId: string) => void;
}

export const useKikiOutfitStore = create<KikiOutfitState>()(
  persist(
    (set) => ({
      outfitId: DEFAULT_KIKI_OUTFIT_ID,
      setOutfit: (outfitId) => set({ outfitId }),
    }),
    {
      name: "kiki-outfit",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
