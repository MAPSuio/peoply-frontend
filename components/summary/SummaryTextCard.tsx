import type { ComponentType } from "react";

import IconCircle from "../IconCircle";
import SummaryCard from "../SummaryCard";

import styles from "../../styles/SummaryPage.module.scss";

interface SummaryTextCardProps {
  text: string | undefined;
  Icon: ComponentType<{ className?: string }>;
  largeIcon?: boolean;
  onClick: (inputId: number) => void;
}

const SummaryTextCard = ({
  text,
  Icon,
  largeIcon,
  onClick,
}: SummaryTextCardProps) => {
  return (
    <SummaryCard
      inputId={0}
      Icon={
        <IconCircle
          Icon={Icon}
          iconClassName={styles.summaryIcon}
          largeIcon={largeIcon}
        />
      }
      onClick={onClick}
    >
      <p className={styles.titleText}>{text}</p>
    </SummaryCard>
  );
};

export default SummaryTextCard;
