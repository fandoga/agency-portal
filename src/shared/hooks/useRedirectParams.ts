import { redirect, useSearchParams } from "next/navigation";

export const useRedirectParams = () => {
  const searchParams = useSearchParams();
  return function redirectParams(path: string) {
    const params = new URLSearchParams(searchParams ?? "");
    redirect(`${path}?${params.toString()}`);
  };
};
