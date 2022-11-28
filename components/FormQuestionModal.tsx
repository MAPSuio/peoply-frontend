import { ButtonType } from "../types/types";
import TextInputLong from "./inputs/TextInputLong";
import Modal from "./Modal";
import ModalButton from "./ModalButton";

interface FormQuestionModalProps {
  formQuestion: string;
  formAnswer: string;
  setFormAnswer: (answer: string) => void;
  setModalOpen: (open: boolean) => void;
  onSubmit: () => void;
}

export default function FormQuestionModal({
  formQuestion,
  formAnswer,
  setFormAnswer,
  setModalOpen,
  onSubmit,
}: FormQuestionModalProps) {
  return (
    <Modal
      label={`Arrangementet har spørsmål`}
      description={formQuestion}
      closeButtonOnClick={() => setModalOpen(false)}
    >
      <>
        <TextInputLong
          label="Ditt svar til arrangøren"
          value={formAnswer}
          handleChange={(e: any) => setFormAnswer(e.target.value)}
          inputId="formAnswer"
          inputName="formAnswer"
          placeholder=""
          rows={3}
          errorMessage={"Svaret er påkrevd"}
          maxLength={150}
          valid={formAnswer.length > 0}
          validate
        />
        <ModalButton
          text="Send svar"
          onClick={() => {
            onSubmit();
            setModalOpen(false);
          }}
          disabled={formAnswer.length === 0}
        />
        <ModalButton
          text="Lukk"
          onClick={() => setModalOpen(false)}
          type={ButtonType.SECONDARY}
        />
      </>
    </Modal>
  );
}
