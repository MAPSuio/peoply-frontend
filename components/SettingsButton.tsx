/* Assets. */
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import { SettingTypes } from "../types/types";

/* Styles. */
import styles from "../styles/SettingsButton.module.scss";

interface SettingsButtonProps {
  text: string;
  isLink?: boolean;
  type?: SettingTypes;
  onClick?: () => void;
}

const SettingsButton = ({
  text,
  isLink,
  type,
  onClick,
}: SettingsButtonProps) => {
  return (
    <button className={styles.button} onClick={onClick}>
      <p
        className={`${styles.buttonText} ${
          type && type === SettingTypes.DANGER
            ? styles.danger
            : type === SettingTypes.WARNING
              ? styles.warning
              : ""
        }`}
      >
        {text}
      </p>
      {isLink && <ChevronRightIcon />}
    </button>
  );
};

export default SettingsButton;
