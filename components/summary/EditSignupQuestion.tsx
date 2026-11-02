import { useState } from "react";
import { useSWRConfig } from "swr";
import useSnack from "../../hooks/useSnack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { type Event, SnackTypes } from "../../types/types";
import styles from "../../styles/SummaryPage.module.scss";
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";

export default function EditSignupQuestion({
  event,
  cacheKey,
}: {
  event: Event;
  cacheKey: string;
}) {
  const [pending, setPending] = useState(false);
  const { addSnack } = useSnack();
  const { mutate } = useSWRConfig();

  async function removeQuestion() {
    setPending(true);
    try {
      const body = new FormData();
      body.set("formQuestion", "");
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "PATCH",
        body,
      });
      await mutate(
        (key) => key === cacheKey || key === `/events/${event.urlId}`,
        { ...event, formQuestion: "" },
        { revalidate: false },
      );
      addSnack("Påmeldingsspørsmålet er fjernet", SnackTypes.SUCCESS);
    } catch {
      addSnack(
        "Kunne ikke fjerne påmeldingsspørsmålet. Prøv igjen.",
        SnackTypes.ERROR,
      );
    } finally {
      setPending(false);
    }
  }

  if (!event.formQuestion) return null;
  return (
    <section aria-label="Påmeldingsspørsmål" className={styles.editSummary}>
      <SummaryCard
        inputId={8}
        Icon={
          <IconCircle
            Icon={InfoIconSummary}
            iconClassName={styles.summaryIcon}
          />
        }
        editButtonVisible
        editButtonDisabled={pending}
        editButtonOnClick={() => undefined}
        onCheck={removeQuestion}
        onCross={() => undefined}
        valid={!pending}
        inputComponent={<p>Fjerne spørsmålet for nye deltakere?</p>}
      >
        <p className={styles.signupQuestion}>{event.formQuestion}</p>
      </SummaryCard>
    </section>
  );
}
