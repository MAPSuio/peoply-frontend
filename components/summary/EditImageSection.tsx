import { ChangeEvent } from "react";
import { StaticImageData } from "next/legacy/image";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import ImageIconSummary from "../svgs/ImageIconSummary";
import ImageInput from "../inputs/ImageInput";
import SummaryEventImage from "./SummaryEventImage";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditImageSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  tempImage: File | undefined;
  placeholderImage: string | undefined;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteImage: () => void;
  imageSource: string | StaticImageData;
}

/* Editable image card used by EditSummaryPage (event editing). */
const EditImageSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  tempImage,
  placeholderImage,
  onImageChange,
  onDeleteImage,
  imageSource,
}: EditImageSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      editButtonDisabled={editOpen}
      inputId={6}
      Icon={
        <IconCircle
          Icon={ImageIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      editButtonVisible
      inputComponent={
        <>
          <ImageInput
            value={tempImage}
            placeholder={placeholderImage}
            inputId="image"
            inputName="eventImage"
            label="Last opp et bilde til arrangementet"
            buttonLabel="Endre bilde"
            errorMessage="Bildet kan ikke være så stort."
            onChange={onImageChange}
            noExtraInfo
            card
          />
          <button
            type="button"
            className={styles.deleteImage}
            onClick={onDeleteImage}
          >
            Slett bilde
          </button>
        </>
      }
    >
      <SummaryEventImage src={imageSource} alt="Bilde for arrangementet" />
    </SummaryCard>
  );
};

export default EditImageSection;
