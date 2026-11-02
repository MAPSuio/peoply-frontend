import { useState } from "react";
import { useSWRConfig } from "swr";
import useSnack from "../../hooks/useSnack";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import { type Event, SnackTypes } from "../../types/types";
import styles from "../../styles/SummaryPage.module.scss";
import MinusIcon from "../svgs/MinusIcon";

export default function EditSignupQuestion({ event }: { event: Event }) {
  const [pending, setPending] = useState(false);
  const [removed, setRemoved] = useState(false);
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
      setRemoved(true);
      await mutate(`/events/${event.id}`);
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

  if (!event.formQuestion || removed) return null;
  return (
    <div>
      <p>{event.formQuestion}</p>
      <button
        type="button"
        className={styles.addDateContainer}
        disabled={pending}
        onClick={removeQuestion}
      >
        <MinusIcon className={styles.addDateIcon} />
        <span className={styles.addDateText}>Remove signup question</span>
      </button>
    </div>
  );
}
