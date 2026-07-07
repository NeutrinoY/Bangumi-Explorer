import { createClient } from "@supabase/supabase-js";

function requirePublicEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required public environment variable: ${name}`);
  }
  return value;
}

export const supabase = createClient(
  requirePublicEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
  requirePublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

/** The single account allowed to write; collection reads are keyed to it too. */
export const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

/** Login email is fixed server-side config; the UI only ever asks for a password. */
export const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "";
