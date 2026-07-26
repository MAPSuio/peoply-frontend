import { ButtonType } from "../types/types";
import Modal from "./Modal";
import ModalButton from "./ModalButton";

interface UnregisterConfirmationModalProps {
  eventTitle: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function UnregisterConfirmationModal({
  eventTitle,
  onConfirm,
  onClose,
}: UnregisterConfirmationModalProps) {
  return (
    <Modal
      label="Meld deg av arrangementet"
      description={`Er du sikker på at du vil melde deg av ${eventTitle}?`}
      closeButtonOnClick={onClose}
    >
      <>
        <ModalButton
          text="Meld deg av"
          onClick={onConfirm}
          type={ButtonType.DANGER}
        />
        <ModalButton
          text="Forbli påmeldt"
          onClick={onClose}
          type={ButtonType.SECONDARY}
        />
      </>
    </Modal>
  );
}
