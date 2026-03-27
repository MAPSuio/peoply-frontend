import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import Script from "next/script";
import { UserProvider } from "../hooks/useUser";
import { SnackbarProvider } from "../hooks/useSnack";
import Head from "next/head";
import { NotificationsProvider } from "../hooks/useNotifications";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import AnnouncementBanner from "../components/AnnouncementBanner";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id="7ec1d359-0bab-4bee-b214-d6f116701233"
      />
      <UserProvider>
        <SnackbarProvider>
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
              <AnnouncementBanner />
              <div className={styles.wrapper}>
                <div className={styles.container}>
                  <Component {...pageProps} />
                </div>
              </div>
            </ThemeProvider>
          </NotificationsProvider>
        </SnackbarProvider>
      </UserProvider>
      <Analytics />
    </>
  );
}

export default MyApp;
