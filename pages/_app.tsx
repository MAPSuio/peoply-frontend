import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "react-day-picker/style.css";
import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import Script from "next/script";
import { UserProvider } from "../hooks/useUser";
import { SnackbarProvider } from "../hooks/useSnack";
import Head from "next/head";
import { NotificationsProvider } from "../hooks/useNotifications";
import { ThemeProvider } from "next-themes";
import { SerwistProvider } from "@serwist/next/react";
import GlobalPopups from "../components/GlobalPopups";
import { mainFont, monoFont } from "../styles/fonts";
import ErrorBoundary from "../components/ErrorBoundary";
import SwrProvider from "../components/SwrProvider";
import BackgroundPattern from "../components/BackgroundPattern";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    /* Replaces next-pwa's `register: true`, which injected the registration
       script into the build. Serwist registers from the client instead, so it
       has to be mounted here. `disable` mirrors the old config: no service
       worker in development, where `serwist build` has not run and /sw.js does
       not exist. */
    <SerwistProvider
      swUrl="/sw.js"
      disable={process.env.NODE_ENV === "development"}
    >
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="7ec1d359-0bab-4bee-b214-d6f116701233"
      />
      <UserProvider>
        <SnackbarProvider>
          <SwrProvider>
            <NotificationsProvider>
              <ThemeProvider
                attribute="class"
                themes={["light", "dark", "night"]}
              >
                <Head>
                  <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                  />
                </Head>
                {/* The variables go on <html> rather than on the wrapper
                    below, so GlobalPopups and the snackbar - which render as
                    siblings of it - are covered too. This is server rendered,
                    so the font is in place at first paint. */}
                <style jsx global>{`
                  html {
                    --font-main: ${mainFont.style.fontFamily};
                    --font-mono: ${monoFont.style.fontFamily};
                  }
                `}</style>
                <GlobalPopups />
                <div className={styles.wrapper}>
                  <BackgroundPattern />
                  <div className={styles.container}>
                    <ErrorBoundary>
                      <Component {...pageProps} />
                    </ErrorBoundary>
                  </div>
                </div>
              </ThemeProvider>
            </NotificationsProvider>
          </SwrProvider>
        </SnackbarProvider>
      </UserProvider>
    </SerwistProvider>
  );
}

export default MyApp;
