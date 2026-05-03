"use client";

import { Button } from "@/components/ui/button";
import AgencyAuth from "@/src/widgets/agency-auth/AgencyAuth";

const AuthPage = () => {
  return (
    <div className="container h-[100vh] flex flex-col gap-3 items-center justify-center">
      <AgencyAuth />
    </div>
  );
};

export default AuthPage;
