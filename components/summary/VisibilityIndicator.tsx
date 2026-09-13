/* Types */
import { Visibility } from "../../types/types";

/* Icons */
import UnlistedIconSmall from "../svgs/UnlistedIconSmall";
import PublicIconSmall from "../svgs/PublicIconSmall";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface VisibilityIndicatorProps {
  visibility: Visibility;
}

/* Shared between SummaryPage and EditSummaryPage: shows the visibility
icon and label used inside each page's data/visibility summary card. */
const VisibilityIndicator = ({ visibility }: VisibilityIndicatorProps) => {
  return visibility === Visibility.UNLISTED ? (
    <div className={styles.dataItemContainer}>
      <UnlistedIconSmall className={styles.dataIcon} />{" "}
      <p className={styles.dataLabel}>Ikke oppført</p>
    </div>
  ) : visibility === Visibility.PUBLIC ? (
    <div className={styles.dataItemContainer}>
      <PublicIconSmall className={styles.dataIcon} />
      <p className={styles.dataLabel}>Offentlig</p>
    </div>
  ) : /* TODO: implement Private */ null;
};

export default VisibilityIndicator;
