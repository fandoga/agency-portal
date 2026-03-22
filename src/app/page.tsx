"use client";

import { useEffect, useState } from "react";
import { LoginForm, RegisterForm } from "../features/auth/components/auth";
import { useAuth } from "../shared/providers/authProvider";
import { useGetAgencyProjectsQuery } from "../entities/project/api/projectApi";
import { supabase } from "../shared/api/supabase/client";

function AgencyProjectsPanel() {
  const data = useGetAgencyProjectsQuery();

  useEffect(() => {
    console.log(data);
  }, [data]);

  // Для простоты пока просто отобразим сырые данные/ошибку.
  return (
    <pre className="w-full break-words  p-4 text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut();
};

export default function Home() {
  const { session } = useAuth();
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {!session ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={authMode === "register" ? "underline" : ""}
              >
                Регистрация
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={authMode === "login" ? "underline" : ""}
              >
                Логин
              </button>
            </div>

            {authMode === "register" ? (
              <RegisterForm onRegistered={() => setAuthMode("login")} />
            ) : (
              <LoginForm />
            )}
          </>
        ) : (
          <AgencyProjectsPanel />
        )}
        <button onClick={() => handleSignOut()}>ВЫЙТИ</button>
      </main>
    </div>
  );
}
