"use client";

import { useState } from "react";
import { LoginForm, RegisterForm } from "../features/auth/ui/LoginForm";
import { useAuth } from "../shared/providers/authProvider";
import { useGetAgencyProjectsQuery } from "../entities/project/api/projectApi";
import { useCreateNewProjectMutation } from "../entities/project/api/projectApi";
import { supabase } from "../shared/api/supabase/client";

function AgencyProjectsPanel() {
  const data = useGetAgencyProjectsQuery();

  // Для простоты пока просто отобразим сырые данные/ошибку.
  return (
    <pre className="w-full break-words  p-4 text-xs">
      {JSON.stringify(data.data, null, 2)}
    </pre>
  );
}

const handleSignOut = async () => {
  supabase.auth.signOut();
};

export default function Home() {
  const { session } = useAuth();
  const [
    createNewProject,
    { data: createdProject, isLoading: isCreating, error: createError },
  ] = useCreateNewProjectMutation();
  const [authMode, setAuthMode] = useState<"register" | "login">("register");

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white sm:items-start">
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
          <div>
            <AgencyProjectsPanel />
            <div className="mt-4 flex gap-2 items-center">
              {createError ? (
                <span className="text-xs text-red-600">
                  {typeof createError === "object" &&
                  createError !== null &&
                  "data" in createError
                    ? ((createError as { data?: { message?: string } }).data
                        ?.message ?? "Create failed")
                    : "Create failed"}
                </span>
              ) : null}
              {createdProject ? (
                <span className="text-xs text-green-600">Created</span>
              ) : null}
            </div>
          </div>
        )}
        <button onClick={() => handleSignOut()}>ВЫЙТИ</button>
      </main>
    </div>
  );
}
