import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import "@fullcalendar/react/themes/classic/palette.css";
import "react-day-picker/style.css";
import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import Script from "next/script";
import { useEffect, useState } from "react";
import { UserProvider } from "../hooks/useUser";
import { SnackbarProvider } from "../hooks/useSnack";
import Head from "next/head";
import { NotificationsProvider } from "../hooks/useNotifications";
import { ThemeProvider } from "next-themes";
import { SerwistProvider } from "@serwist/next/react";
import GlobalPopups from "../components/GlobalPopups";
import ErrorBoundary from "../components/ErrorBoundary";
import SwrProvider from "../components/SwrProvider";
import {
  BACKGROUND_PATTERN_EVENT,
  getBackgroundPatternEnabled,
} from "../utils/backgroundPattern";

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
  const [backgroundPatternEnabled, setBackgroundPatternEnabled] = useState(() =>
    getBackgroundPatternEnabled(),
  );

  useEffect(() => {
    const updatePreference = () => {
      setBackgroundPatternEnabled(getBackgroundPatternEnabled());
    };

    const handlePreferenceChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "boolean") {
        setBackgroundPatternEnabled(event.detail);
      }
    };

    updatePreference();
    window.addEventListener(BACKGROUND_PATTERN_EVENT, handlePreferenceChange);
    window.addEventListener("storage", updatePreference);

    return () => {
      window.removeEventListener(
        BACKGROUND_PATTERN_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener("storage", updatePreference);
    };
  }, []);

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
                <GlobalPopups />
                <div className={styles.wrapper}>
                  {backgroundPatternEnabled && (
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
                                // biome-ignore lint/suspicious/noArrayIndexKey: static decorative pattern generated once per render, rows/characters never reorder.
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
                  )}
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
