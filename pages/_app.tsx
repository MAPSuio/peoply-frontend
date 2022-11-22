import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import { UserProvider } from "../hooks/useUser";
import { SnackbarProvider } from "../hooks/useSnack";
import Head from "next/head";
import { NotificationsProvider } from "../hooks/useNotifications";
// import { AppInsightsContext } from "@microsoft/applicationinsights-react-js";
// import { reactPlugin } from "../AzureApplicationInsight/AppInsight";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    // <AppInsightsContext.Provider value={reactPlugin}>
    <UserProvider>
      <SnackbarProvider>
        <NotificationsProvider>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
          </Head>
          <div className={styles.wrapper}>
            <div className={styles.container}>
              <Component {...pageProps} />
            </div>
          </div>
        </NotificationsProvider>
      </SnackbarProvider>
    </UserProvider>
    // </AppInsightsContext.Provider>
  );
}

export default MyApp;
