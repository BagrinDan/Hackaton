import kikiSurfer from "@/assets/kiki/kiki-surfer.png";
import kikiFisherman from "@/assets/kiki/kiki-fisherman.png";
import kikiTropical from "@/assets/kiki/kiki-tropical.png";
import kikiCabana from "@/assets/kiki/kiki-cabana.png";
import kikiSunbather from "@/assets/kiki/kiki-sunbather.png";
import kikiLounger from "@/assets/kiki/kiki-lounger.png";
import kikiSwimmer from "@/assets/kiki/kiki-swimmer.png";
import kikiBeachball from "@/assets/kiki/kiki-beachball.png";
import kikiHawaiian from "@/assets/kiki/kiki-hawaiian.png";
import kikiShirt from "@/assets/kiki/kiki-shirt.png";
import kikiSnorkel from "@/assets/kiki/kiki-snorkel.png";
import kikiSunny from "@/assets/kiki/kiki-sunny.png";
import type { KikiOutfit } from "@/types/kiki";

export const KIKI_OUTFITS: KikiOutfit[] = [
  { id: "surfer", label: "Surfer", image: kikiSurfer },
  { id: "fisherman", label: "Fisherman", image: kikiFisherman },
  { id: "tropical", label: "Tropical", image: kikiTropical },
  { id: "cabana", label: "Cabana", image: kikiCabana },
  { id: "sunbather", label: "Sunbather", image: kikiSunbather },
  { id: "lounger", label: "Lounger", image: kikiLounger },
  { id: "swimmer", label: "Swimmer", image: kikiSwimmer },
  { id: "beachball", label: "Beach Ball", image: kikiBeachball },
  { id: "hawaiian", label: "Hawaiian", image: kikiHawaiian },
  { id: "shirt", label: "Island Shirt", image: kikiShirt },
  { id: "snorkel", label: "Snorkeler", image: kikiSnorkel },
  { id: "sunny", label: "Sunny", image: kikiSunny },
];

export const DEFAULT_KIKI_OUTFIT_ID = KIKI_OUTFITS[0].id;
