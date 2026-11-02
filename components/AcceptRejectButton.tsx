import styles from "../styles/AcceptRejectButton.module.scss";
import CheckIcon from "./svgs/CheckIcon";
import CloseIcon from "./svgs/CloseIcon";

interface AcceptRejectButtonProps {
  checkOnClick: () => void;
  crossOnClick: () => void;
  style?: string;
}

export default function AcceptRejectButton({
  checkOnClick,
  crossOnClick,
  style,
}: AcceptRejectButtonProps) {
  return (
    <div className={`${styles.buttonContainer} ${style}`}>
      <button
        type="button"
        aria-label="Bekreft"
        className={styles.check}
        onClick={checkOnClick}
      >
        <CheckIcon className={styles.icon} />
      </button>
      <button
        type="button"
        aria-label="Avbryt"
        className={styles.cross}
        onClick={crossOnClick}
      >
        <CloseIcon className={styles.icon} />
      </button>
    </div>
  );
}
