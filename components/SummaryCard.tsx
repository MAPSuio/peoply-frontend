import { useState } from "react";
import styles from "../styles/SummaryCard.module.scss";
import { throwNotImportedError } from "../utils/functions";
import AcceptRejectButton from "./AcceptRejectButton";
import EditIconGlass from "./EditIconGlass";

interface SummaryCardProps {
  inputId: number;
  Icon: JSX.Element;
  children: React.ReactNode;
  onClick?: (inputId: number) => void;
  inputComponent?: JSX.Element;
  editButtonVisible?: boolean;
  editButtonDisabled?: boolean;
  onCheck?: () => void;
  onCross?: () => void;
  editButtonOnClick?: () => void;
  valid?: boolean;
}

const SummaryCard = ({
  inputId,
  Icon,
  children,
  onClick = () => {
    /* Cards are not always clickable. */
  },
  inputComponent,
  editButtonVisible = false,
  editButtonDisabled = false,
  editButtonOnClick = throwNotImportedError,
  onCheck = throwNotImportedError,
  onCross = throwNotImportedError,
  valid = true,
}: SummaryCardProps) => {
  const [editClosed, setEditClosed] = useState(true);

  return (
    <button
      onClick={() => onClick(inputId)}
      className={`${styles.summaryCardContainer} ${
        !editClosed && styles.noHover
      }`}
    >
      <div className={styles.iconContainer}>
        {Icon}
        {editButtonVisible && (
          <EditIconGlass
            disabled={editButtonDisabled}
            onClick={() => {
              setEditClosed(false);
              editButtonOnClick();
            }}
          />
        )}
      </div>
      {editClosed ? (
        <>{children}</>
      ) : (
        <>
          {inputComponent}
          <AcceptRejectButton
            checkOnClick={() => {
              if (valid) {
                setEditClosed(true);
                onCheck();
              }
            }}
            crossOnClick={() => {
              setEditClosed(true);
              onCross();
            }}
            style={styles.marginTopSmall}
          ></AcceptRejectButton>
        </>
      )}
    </button>
  );
};

export default SummaryCard;
