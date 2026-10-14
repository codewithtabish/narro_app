// src/lib/actions/partners/types.ts
// ============================================================
// PARTNER USERS — shared types + constants
// (Kept out of the "use server" file — Next.js only allows
//  async functions to be exported from server action files.)
// ============================================================

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

export const USERS_PAGE_SIZE = 20;
export const USERS_MAX_PAGE_SIZE = 20;

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface PartnerUser {
  id: string;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  /** Whether the user is available for calls right now. */
  isAvailable: boolean;
  languagesSpoken: string[];
  languagesLearning: string[];
  proficiencyByLanguage: Record<string, string>;
  interests: string[];
  lastSeenAt: Date | null;
}

export interface GetUsersOptions {
  page?: number;
  limit?: number;
  /** When true → only users with `isAvailable: true`. */
  available?: boolean;
}

export interface GetUsersResult {
  users: PartnerUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}