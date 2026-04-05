import type { AppProps } from "next/app";
import Provider from "@/src/app/Provider";
/**
 * Папка `src/pages` в Next — это Pages Router. Без `_app` страницы вроде `/auth/AuthPage`
 * рендерятся без `app/layout.tsx`, поэтому падают Redux/Auth. Общий провайдер — как в App Router.
 */
export default function PagesApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}
