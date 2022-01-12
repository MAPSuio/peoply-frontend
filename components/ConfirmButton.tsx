import styles from "../styles/ConfirmButton.module.scss";

interface ConfirmButtonProps {
  onClick: () => void;
  text: string;
  className: string;
}

export default function ConfirmButton({
  onClick,
  text,
  className,
}: ConfirmButtonProps) {
  return (
    <button onClick={onClick} className={`${styles.button} ${className}`}>
      {text}
    </button>
  );
}
