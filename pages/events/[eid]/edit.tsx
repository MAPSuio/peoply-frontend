// Hooks
import useSWR from "swr";

// Services
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

// Assets
import EditSummaryPage from "../../../components/EditSummaryPage";
import HeadComponent from "../../../components/HeadComponent";

// Styles
import styles from "../../../styles/SummaryPage.module.scss";
import { useRouter } from "next/router";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";

const Edit = () => {
  const router = useRouter();
  const goBack = useBack();
  const { eid } = router.query;
  const { data } = useSWR(
    () => (eid ? `/events/${eid}` : false),
    fetchFromPeoplyApiJson,
  );

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <HeadComponent
        title="Rediger arrangement"
        description="Rediger ditt arrangement på Peoply"
      />
      <div className={styles.summaryContainer}>
        <div className={styles.backButtonContainer}>
          <BackButton onClick={goBack} />
        </div>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Rediger arrangement</h1>
        </div>
        <div className={styles.summaryWrapper}>
          <EditSummaryPage event={data}></EditSummaryPage>
        </div>
      </div>
    </>
  );
};

export default Edit;
