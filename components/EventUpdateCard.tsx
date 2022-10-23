import { EventUpdate, EventUpdateVisibility, SnackTypes } from "../types/types";
import styles from "../styles/EventUpdateCard.module.scss";
import EyeIcon from "./svgs/EyeIcon";
import { getTimeSinceString } from "../utils/functions";
import TrashIcon from "./svgs/TrashIcon";
import { useState } from "react";
import Modal from "./Modal";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import useSnack from "../hooks/useSnack";

interface EventUpdateCardProps {
  update: EventUpdate;
  isArranger: boolean;
  mutateUpdates?: () => void;
}

export default function EventUpdateCard({
  update,
  isArranger,
  mutateUpdates,
}: EventUpdateCardProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { addSnack } = useSnack();

  async function deleteUpdate() {
    try {
      await fetchFromPeoplyApiJson(
        `/events/${update.eventId}/update/${update.id}`,
        {
          method: "DELETE",
        },
      );
      addSnack("Oppdatering slettet", SnackTypes.WARNING);
      mutateUpdates && mutateUpdates();
    } catch (e) {
      addSnack("Kunne ikke slette oppdatering", SnackTypes.ERROR);
    }
    setDeleteModalOpen(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.subject}>
          <h2>{update.subject}</h2>
          {isArranger && (
            <button
              className={styles.deleteButton}
              onClick={() => setDeleteModalOpen(true)}
            >
              <TrashIcon />
            </button>
          )}
        </div>
        {update.visibility === EventUpdateVisibility.GOING && (
          <div className={styles.visibility}>
            Kun for deltakere
            <EyeIcon />
          </div>
        )}
      </div>
      <div className={styles.body}>
        {update.body.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <p className={styles.date}>
        {getTimeSinceString(new Date(update.createdAt))}
      </p>
      {deleteModalOpen && (
        <Modal
          label="Slett oppdatering"
          description="Er du sikker på at du vil slette oppdateringen?"
          buttonText="Slett"
          danger
          buttonOnClick={deleteUpdate}
          secondaryButtonText="Avbryt"
          secondaryButtonOnClick={() => {
            setDeleteModalOpen(false);
          }}
          closeButtonOnClick={() => {
            setDeleteModalOpen(false);
          }}
        ></Modal>
      )}
    </div>
  );
}
