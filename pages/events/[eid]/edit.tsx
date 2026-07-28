// Hooks
import useSWR from "swr";
import { useEffect } from "react";

// Services

// Assets
import EditSummaryPage from "../../../components/EditSummaryPage";
import HeadComponent from "../../../components/HeadComponent";

// Styles
import styles from "../../../styles/SummaryPage.module.scss";
import { useRouter } from "next/router";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import { SnackTypes } from "../../../types/types";

const Edit = () => {
  const router = useRouter();
  const goBack = useBack();
  const { addSnack } = useSnack();
  const { eid } = router.query;
  const { data } = useSWR(() => (eid ? `/events/${eid}` : false));

  useEffect(() => {
    if (data?.readOnly) {
      addSnack(
        "Importerte ICS-arrangementer kan ikke redigeres",
        SnackTypes.ERROR,
      );
      router.push(`/events/${data.urlId}`);
    }
  }, [addSnack, data, router]);

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
