import styles from "../styles/AddIcon.module.scss";
import PlusIconNav from "./svgs/PlusIconNav";

interface AddIconProps {
  classNames?: string;
}

export default function AddIcon({ classNames }: AddIconProps) {
  return (
    <div className={`${styles.container} ${classNames}`}>
      <PlusIconNav />
    </div>
  );
}
