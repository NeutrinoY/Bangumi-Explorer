"use client";

import { useState, useEffect } from "react";

const TOKEN_KEY = "bangumi_access_token";
const SECRET_TOKEN = "valid_session_0621"; // Stored in LS to indicate logged in
const ACCESS_CODE = "0621";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored === SECRET_TOKEN) {
      setIsAdmin(true);
    }
    setIsAuthLoaded(true);
  }, []);

  const login = (code: string) => {
    if (code === ACCESS_CODE) {
      localStorage.setItem(TOKEN_KEY, SECRET_TOKEN);
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setIsAdmin(false);
  };

  return { isAdmin, login, logout, isAuthLoaded };
}
