// Hooks
import useSWR from "swr";

// Services

// Assets
import EditSummaryPage from "../../../components/EditSummaryPage";
import HeadComponent from "../../../components/HeadComponent";

// Styles
import styles from "../../../styles/SummaryPage.module.scss";
import { useRouter } from "next/router";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import useRedirectWithReason from "../../../hooks/useRedirectWithReason";

const Edit = () => {
  const router = useRouter();
  const goBack = useBack();
  const { eid } = router.query;
  const { data } = useSWR(() => (eid ? `/events/${eid}` : false));

  useRedirectWithReason({
    when: Boolean(data?.readOnly),
    reason: "Importerte ICS-arrangementer kan ikke redigeres",
    to: `/events/${data?.urlId}`,
  });

  if (!data) {
    return <div>Loading...</div>;
  }

  if (data.readOnly) {
    return <></>;
  }

  return (
    <>
      <HeadComponent
        title="Rediger arrangement"
        description="Rediger ditt arrangement på Peoply"
      />
      <div className={styles.editPage}>
        <div className={styles.actionContainer}>
          <BackButton onClick={goBack} />
        </div>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Rediger arrangement</h1>
        </div>
        <EditSummaryPage event={data} />
      </div>
    </>
  );
};

export default Edit;
