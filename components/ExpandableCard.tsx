import { useState } from "react";
import styles from "../styles/ExpandableCard.module.scss";
import MinusIcon from "./svgs/MinusIcon";
import PlusIcon from "./svgs/PlusIcon";

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ExpandableCard = ({
  title,
  children,
  className,
}: ExpandableCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${styles.button} ${className ?? ""}`}>
      <button
        type="button"
        className={styles.titleContainer}
        onClick={() => setOpen(!open)}
      >
        <p className={styles.title}>{title}</p>
        {open ? (
          <MinusIcon className={styles.icon} />
        ) : (
          <PlusIcon className={styles.icon} />
        )}
      </button>
      {open && <div className={styles.childrenContainer}>{children}</div>}
    </div>
  );
};

export default ExpandableCard;
