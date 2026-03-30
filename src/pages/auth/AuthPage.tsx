"use client";

import { Button } from "@/components/ui/button";
import AgencyAuth from "@/src/widgets/agency-auth/AgencyAuth";

const AuthPage = () => {
  return (
    <div className="container h-[100vh] flex flex-col gap-3 items-center justify-center">
      <Button
        size="lg"
        className="w-full text-md bg-brand-600 shadow-lg shadow-rose-700/50"
      >
        Войти как Клиент
      </Button>
      <AgencyAuth />
    </div>
  );
};

export default AuthPage;
