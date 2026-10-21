// src/lib/gifts.ts

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  coinCost: number;
}

export const GIFTS: Gift[] = [
  // ── Low Tier (Starter) ──
  { id: "clap", name: "Clap", emoji: "👏", coinCost: 20 },
  { id: "fire", name: "Fire", emoji: "🔥", coinCost: 25 },
  { id: "rose", name: "Rose", emoji: "🌹", coinCost: 30 },
  { id: "heart", name: "Heart", emoji: "❤️", coinCost: 50 },

  // ── Mid Tier ──
  { id: "star", name: "Star", emoji: "⭐", coinCost: 100 },
  { id: "golden_mic", name: "Golden Mic", emoji: "🎤", coinCost: 250 },
  { id: "rocket", name: "Rocket", emoji: "🚀", coinCost: 500 },
  { id: "crown", name: "Crown", emoji: "👑", coinCost: 1000 },

  // ── High Tier (Whales) ──
  { id: "sports_car", name: "Sports Car", emoji: "🏎️", coinCost: 2500 },
  { id: "castle", name: "Castle", emoji: "🏰", coinCost: 5000 },
];

export function getGift(id: string): Gift | undefined {
  return GIFTS.find((g) => g.id === id);
}