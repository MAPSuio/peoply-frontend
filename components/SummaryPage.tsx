/* Next */
import Image from "next/image";

/* Components */
import ProgressBar from "./ProgressBar";
import PrimaryButton from "./PrimaryButton";
import BackButton from "./BackButton";
import SummaryCard from "./SummaryCard";
import TitleCircle from "./TitleCircle";
import Tag from "./Tag";

import CalendarCircleSummmary from "./CalendarCircleSummary";
import DataCircleSummary from "./DataCircleSummary";
import PlaceCircleSummary from "./PlaceCircleSummary";
import InfoCircleSummary from "./InfoCircleSummary";
import ImageCircleSummary from "./ImageCircleSummary";
import PrivateIconSmall from "./svgs/PrivateIconSmall";
import PublicIconSmall from "./svgs/PublicIconSmall";
import NoLimitIconSmall from "./svgs/NoLimitIconSmall";
import LimitIconSmall from "./svgs/LimitIconSmall";
import LinkIcon from "./svgs/LinkIcon";

/* Assets */
import PlaceholderImage from "../assets/images/max.jpg";

/* Utils */
import { formatDateAndTime, getDateString } from "../utils/functions";

/* Styles */
import styles from "../styles/SummaryPage.module.scss";

interface SummaryPageProps {
  title: string;
  subTitle: string;
  currentStep: number;
  stepCount: number;
  buttonText: string;
  placeButtonStatic?: boolean;
  validData: boolean;
  buttonOnClick: (step: number) => void;
  createEventFunction: (formData: FormData) => void;
  eventData: {
    evTitle: string;
    evDescription: string;
    evAddress: string;
    evDateStart: string;
    evDateEnd: string;
    evTimeStart: string;
    evTimeEnd: string;
    evHasDateEnd: boolean;
    evCategories: Array<{ category_id: number; category: string }>;
    evActiveCategories: Array<number>;
    evPrivate: boolean;
    evHasCapacity: boolean;
    evCapacity: string;
    evImage?: File;
  };
}

const SummaryPage = ({
  title,
  subTitle,
  currentStep,
  stepCount,
  buttonText,
  placeButtonStatic,
  validData,
  buttonOnClick,
  createEventFunction,
  eventData,
}: SummaryPageProps) => {
  const getButtonStyles = () => {
    if (placeButtonStatic) {
      return `${styles.primaryButton} ${styles.placeStatic}`;
    } else {
      return styles.primaryButton;
    }
  };

  const appendEventData = (formData: FormData) => {
    /* Append correctly formatted dates with timestamp. */
    const startDate = formatDateAndTime(
      eventData.evDateStart,
      eventData.evTimeStart,
    );
    const endDate = eventData.evHasDateEnd
      ? formatDateAndTime(eventData.evDateEnd, eventData.evTimeEnd)
      : startDate;

    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    /* Append title and description. */
    formData.append("title", eventData.evTitle);
    formData.append("description", eventData.evDescription);

    /* Append capacity and private. */
    if (eventData.evHasCapacity) {
      formData.append("capacity", eventData.evCapacity);
    }
    formData.append("private", `${eventData.evPrivate}`);

    /* Append category IDs. */
    const categoryStrings = JSON.stringify(eventData.evActiveCategories);
    formData.append("category_ids", categoryStrings);

    /* Append event image. */
    if (eventData.evImage) {
      formData.append("eventImage", eventData.evImage);
    }
  };

  const buttonStyles = getButtonStyles();

  /* Format dates for displaying in summary card. */
  const dateStringStart = getDateString(eventData.evDateStart);
  const dateStringEnd = eventData.evHasDateEnd
    ? getDateString(eventData.evDateEnd)
    : "";

  /* Get image source of either the supplied image or a placeholder. */
  const imageSource = eventData.evImage
    ? URL.createObjectURL(eventData.evImage)
    : PlaceholderImage;

  /* Create FormData object to be posted. */
  const formData = new FormData();
  appendEventData(formData);

  return (
    <div className={styles.container}>
      <BackButton
        onClick={() => buttonOnClick(stepCount - 1)}
        className={styles.marginBottomMedium}
      />
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
        <ProgressBar currentStep={currentStep} stepCount={stepCount} />
      </div>
      <div className={styles.summaryContainer}>
        <SummaryCard inputId={0} Icon={TitleCircle} onClick={buttonOnClick}>
          <p className={styles.titleText}>{eventData.evTitle}</p>
        </SummaryCard>
        <SummaryCard
          inputId={1}
          Icon={CalendarCircleSummmary}
          onClick={buttonOnClick}
        >
          <p className={`${styles.dateText} ${styles.marginBottomVerySmall}`}>
            <span className={styles.textColorPrimary}>Start: </span>
            {`${dateStringStart}, ${eventData.evTimeStart}`}
          </p>
          {eventData.evHasDateEnd && (
            <p className={styles.dateText}>
              <span className={styles.textColorPrimary}>Slutt: </span>
              {`${dateStringEnd}, ${eventData.evTimeEnd}`}
            </p>
          )}
        </SummaryCard>
        <SummaryCard
          inputId={2}
          Icon={PlaceCircleSummary}
          onClick={buttonOnClick}
        >
          <div className={styles.addressContainer}>
            <a className={styles.placeText}>{eventData.evAddress}</a>
            {<LinkIcon />}
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={3}
          Icon={InfoCircleSummary}
          onClick={buttonOnClick}
        >
          <div className={styles.descriptionContainer}>
            {eventData.evDescription.split("\n").map((str) => (
              <p key={str} className={styles.descriptionText}>
                {str}
                <br></br>
              </p>
            ))}
          </div>
          <div className={styles.categoryContainer}>
            <p className={styles.categoryLabel}>Kategori(er)</p>
            <div className={styles.categoryTagsContainer}>
              {eventData.evCategories.map((cat) => (
                <Tag
                  key={cat.category_id}
                  id={cat.category_id}
                  text={cat.category}
                  activeCategories={eventData.evActiveCategories}
                />
              ))}
            </div>
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={4}
          Icon={ImageCircleSummary}
          onClick={buttonOnClick}
        >
          <div className={styles.imageContainer}>
            <Image
              src={imageSource}
              alt="En sykt kjekk kar"
              objectFit="cover"
              layout="fill"
              objectPosition="center"
            />
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={5}
          Icon={DataCircleSummary}
          onClick={buttonOnClick}
        >
          <div className={styles.dataContainer}>
            {eventData.evPrivate ? (
              <div className={styles.dataItemContainer}>
                <PrivateIconSmall /> <p className={styles.dataLabel}>Privat</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <PublicIconSmall />
                <p className={styles.dataLabel}>Offentlig</p>
              </div>
            )}
            {eventData.evHasCapacity ? (
              <div className={styles.dataItemContainer}>
                <LimitIconSmall />
                <p
                  className={styles.dataLabel}
                >{`${eventData.evCapacity} plasser`}</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <NoLimitIconSmall />
                <p className={styles.dataLabel}>Ingen kapasitet</p>
              </div>
            )}
          </div>
        </SummaryCard>
      </div>
      <PrimaryButton
        onClick={() => createEventFunction(formData)}
        text={buttonText}
        className={buttonStyles}
        disabled={!validData}
      />
    </div>
  );
};

export default SummaryPage;
