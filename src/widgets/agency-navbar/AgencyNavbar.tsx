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
import { useCallback, useRef, useState } from "react";

const navItems = [
  { id: "home", href: "/agency", Icon: HomeIcon },
  { id: "reports", href: "/agency", Icon: ReportsIcon },
  { id: "clients", href: "/agency", Icon: ClientsIcon },
  { id: "settings", href: "/settings", Icon: SettingsIcon },
] as const;

type NavItemId = (typeof navItems)[number]["id"] | "";

const AgencyNavbar = () => {
  const { session } = useAuth();
  const pathname = usePathname();
  const redirectParams = useRedirectParams();

  const [left, setLeft] = useState(0);
  const [width, setWidth] = useState(0);
  const [ready, setReady] = useState(false);
  const refs = useRef<Partial<Record<NavItemId, HTMLDivElement | null>>>({});
  const primaryColor = "#f78da7";

  const currentPage: NavItemId = pathname?.startsWith("/settings")
    ? "settings"
    : pathname?.startsWith("/reports")
      ? "reports"
      : pathname?.startsWith("/clients")
        ? "clients"
        : pathname?.startsWith("/agency")
          ? "home"
          : "";

  const updateIndicator = useCallback((id: NavItemId) => {
    const el = refs.current[id];
    if (el) {
      const { offsetLeft, offsetWidth } = el;
      setLeft(offsetLeft);
      setWidth(offsetWidth);
      setReady(true);
    }
  }, []);

  const setRef = useCallback(
    (id: NavItemId) => (el: HTMLDivElement | null) => {
      refs.current[id] = el;
      if (id === currentPage && el) {
        updateIndicator(id);
      }
    },
    [currentPage, updateIndicator],
  );

  if (session && !pathname?.startsWith("/auth")) {
    return (
      <div className="fixed bottom-10 flex items-center justify-center w-full">
        <div className="relative w-80 h-16 rounded-full border-1 bg-secondary cursor-pointer">
          <div className="flex items-center justify-around size-full">
            {navItems.map(({ id, href, Icon }) => (
              <div
                key={id}
                className="z-100 w-17 h-full flex items-center justify-center"
                ref={setRef(id)}
                onClick={() => {
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
              opacity: ready ? 1 : 0,
            }}
            className="absolute transition top-1 h-13.5 rounded-full bg-accent"
          />
        </div>
      </div>
    );
  }

  return;
};

export default AgencyNavbar;
