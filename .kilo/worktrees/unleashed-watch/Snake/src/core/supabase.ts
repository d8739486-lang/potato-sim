import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы из БД
export interface Profile {
  id: string;
  username: string;
  totalDeaths: number;
  totalWins: number;
  totalApplesEaten: number;
  createdAt: string;
}

export interface Ban {
  id: string;
  userId: string;
  reason: string;
  bannedUntil: string | null;
  bannedByUsername: string;
  createdAt: string;
  profiles?: { username: string };
}

// Маппинг snake_case -> camelCase
export const mapProfile = (raw: Record<string, unknown>): Profile => ({
  id: raw.id as string,
  username: raw.username as string,
  totalDeaths: raw.total_deaths as number,
  totalWins: raw.total_wins as number,
  totalApplesEaten: raw.total_apples_eaten as number,
  createdAt: raw.created_at as string,
});

export const mapBan = (raw: Record<string, unknown>): Ban => ({
  id: raw.id as string,
  userId: raw.user_id as string,
  reason: raw.reason as string,
  bannedUntil: raw.banned_until as string | null,
  bannedByUsername: raw.banned_by_username as string,
  createdAt: raw.created_at as string,
  profiles: raw.profiles as { username: string } | undefined,
});
