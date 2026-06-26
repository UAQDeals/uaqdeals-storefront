import { cookies } from "next/headers";

export const FULL_EMIRATES = ["Umm Al Quwain", "Al Hamriyah"];

export const ALL_EMIRATES = [
  { name: "Umm Al Quwain",  emoji: "🏘️", full: true,  grad: ["#8E1B3A", "#C72931"] },
  { name: "Al Hamriyah",    emoji: "🏝️", full: true,  grad: ["#0E7490", "#0891B2"] },
  { name: "Dubai",          emoji: "🏙️", full: false, grad: ["#1D4ED8", "#3B82F6"] },
  { name: "Abu Dhabi",      emoji: "🕌", full: false, grad: ["#0F766E", "#14B8A6"] },
  { name: "Sharjah",        emoji: "🌆", full: false, grad: ["#7E22CE", "#A855F7"] },
  { name: "Ajman",          emoji: "🌇", full: false, grad: ["#C2410C", "#EA580C"] },
  { name: "Ras Al Khaimah", emoji: "⛰️", full: false, grad: ["#15803D", "#22C55E"] },
  { name: "Fujairah",       emoji: "🏔️", full: false, grad: ["#B45309", "#F59E0B"] },
];

export async function getEmirate(): Promise<string | null> {
  const c = await cookies();
  return c.get("emirate")?.value ?? null;
}

export async function showProducts(): Promise<boolean> {
  const em = await getEmirate();
  return !!em && FULL_EMIRATES.includes(em);
}
