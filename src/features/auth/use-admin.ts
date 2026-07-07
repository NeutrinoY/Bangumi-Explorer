"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isAdminUser } from "@/features/collection/domain";
import { ADMIN_EMAIL, ADMIN_UID, supabase } from "@/shared/data/supabase";

export interface AdminSession {
  user: User | null;
  isAdmin: boolean;
  login: (password: string) => Promise<{ ok: true } | { ok: false; message: string }>;
  logout: () => Promise<void>;
}

export function useAdmin(): AdminSession {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // getSession resolves from local storage; onAuthStateChange covers every
    // later transition (login, logout, token refresh, other tabs).
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: ADMIN_EMAIL, password });
    return error ? ({ ok: false, message: error.message } as const) : ({ ok: true } as const);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange clears the user state.
  };

  return { user, isAdmin: isAdminUser(user, ADMIN_UID), login, logout };
}
