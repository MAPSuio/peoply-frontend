import "../styles/globals.scss";
import styles from "../styles/App.module.scss";
import type { AppProps } from "next/app";
import { UserProvider } from "../hooks/useUser";
import Header from "../components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <Header /> <Component {...pageProps} />
        </div>
      </div>
    </UserProvider>
  );
}

export default MyApp;
