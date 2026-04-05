"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProfileBadge from "@/src/entities/profile/ui/ProfileBadge";
import { supabase } from "@/src/shared/api/supabase/client";
import { useGetAgencyData } from "@/src/shared/hooks/api";
import { redirect } from "next/navigation";
import React, { useState } from "react";

const SettingsProfileBadge = ({}) => {
  const [open, setOpen] = useState(false);
  const { session, otherAgency } = useGetAgencyData();

  const handleLogOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert("Ошибка при выходе из профиля: " + error.message);
    } else {
      // спецциально используем обычный redirect, нам не нужно сохранять searchParams
      redirect("/auth");
    }
  };

  return (
    <div className="relative">
      <ProfileBadge
        onClick={() => setOpen((prev) => !prev)}
        logo={session?.logo_url || ""}
        name={session?.agency_name || ""}
        dropdownRotate={open}
      />
      <div
        className={`mt-2 grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="border-1 border-border bg-muted pb-4 flex flex-col items-center px-2 w-full rounded-[38px]">
            {otherAgency.length > 0 && (
              <div className="w-full">
                {otherAgency?.map((ag) => (
                  <div className="mt-4 mb-4 mx-auto w-[90%]" key={ag.id}>
                    <ProfileBadge
                      hasDrodown={false}
                      logo={ag?.logo_url}
                      name={ag?.agency_name}
                    />
                  </div>
                ))}
                <Separator />
              </div>
            )}
            <div className="w-[85%] flex gap-2 pt-4">
              <Button variant="outline" size={"sm"}>
                Добавить команду
              </Button>
              <Button
                onClick={(e) => handleLogOut(e)}
                className="flex-1"
                variant="destructive"
                size={"sm"}
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfileBadge;
