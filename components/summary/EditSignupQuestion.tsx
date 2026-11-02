import { useState } from "react";
import { useSWRConfig } from "swr";
import useSnack from "../../hooks/useSnack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { type Event, SnackTypes } from "../../types/types";
import styles from "../../styles/SummaryPage.module.scss";
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";

export default function EditSignupQuestion({ event }: { event: Event }) {
  const [pending, setPending] = useState(false);
  const [removed, setRemoved] = useState<string>();
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
      setRemoved(event.id);
      void mutate(`/events/${event.id}`).catch(() => undefined);
      addSnack("Signup question removed", SnackTypes.SUCCESS);
    } catch {
      addSnack(
        "Could not remove the signup question. Try again.",
        SnackTypes.ERROR,
      );
    } finally {
      setPending(false);
    }
  }

  if (!event.formQuestion || removed === event.id) return null;
  return (
    <section aria-label="Signup question" className={styles.editSummary}>
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
        inputComponent={
          <p>Remove the signup question for future participants?</p>
        }
      >
        <p>{event.formQuestion}</p>
      </SummaryCard>
    </section>
  );
}
