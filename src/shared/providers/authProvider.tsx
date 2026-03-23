"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/src/shared/api/supabase/client";
import { providersType } from "../types/providersType";

type AuthContextValue = {
  session: Session | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
};

export const AuthProvider = ({ children }: providersType) => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Получаем текущую сессию при старте приложения.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
    });

    // Слушаем изменения (вход/выход).
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null);
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ session }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
