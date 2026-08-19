import BackButton from "../../components/BackButton";
import HeadComponent from "../../components/HeadComponent";
import Header from "../../components/Header";
import NotificationsFeed from "../../components/NotificationsFeed";
import useBack from "../../hooks/useBack";
import styles from "../../styles/Notifications.module.scss";

/* The bell icon in the header opens the same feed in a panel. This route is
   kept for deep links and for anyone landing here from outside the app. */
export default function Notifications() {
  const goBack = useBack();

  return (
    <>
      <HeadComponent title="Varsler" description="Notifications" />
      <Header />
      <div className={styles.container}>
        <BackButton onClick={goBack} />
        <div className={styles.header}>
          <h1>Varsler</h1>
          <p>Se og behandle dine varsler</p>
        </div>
        <NotificationsFeed />
      </div>
    </>
  );
}
