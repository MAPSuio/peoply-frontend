import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { UserProvider } from "../hooks/useUser";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}

export default MyApp;
