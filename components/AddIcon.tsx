import styles from "../styles/AddIcon.module.scss";

interface AddIconProps {
  classNames?: string;
}

export default function AddIcon({ classNames }: AddIconProps) {
  return (
    <div className={`${styles.container} ${classNames}`}>
      <span />
      <span />
    </div>
  );
}
