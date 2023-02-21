import {
  ButtonType,
  EventUpdate,
  EventUpdateVisibility,
  SnackTypes,
} from "../types/types";
import styles from "../styles/EventUpdateCard.module.scss";
import EyeIcon from "./svgs/EyeIcon";
import { getTimeSinceString, injectLink } from "../utils/functions";
import TrashIcon from "./svgs/TrashIcon";
import { useState } from "react";
import Modal from "./Modal";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import useSnack from "../hooks/useSnack";
import ModalButton from "./ModalButton";

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
      addSnack("Oppdatering slettet");
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
          <p key={i}>{injectLink(line)}</p>
        ))}
      </div>
      <p className={styles.date}>
        {getTimeSinceString(new Date(update.createdAt))}
      </p>
      {deleteModalOpen && (
        <Modal
          label="Slett oppdatering"
          description="Er du sikker på at du vil slette oppdateringen?"
          closeButtonOnClick={() => {
            setDeleteModalOpen(false);
          }}
        >
          <>
            <ModalButton
              text={"Slett"}
              onClick={deleteUpdate}
              type={ButtonType.DANGERSOFT}
              noShadow
            />
            <ModalButton
              text={"Avbryt"}
              onClick={() => {
                setDeleteModalOpen(false);
              }}
              type={ButtonType.SECONDARY}
              noShadow
            />
          </>
        </Modal>
      )}
    </div>
  );
}
