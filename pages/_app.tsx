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

const backgroundPatternRows = [
  "oo o oo  ooo o  oo ooo",
  "o  oo o  oo  ooo oo  o",
  "ooo o  oo o oo  o  oo",
  "oo  ooo oo  o  oo o oo",
  "o oo  o  ooo oo  oo  o",
  "oo  o oo  oo  ooo o  oo",
  "o  ooo o oo  o  oo ooo",
  "ooo  oo o  ooo  o oo  o",
  "oo o  oo  o oo  ooo  oo",
];

const BACKGROUND_PATTERN_START_X = 2.5;
const BACKGROUND_PATTERN_STEP_X = 4.2;
const BACKGROUND_PATTERN_START_Y = 16;
const BACKGROUND_PATTERN_STEP_Y = 13;

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
                <div className={styles.background} aria-hidden="true">
                  <svg
                    className={styles.backgroundPattern}
                    viewBox="0 0 100 140"
                    preserveAspectRatio="xMidYMid slice"
                  >
                    {backgroundPatternRows.flatMap((row, rowIndex) =>
                      row.split("").flatMap((character, characterIndex) => {
                        if (character !== "o") {
                          return [];
                        }

                        return (
                          <circle
                            key={`${rowIndex}-${characterIndex}`}
                            cx={
                              BACKGROUND_PATTERN_START_X +
                              characterIndex * BACKGROUND_PATTERN_STEP_X
                            }
                            cy={
                              BACKGROUND_PATTERN_START_Y +
                              rowIndex * BACKGROUND_PATTERN_STEP_Y
                            }
                            r="1.1"
                            className={styles.circle}
                          />
                        );
                      }),
                    )}
                  </svg>
                </div>
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
