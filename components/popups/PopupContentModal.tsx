import usePopupEditor, { type PopupPayload } from "../../hooks/usePopupEditor";
import type { Popup } from "../../types/types";
import Modal from "../Modal";
import ModalButton from "../ModalButton";
import PopupFormError from "./PopupFormError";
import PopupIntervalFields from "./PopupIntervalFields";

import styles from "../../styles/PopupScheduler.module.scss";

const TITLE_MAX_LENGTH = 120;
const BODY_MAX_LENGTH = 4000;

export interface PopupContentModalProps {
  popup?: Popup;
  onClose: () => void;
  onSave: (payload: PopupPayload) => Promise<void>;
}

function saveButtonText(saving: boolean, editing: boolean) {
  if (saving) {
    return "Lagrer …";
  }

  return editing ? "Lagre innhold" : "Opprett pop-up";
}

export default function PopupContentModal({
  popup,
  onClose,
  onSave,
}: PopupContentModalProps) {
  const editor = usePopupEditor({ popup, onSave, onClose });

  return (
    <Modal
      label={popup ? "Rediger pop-up" : "Ny pop-up"}
      closeButtonOnClick={onClose}
    >
      <div className={styles.editor}>
        <label className={styles.label} htmlFor="popup-title">
          Tittel <span>{`${editor.title.length}/${TITLE_MAX_LENGTH}`}</span>
        </label>
        <input
          id="popup-title"
          className={styles.input}
          value={editor.title}
          maxLength={TITLE_MAX_LENGTH}
          onChange={(event) => editor.setTitle(event.target.value)}
          autoComplete="off"
        />
        <label className={styles.label} htmlFor="popup-body">
          Innhold <span>{`${editor.body.length}/${BODY_MAX_LENGTH}`}</span>
        </label>
        <textarea
          id="popup-body"
          className={styles.textarea}
          value={editor.body}
          maxLength={BODY_MAX_LENGTH}
          rows={7}
          placeholder="Skriv ett eller flere avsnitt …"
          onChange={(event) => editor.setBody(event.target.value)}
        />
        {!popup && (
          <PopupIntervalFields
            startsAt={editor.startsAt}
            endsAt={editor.endsAt}
            onStartsAtChange={editor.setStartsAt}
            onEndsAtChange={editor.setEndsAt}
          />
        )}
        <PopupFormError message={editor.error} conflict={editor.conflict} />
        <ModalButton
          text={saveButtonText(editor.saving, Boolean(popup))}
          onClick={editor.save}
          disabled={editor.saving}
        />
      </div>
    </Modal>
  );
}
