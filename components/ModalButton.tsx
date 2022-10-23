import { ButtonType } from "../types/types";
import Button from "./Button";
import styles from "../styles/ModalButton.module.scss";

interface ModalButtonProps {
  text: string;
  onClick: () => void;
  type?: ButtonType;
  noShadow?: boolean;
}

const ModalButton = ({
  text,
  onClick,
  type,
  noShadow = false,
}: ModalButtonProps) => {
  return (
    <Button
      className={styles.button}
      text={text}
      onClick={onClick}
      noShadow={noShadow}
      type={type}
    />
  );
};

export default ModalButton;
