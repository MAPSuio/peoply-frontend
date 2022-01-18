import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import { UserProvider } from "../hooks/useUser";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Head>
        <title>Peoply</title>
      </Head>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}

export default MyApp;
