"use client";

import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { isAdminUser } from "@/features/collection/state";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export function useAdmin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    // 1. Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsAdmin(isAdminUser(session?.user ?? null, ADMIN_UID));
      setIsAuthLoaded(true);
    });

    // 2. Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAdmin(isAdminUser(session?.user ?? null, ADMIN_UID));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return { isAdmin, user, login, logout, isAuthLoaded };
}
