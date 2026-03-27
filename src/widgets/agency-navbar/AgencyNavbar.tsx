"use client";

import {
  ClientsIcon,
  HomeIcon,
  ReportsIcon,
  SettingsIcon,
} from "@/src/shared/icons/NavIcons";
import React, { useEffect, useRef, useState } from "react";

const navItems = [
  { id: "home", Icon: HomeIcon },
  { id: "reports", Icon: ReportsIcon },
  { id: "clients", Icon: ClientsIcon },
  { id: "settings", Icon: SettingsIcon },
] as const;

type NavItemId = (typeof navItems)[number]["id"];

const AgencyNavbar = () => {
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

  return (
    <div className="fixed bottom-10 flex items-center justify-center w-full">
      <div className="relative w-80 h-16 rounded-full bg-secondary cursor-pointer">
        <div className="flex items-center justify-around size-full">
          {navItems.map(({ id, Icon }) => (
            <div
              key={id}
              className="z-100 w-17 h-full flex items-center justify-center"
              ref={(el) => {
                refs.current[id] = el;
              }}
              onClick={() => setCurrentPage(id)}
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
};

export default AgencyNavbar;
