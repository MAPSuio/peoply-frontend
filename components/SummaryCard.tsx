import EditIcon from "./svgs/EditIcon";

import styles from "../styles/SummaryCard.module.scss";

interface SummaryCardProps {
  inputId: number;
  Icon: React.FunctionComponent;
  children: React.ReactNode;
  onClick: (inputId: number) => void;
}

const SummaryCard = ({
  inputId,
  Icon,
  children,
  onClick,
}: SummaryCardProps) => {
  return (
    <button
      onClick={() => onClick(inputId)}
      className={styles.summaryCardContainer}
    >
      <div className={styles.iconContainer}>
        <Icon />
        <EditIcon width={14} height={14} />
      </div>
      {children}
    </button>
  );
};

export default SummaryCard;
