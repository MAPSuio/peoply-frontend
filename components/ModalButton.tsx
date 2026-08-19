import type { ButtonType } from "../types/types";
import Button from "./Button";
import styles from "../styles/ModalButton.module.scss";

interface ModalButtonProps {
  text: string;
  onClick: () => void;
  type?: ButtonType;
  noShadow?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const ModalButton = ({
  text,
  onClick,
  type,
  noShadow = false,
  disabled = false,
  icon,
}: ModalButtonProps) => {
  return (
    <Button
      className={styles.button}
      text={text}
      onClick={onClick}
      noShadow={noShadow}
      type={type}
      disabled={disabled}
      icon={icon}
    />
  );
};

export default ModalButton;
