import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        response = NextResponse.next({ request: { headers: req.headers } });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        response = NextResponse.next({ request: { headers: req.headers } });
        response.cookies.delete({ name, ...options });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const isAuthPage = req.nextUrl.pathname === "/auth";
  const defaultPage = req.nextUrl.pathname === "/";
  const isChooseAgencyPage = req.nextUrl.pathname.startsWith(
    "/auth/choose-agency",
  );
  const selectedAgencyId = req.nextUrl.searchParams.get("agency_id");

  // Перенос на логин если нету сессии
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }

  // Не даем зайти на логин если уже есть сессия
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/agency", req.url));
  }

  // Перенос на выбор команды если в url нет agency_id
  if (!selectedAgencyId && !isChooseAgencyPage && user) {
    return NextResponse.redirect(new URL("/auth/choose-agency", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
