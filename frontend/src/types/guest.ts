export type GuestPriority = "standard" | "fast";
export type GuestPassport = "EU" | "non-EU";

export interface GuestProfile {
  id: string;
  name: string;
  surname: string;
  age: number;
  passport: GuestPassport;
  priority: GuestPriority;
  disability: boolean;
  avatar: string;
  personality: string;
}
