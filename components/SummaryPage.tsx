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

/* Assets */
import PlaceholderImage from "../assets/images/cat.jpg";

/* Utils */
import { formatDateAndTime, getDateString } from "../utils/functions";

/* Styles */
import styles from "../styles/SummaryPage.module.scss";
import { ImageCaching, Visibility } from "../types/types";

interface SummaryPageProps {
  title: string;
  subTitle: string;
  currentStep: number;
  reachedStep: number;
  stepCount: number;
  buttonText: string;
  placeButtonStatic?: boolean;
  validDataMap: Map<string, boolean>;
  page: string;
  buttonOnClick: (step: number) => void;
  createEventFunction: (formData: FormData) => void;
  changeStep: (step: number) => void;
  summaryCategories: {
    id: number;
    name: string;
  }[];
  eventObject: {
    eventTitle: string;
    eventDescription: string;
    eventAddress: string;
    eventDateStart: string;
    eventDateEnd: string;
    eventHasDateEnd: boolean;
    eventTimeStart: string;
    eventTimeEnd: string;
    eventActiveCategories: number[];
    eventVisibility: Visibility;
    eventHasCapacity: boolean;
    eventCapacity: string;
    eventExtraInfoValid: boolean;
    eventImage?: File;
    eventImageValid: boolean;
    currentStep: number;
    imageStorageKey: string;
    reachedStep: number;
    imageCached: ImageCaching;
  };
}

const SummaryPage = ({
  title,
  subTitle,
  currentStep,
  reachedStep,
  stepCount,
  buttonText,
  placeButtonStatic,
  validDataMap,
  page,
  buttonOnClick,
  createEventFunction,
  changeStep,
  summaryCategories,
  eventObject,
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
      eventObject.eventDateStart,
      eventObject.eventTimeStart,
    );
    const endDate = eventObject.eventHasDateEnd
      ? formatDateAndTime(eventObject.eventDateEnd, eventObject.eventTimeEnd)
      : startDate;

    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    /* Append title and description. */
    formData.append("title", eventObject.eventTitle);
    formData.append("description", eventObject.eventDescription);

    /* Append capacity and private. */
    if (eventObject.eventHasCapacity) {
      formData.append("capacity", eventObject.eventCapacity);
    }
    formData.append("visibility", `${eventObject.eventVisibility}`);

    /* Append category IDs. */
    const categoryStrings = JSON.stringify(eventObject.eventActiveCategories);
    formData.append("categoryIds", categoryStrings);

    /* Append event image. */
    if (eventObject.eventImage) {
      formData.append("eventImage", eventObject.eventImage);
    }
  };

  const buttonStyles = getButtonStyles();

  const validData = validDataMap.get(page);

  /* Format dates for displaying in summary card. */
  const dateStringStart = getDateString(eventObject.eventDateStart);
  const dateStringEnd = eventObject.eventHasDateEnd
    ? getDateString(eventObject.eventDateEnd)
    : "";

  /* Get image source of either the supplied image or a placeholder. */
  const imageSource = eventObject.eventImage
    ? URL.createObjectURL(eventObject.eventImage)
    : PlaceholderImage;

  /* Create FormData object to be posted. */
  const formData = new FormData();
  appendEventData(formData);

  return (
    <div className={styles.container}>
      <BackButton
        onClick={() => buttonOnClick(stepCount - 2)}
        className={styles.marginBottomMedium}
      />
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
      </div>
      <div className={styles.summaryContainer}>
        <div className={styles.progressBarContainer}>
          <ProgressBar
            currentStep={currentStep}
            reachedStep={reachedStep}
            stepCount={stepCount}
            validDataMap={validDataMap}
            changeStep={changeStep}
          />
        </div>
        <SummaryCard inputId={0} Icon={<TitleCircle />} onClick={buttonOnClick}>
          <p className={styles.titleText}>{eventObject.eventTitle}</p>
        </SummaryCard>
        <SummaryCard
          inputId={1}
          Icon={<CalendarCircleSummmary />}
          onClick={buttonOnClick}
        >
          <p className={`${styles.dateText} ${styles.marginBottomVerySmall}`}>
            <span className={styles.textColorPrimary}>Start: </span>
            {`${dateStringStart}, ${eventObject.eventTimeStart}`}
          </p>
          {eventObject.eventHasDateEnd && (
            <p className={styles.dateText}>
              <span className={styles.textColorPrimary}>Slutt: </span>
              {`${dateStringEnd}, ${eventObject.eventTimeEnd}`}
            </p>
          )}
        </SummaryCard>
        <SummaryCard
          inputId={2}
          Icon={<PlaceCircleSummary />}
          onClick={buttonOnClick}
        >
          <a className={styles.placeText}>{eventObject.eventAddress}</a>
        </SummaryCard>
        <SummaryCard
          inputId={3}
          Icon={<InfoCircleSummary />}
          onClick={buttonOnClick}
        >
          <div className={styles.descriptionContainer}>
            {eventObject.eventDescription.split("\n").map((str) => (
              <p key={str} className={styles.descriptionText}>
                {str}
                <br></br>
              </p>
            ))}
          </div>
          <div className={styles.categoryContainer}>
            <p className={styles.categoryLabel}>Kategori(er)</p>
            <div className={styles.categoryTagsContainer}>
              {summaryCategories.map((cat) => (
                <Tag
                  key={cat.id}
                  id={cat.id}
                  text={cat.name}
                  activeCategories={eventObject.eventActiveCategories}
                />
              ))}
            </div>
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={4}
          Icon={<ImageCircleSummary />}
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
          Icon={<DataCircleSummary />}
          onClick={buttonOnClick}
        >
          <div className={styles.dataContainer}>
            {eventObject.eventVisibility === Visibility.UNLISTED ? (
              <div className={styles.dataItemContainer}>
                <PrivateIconSmall className={styles.dataIconDimensions} />{" "}
                <p className={styles.dataLabel}>Ikke oppført</p>
              </div>
            ) : eventObject.eventVisibility === Visibility.PUBLIC ? (
              <div className={styles.dataItemContainer}>
                <PublicIconSmall className={styles.dataIconDimensions} />
                <p className={styles.dataLabel}>Offentlig</p>
              </div>
            ) : (
              <>{/* TODO: implement Private */}</>
            )}
            {eventObject.eventHasCapacity ? (
              <div className={styles.dataItemContainer}>
                <LimitIconSmall className={styles.dataIconDimensions} />
                <p
                  className={styles.dataLabel}
                >{`${eventObject.eventCapacity} plasser`}</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <NoLimitIconSmall className={styles.dataIconDimensions} />
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
