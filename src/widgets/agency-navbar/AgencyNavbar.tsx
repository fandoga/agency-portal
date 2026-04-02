"use client";

import { useRedirectParams } from "@/src/shared/hooks/useRedirectParams";
import {
  ClientsIcon,
  HomeIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/src/shared/icons/NavIcons";
import { useAuth } from "@/src/shared/providers/authProvider";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { id: "home", href: "/agency", Icon: HomeIcon },
  { id: "reports", href: "/agency", Icon: ReportsIcon },
  { id: "clients", href: "/agency", Icon: ClientsIcon },
  { id: "settings", href: "/settings", Icon: SettingsIcon },
] as const;

type NavItemId = (typeof navItems)[number]["id"];

const AgencyNavbar = () => {
  const { session } = useAuth();
  const pathname = usePathname();
  const redirectParams = useRedirectParams();

  const [currentPage, setCurrentPage] = useState<NavItemId>("home");
  const [left, setLeft] = useState(6);
  const [width, setWidth] = useState(68);
  const refs = useRef<Record<NavItemId, HTMLDivElement | null>>({
    home: null,
    reports: null,
    clients: null,
    settings: null,
  });
  const primaryColor = "#f78da7";

  useEffect(() => {
    const el = refs.current[currentPage];
    if (el) {
      const { offsetLeft, offsetWidth } = el;
      setLeft(offsetLeft);
      setWidth(offsetWidth);
    }
  }, [currentPage]);

  if (session && !pathname?.startsWith("/auth")) {
    return (
      <div className="fixed bottom-10 flex items-center justify-center w-full">
        <div className="relative w-80 h-16 rounded-full bg-secondary cursor-pointer">
          <div className="flex items-center justify-around size-full">
            {navItems.map(({ id, href, Icon }) => (
              <div
                key={id}
                className="z-100 w-17 h-full flex items-center justify-center"
                ref={(el) => {
                  refs.current[id] = el;
                }}
                onClick={() => {
                  setCurrentPage(id);
                  redirectParams(href);
                }}
              >
                <Icon stroke={currentPage === id ? "#fff" : primaryColor} />
              </div>
            ))}
          </div>
          <span
            style={{
              transform: `translateX(${left}px)`,
              width: `${width}px`,
            }}
            className="absolute transition top-1 w-15 h-14 rounded-full bg-accent"
          />
        </div>
      </div>
    );
  }

  return;
};

export default AgencyNavbar;
