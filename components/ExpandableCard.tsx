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
    <button
      className={`${styles.button} ${className ?? ""}`}
      onClick={() => setOpen(!open)}
    >
      <div className={styles.titleContainer}>
        <p className={styles.title}>{title}</p>
        {open ? (
          <MinusIcon className={styles.icon} />
        ) : (
          <PlusIcon className={styles.icon} />
        )}
      </div>
      {open && <div className={styles.childrenContainer}>{children}</div>}
    </button>
  );
};

export default ExpandableCard;
