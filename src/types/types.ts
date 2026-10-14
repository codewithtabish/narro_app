// src/types/types.ts

/* -------------------------------------------------------------------------- */
/*  Users — Types + Constants                                                  */
/* -------------------------------------------------------------------------- */

export const USERS_PAGE_SIZE = 20;
export const USERS_MAX_PAGE_SIZE = 20;

export interface PartnerUser {
  id: string;
  name: string;
  imageUrl: string | null;
  profileImageUrl: string | null;
  bio: string | null;
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