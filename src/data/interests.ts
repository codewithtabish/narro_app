// src/lib/constants/interests.ts
// ============================================================
// INTERESTS — NARRO
// Interest tags shown during onboarding (Step 4) and on the
// profile page. Used for partner matching + conversation topics.
//
// Kept intentionally broad — covers common hobbies, topics,
// and areas of study so most users find something relevant.
// ============================================================

export interface Interest {
  /** Slug — used as the stored value in the database */
  id: string;
  /** Display label */
  label: string;
  /** Optional emoji for visual recognition */
  emoji: string;
  /** Grouping category */
  category: InterestCategory;
}

// ============================================================
// CATEGORIES
// ============================================================

export type InterestCategory =
  | "lifestyle"
  | "culture"
  | "knowledge"
  | "work"
  | "wellness"
  | "creative";

export const INTEREST_CATEGORIES: Record<
  InterestCategory,
  { label: string; emoji: string }
> = {
  lifestyle: { label: "Lifestyle", emoji: "🌿" },
  culture: { label: "Culture", emoji: "🎭" },
  knowledge: { label: "Knowledge", emoji: "📚" },
  work: { label: "Work", emoji: "💼" },
  wellness: { label: "Wellness", emoji: "🧘" },
  creative: { label: "Creative", emoji: "🎨" },
};

// ============================================================
// INTERESTS
// ============================================================

export const INTERESTS: Interest[] = [
  // ─── Lifestyle ───────────────────────────────────────────
  { id: "travel", label: "Travel", emoji: "✈️", category: "lifestyle" },
  { id: "food", label: "Food", emoji: "🍽️", category: "lifestyle" },
  { id: "cooking", label: "Cooking", emoji: "👨‍🍳", category: "lifestyle" },
  { id: "coffee", label: "Coffee", emoji: "☕", category: "lifestyle" },
  { id: "fashion", label: "Fashion", emoji: "👗", category: "lifestyle" },
  { id: "pets", label: "Pets", emoji: "🐾", category: "lifestyle" },
  { id: "nature", label: "Nature", emoji: "🌳", category: "lifestyle" },
  { id: "photography", label: "Photography", emoji: "📷", category: "lifestyle" },

  // ─── Culture ─────────────────────────────────────────────
  { id: "movies", label: "Movies", emoji: "🎬", category: "culture" },
  { id: "music", label: "Music", emoji: "🎵", category: "culture" },
  { id: "books", label: "Books", emoji: "📖", category: "culture" },
  { id: "anime", label: "Anime", emoji: "🎌", category: "culture" },
  { id: "gaming", label: "Gaming", emoji: "🎮", category: "culture" },
  { id: "history", label: "History", emoji: "🏛️", category: "culture" },
  { id: "art", label: "Art", emoji: "🎨", category: "culture" },
  { id: "theatre", label: "Theatre", emoji: "🎭", category: "culture" },
  { id: "podcasts", label: "Podcasts", emoji: "🎙️", category: "culture" },

  // ─── Knowledge ───────────────────────────────────────────
  { id: "technology", label: "Technology", emoji: "💻", category: "knowledge" },
  { id: "science", label: "Science", emoji: "🔬", category: "knowledge" },
  { id: "space", label: "Space", emoji: "🚀", category: "knowledge" },
  { id: "psychology", label: "Psychology", emoji: "🧠", category: "knowledge" },
  { id: "philosophy", label: "Philosophy", emoji: "🤔", category: "knowledge" },
  { id: "languages", label: "Languages", emoji: "🗣️", category: "knowledge" },
  { id: "current-events", label: "Current Events", emoji: "📰", category: "knowledge" },

  // ─── Work ────────────────────────────────────────────────
  { id: "business", label: "Business", emoji: "💼", category: "work" },
  { id: "startups", label: "Startups", emoji: "🚀", category: "work" },
  { id: "marketing", label: "Marketing", emoji: "📈", category: "work" },
  { id: "finance", label: "Finance", emoji: "💰", category: "work" },
  { id: "design", label: "Design", emoji: "✏️", category: "work" },
  { id: "engineering", label: "Engineering", emoji: "⚙️", category: "work" },
  { id: "medicine", label: "Medicine", emoji: "🩺", category: "work" },
  { id: "law", label: "Law", emoji: "⚖️", category: "work" },
  { id: "education", label: "Education", emoji: "🎓", category: "work" },

  // ─── Wellness ────────────────────────────────────────────
  { id: "sports", label: "Sports", emoji: "⚽", category: "wellness" },
  { id: "fitness", label: "Fitness", emoji: "💪", category: "wellness" },
  { id: "yoga", label: "Yoga", emoji: "🧘", category: "wellness" },
  { id: "meditation", label: "Meditation", emoji: "🕯️", category: "wellness" },
  { id: "running", label: "Running", emoji: "🏃", category: "wellness" },
  { id: "cycling", label: "Cycling", emoji: "🚴", category: "wellness" },
  { id: "hiking", label: "Hiking", emoji: "🥾", category: "wellness" },

  // ─── Creative ────────────────────────────────────────────
  { id: "writing", label: "Writing", emoji: "✍️", category: "creative" },
  { id: "poetry", label: "Poetry", emoji: "📜", category: "creative" },
  { id: "dance", label: "Dance", emoji: "💃", category: "creative" },
  { id: "cooking-arts", label: "Culinary Arts", emoji: "🍳", category: "creative" },
  { id: "diy", label: "DIY & Crafts", emoji: "🔨", category: "creative" },
];

// ============================================================
// CONSTRAINTS
// ============================================================

/**
 * Maximum number of interests a user can select.
 * Keeps partner matching meaningful (not everyone picks all).
 */
export const MAX_INTERESTS = 5;

/**
 * Minimum number of interests a user must select.
 * 0 = optional. Set to 1+ if you want to force selection.
 */
export const MIN_INTERESTS = 0;

// ============================================================
// HELPERS
// ============================================================

/**
 * Look up an interest by its id.
 */
export function getInterestById(id: string): Interest | undefined {
  return INTERESTS.find((interest) => interest.id === id);
}

/**
 * Get the display label for an interest id.
 * Returns the id itself if not found — never fails.
 */
export function getInterestLabel(id: string): string {
  return getInterestById(id)?.label ?? id;
}

/**
 * Get the emoji for an interest id.
 * Returns a neutral dot if not found.
 */
export function getInterestEmoji(id: string): string {
  return getInterestById(id)?.emoji ?? "•";
}

/**
 * Get a display string like "✈️ Travel" for an interest id.
 */
export function getInterestDisplay(id: string): string {
  return `${getInterestEmoji(id)} ${getInterestLabel(id)}`;
}

/**
 * Group interests by category.
 * Useful for rendering the picker in sections.
 */
export function getInterestsByCategory(): Record<InterestCategory, Interest[]> {
  const grouped = {} as Record<InterestCategory, Interest[]>;

  (Object.keys(INTEREST_CATEGORIES) as InterestCategory[]).forEach((cat) => {
    grouped[cat] = [];
  });

  INTERESTS.forEach((interest) => {
    grouped[interest.category].push(interest);
  });

  return grouped;
}

/**
 * Filter interests by a search query (matches label).
 * Case-insensitive.
 */
export function filterInterests(query: string): Interest[] {
  const q = query.trim().toLowerCase();
  if (!q) return INTERESTS;

  return INTERESTS.filter(
    (interest) =>
      interest.id.toLowerCase().includes(q) ||
      interest.label.toLowerCase().includes(q),
  );
}