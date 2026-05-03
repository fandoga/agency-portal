"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useRef } from "react";

const LOADER_ID = "redirect-params-loader";
const PARAMS_STORAGE_KEY = "agency-portal:redirect-params";
const LOADER_STORAGE_KEY = "agency-portal:redirect-loader-shown";

let cachedRedirectParams = "";

type RedirectSearchParams = {
  forEach(callback: (value: string, key: string) => void): void;
  toString(): string;
} | null;

const getSessionValue = (key: string) => {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setSessionValue = (key: string, value: string) => {
  try {
    window.sessionStorage.setItem(key, value);
  } catch {}
};

const getCachedRedirectParams = () => {
  if (cachedRedirectParams) {
    return cachedRedirectParams;
  }

  cachedRedirectParams = getSessionValue(PARAMS_STORAGE_KEY) ?? "";

  return cachedRedirectParams;
};

const syncCachedRedirectParams = (searchParams: RedirectSearchParams) => {
  const params = searchParams?.toString() ?? "";

  if (!params || params === cachedRedirectParams) {
    return;
  }

  cachedRedirectParams = params;
  setSessionValue(PARAMS_STORAGE_KEY, params);
};

const shouldShowNavigationLoader = () => {
  if (getSessionValue(LOADER_STORAGE_KEY)) {
    return false;
  }

  setSessionValue(LOADER_STORAGE_KEY, "true");

  return true;
};

const showNavigationLoader = () => {
  if (typeof document === "undefined") return;

  const currentLoader = document.getElementById(LOADER_ID);

  if (currentLoader) {
    currentLoader.removeAttribute("hidden");
    return;
  }

  const loader = document.createElement("div");
  loader.id = LOADER_ID;
  loader.setAttribute("role", "status");
  loader.setAttribute("aria-live", "polite");
  loader.innerHTML = `
    <div class="redirect-params-loader__spinner" aria-hidden="true"></div>
    <span>Загрузка...</span>
  `;

  Object.assign(loader.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483647",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "14px",
    background: "var(--background, #fff)",
    color: "var(--foreground, #111)",
    fontSize: "16px",
    fontWeight: "500",
  });

  const spinner = loader.firstElementChild;

  if (spinner instanceof HTMLElement) {
    Object.assign(spinner.style, {
      width: "34px",
      height: "34px",
      border:
        "3px solid color-mix(in oklch, var(--foreground, #111) 16%, transparent)",
      borderTopColor: "var(--accent, currentColor)",
      borderRadius: "9999px",
      animation: "redirect-params-loader-spin 0.75s linear infinite",
    });
  }

  if (!document.getElementById(`${LOADER_ID}-styles`)) {
    const styles = document.createElement("style");
    styles.id = `${LOADER_ID}-styles`;
    styles.textContent = `
      @keyframes redirect-params-loader-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(loader);
};

const hideNavigationLoader = () => {
  document.getElementById(LOADER_ID)?.setAttribute("hidden", "");
};

const buildRedirectHref = (path: string, paramsString: string) => {
  const url = new URL(path, window.location.origin);

  if (url.origin !== window.location.origin || !url.pathname.startsWith("/")) {
    throw new Error(
      "useRedirectParams supports only internal application URLs",
    );
  }

  const targetParams = new URLSearchParams(url.search);
  const params = new URLSearchParams(paramsString);

  params.forEach((value, key) => {
    if (!targetParams.has(key)) {
      targetParams.append(key, value);
    }
  });

  const query = targetParams.toString();

  return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
};

export const useRedirectParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    syncCachedRedirectParams(searchParams);
    hideNavigationLoader();
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      hideNavigationLoader();
    };
  }, []);

  return useCallback(
    function redirectParams(path: string) {
      syncCachedRedirectParams(searchParams);

      const cachedParams = getCachedRedirectParams();
      const href = buildRedirectHref(path, cachedParams);
      const currentQuery = searchParams?.toString();
      const currentHref = `${pathname}${currentQuery ? `?${currentQuery}` : ""}`;

      if (href === currentHref) {
        hideNavigationLoader();
        return;
      }

      if (shouldShowNavigationLoader()) {
        showNavigationLoader();
      }

      router.prefetch(href);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      frameRef.current = window.requestAnimationFrame(() => {
        startTransition(() => {
          router.push(href);
        });
      });
    },
    [pathname, router, searchParams],
  );
};
