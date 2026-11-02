import { useState } from "react";
import { useSWRConfig } from "swr";
import useSnack from "../../hooks/useSnack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { ButtonType, type Event, SnackTypes } from "../../types/types";
import cardStyles from "../../styles/SummaryCard.module.scss";
import styles from "../../styles/SummaryPage.module.scss";
import IconCircle from "../IconCircle";
import Modal from "../Modal";
import ModalButton from "../ModalButton";
import InfoIconSummary from "../svgs/InfoIconSummary";
import TrashIcon from "../svgs/TrashIcon";

export default function EditSignupQuestion({
  event,
  cacheKey,
}: {
  event: Event;
  cacheKey: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { addSnack } = useSnack();
  const { mutate } = useSWRConfig();

  async function removeQuestion() {
    setConfirmOpen(false);
    setPending(true);
    try {
      const body = new FormData();
      body.set("formQuestion", "");
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "PATCH",
        body,
      });
      await mutate<Event>(
        (key) => key === cacheKey || key === `/events/${event.urlId}`,
        (current) => current && { ...current, formQuestion: "" },
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
      <div
        className={`${cardStyles.summaryCardContainer} ${cardStyles.noHover} ${styles.signupQuestionCard}`}
      >
        <div className={cardStyles.iconContainer}>
          <IconCircle
            Icon={InfoIconSummary}
            iconClassName={styles.summaryIcon}
          />
          <button
            type="button"
            aria-label="Fjern spørsmålet"
            className={styles.removeQuestion}
            disabled={pending}
            onClick={() => setConfirmOpen(true)}
          >
            <TrashIcon />
          </button>
        </div>
        <p className={styles.signupQuestion}>{event.formQuestion}</p>
      </div>
      {confirmOpen && (
        <Modal
          label="Fjern spørsmålet"
          description="Er du sikker på at du vil fjerne spørsmålet for nye deltakere?"
          closeButtonOnClick={() => setConfirmOpen(false)}
        >
          <ModalButton
            text="Fjern"
            onClick={removeQuestion}
            type={ButtonType.DANGERSOFT}
            noShadow
          />
          <ModalButton
            text="Avbryt"
            onClick={() => setConfirmOpen(false)}
            type={ButtonType.SECONDARY}
            noShadow
          />
        </Modal>
      )}
    </section>
  );
}
