// Hooks
import useSWR from "swr";

// Services

// Assets
import EditSignupQuestion from "../../../components/summary/EditSignupQuestion";
import EditSummaryPage from "../../../components/EditSummaryPage";
import HeadComponent from "../../../components/HeadComponent";

// Styles
import styles from "../../../styles/SummaryPage.module.scss";
import { useRouter } from "next/router";
import BackButton from "../../../components/BackButton";
import useBack from "../../../hooks/useBack";
import useRedirectWithReason, {
  blockingReason,
} from "../../../hooks/useRedirectWithReason";

const Edit = () => {
  const router = useRouter();
  const goBack = useBack();
  const { eid } = router.query;
  const { data, error } = useSWR(() => (eid ? `/events/${eid}` : false));

  /* SWR keeps the cached event through a failed revalidation, so only a failed
     first load redirects. A failed refresh must not discard unsaved edits.
     Without the failure case the page sat on "Loading..." forever with nothing
     telling the user why. */
  useRedirectWithReason({
    reason: blockingReason(true, [
      {
        blocked: Boolean(error) && !data,
        reason: "Kunne ikke hente arrangementet",
      },
      {
        blocked: Boolean(data?.readOnly),
        reason: "Importerte ICS-arrangementer kan ikke redigeres",
      },
    ]),
    to: `/events/${eid}`,
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
        <EditSignupQuestion event={data} cacheKey={`/events/${eid}`} />
        <EditSummaryPage event={data} />
      </div>
    </>
  );
};

export default Edit;
