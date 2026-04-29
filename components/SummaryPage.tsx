/* Next */
import Image from "next/legacy/image";

/* Components */
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import BackButton from "./BackButton";
import SummaryCard from "./SummaryCard";
import TitleCircle from "./TitleCircle";
import Tag from "./Tag";

import CalendarCircleSummary from "./CalendarCircleSummary";
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
import PlaceholderImage from "../assets/images/cat.jpg";

/* Utils */
import { formatDateAndTime, getDateString } from "../utils/functions";

/* Styles */
import styles from "../styles/SummaryPage.module.scss";
import { EventRegistrationMode, Visibility } from "../types/types";
import { EventObjectProps } from "../pages/events/create";
import UserCircle from "./UserCircle";
import useUser from "../hooks/useUser";
import FoodIcon from "./svgs/FoodIcon";
import NoFoodIcon from "./svgs/NoFoodIcon";
import HelpCircleIcon from "./svgs/HelpCircleIcon";

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
  eventObject: EventObjectProps;
  selectedCoOrganizerNames: string[];
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
  selectedCoOrganizerNames,
}: SummaryPageProps) => {
  const { user, orgs } = useUser();
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
    const endDate =
      eventObject.eventHasDateEnd &&
      eventObject.eventDateEnd &&
      eventObject.eventTimeEnd
        ? formatDateAndTime(eventObject.eventDateEnd, eventObject.eventTimeEnd)
        : null;

    formData.set("startDate", startDate);
    endDate && formData.append("endDate", endDate);

    /* registration open and close */
    const {
      eventHasRegEnd,
      eventHasRegStart,
      eventRegStartDate,
      eventRegStartTime,
      eventRegEndDate,
      eventRegEndTime,
    } = eventObject;
    const regStart =
      eventHasRegStart && eventRegStartDate && eventRegStartTime
        ? formatDateAndTime(eventRegStartDate, eventRegStartTime)
        : null;
    const regEnd =
      eventHasRegEnd && eventRegEndDate && eventRegEndTime
        ? formatDateAndTime(eventRegEndDate, eventRegEndTime)
        : null;

    regStart && formData.set("regStart", regStart);
    regEnd && formData.set("regEnd", regEnd);

    /* Append title and description. */
    formData.set("title", eventObject.eventTitle);
    formData.set("arrangerId", eventObject.eventArrangerId);
    formData.set(
      "coOrganizerOrganizationIds",
      JSON.stringify(eventObject.eventCoOrganizerOrganizationIds),
    );
    formData.set("description", eventObject.eventDescription);

    /* Append capacity and private. */
    if (eventObject.eventHasCapacity) {
      formData.set("capacity", eventObject.eventCapacity);
    }
    formData.set("visibility", `${eventObject.eventVisibility}`);
    formData.set("hasFood", `${eventObject.eventHasFood}`);
    formData.set(
      "registrationMode",
      eventObject.eventHasExternalRegistration
        ? EventRegistrationMode.EXTERNAL
        : EventRegistrationMode.PEOPLY,
    );
    if (eventObject.eventHasExternalRegistration) {
      formData.set("externalUrl", eventObject.eventExternalUrl.trim());
    }

    /* Append participant question. */
    if (eventObject.eventHasFormQuestion && eventObject.eventFormQuestion) {
      formData.set("formQuestion", eventObject.eventFormQuestion);
    }

    /* Append category IDs. */
    const categoryStrings = JSON.stringify(eventObject.eventActiveCategories);
    formData.set("categoryIds", categoryStrings);

    /* Append event image. */
    if (eventObject.eventImage) {
      formData.set("eventImage", eventObject.eventImage);
    }

    formData.set("locationName", eventObject.eventLocationName);

    if (eventObject.eventLocation) {
      if (eventObject?.eventLocation?.poi?.name)
        formData.set("poiName", eventObject.eventLocation.poi.name);

      if (eventObject?.eventLocation?.address?.country)
        formData.set("country", eventObject.eventLocation.address.country);

      if (eventObject?.eventLocation?.address?.countryCode)
        formData.set(
          "countryCode",
          eventObject.eventLocation.address.countryCode,
        );

      if (eventObject?.eventLocation?.address?.countryCodeISO3)
        formData.set(
          "countryCodeISO3",
          eventObject.eventLocation.address.countryCodeISO3,
        );

      if (eventObject?.eventLocation?.address?.countrySubdivision)
        formData.set(
          "countrySubdivision",
          eventObject.eventLocation.address.countrySubdivision,
        );

      if (eventObject?.eventLocation?.address?.localName)
        formData.set("localName", eventObject.eventLocation.address.localName);

      if (eventObject?.eventLocation?.address?.municipality)
        formData.set(
          "municipality",
          eventObject.eventLocation.address.municipality,
        );

      if (eventObject?.eventLocation?.address?.postalCode)
        formData.set(
          "postalCode",
          eventObject.eventLocation.address.postalCode,
        );

      if (eventObject?.eventLocation?.address?.streetName)
        formData.set(
          "streetName",
          eventObject.eventLocation.address.streetName,
        );

      if (eventObject?.eventLocation?.address?.streetNumber)
        formData.set(
          "streetNumber",
          eventObject.eventLocation.address.streetNumber,
        );

      if (eventObject?.eventLocation?.address?.freeformAddress)
        formData.set(
          "freeformAddress",
          eventObject.eventLocation.address.freeformAddress,
        );

      if (eventObject?.eventLocation?.position?.lat)
        formData.set(
          "latitude",
          eventObject.eventLocation.position.lat.toString(),
        );

      if (eventObject?.eventLocation?.position?.lon)
        formData.set(
          "longitude",
          eventObject.eventLocation.position.lon.toString(),
        );
    }
  };

  const buttonStyles = getButtonStyles();

  const validData = validDataMap.get(page);

  /* Format dates for displaying in summary card. */
  const dateStringStart = getDateString(eventObject.eventDateStart);
  const dateStringEnd =
    eventObject.eventHasDateEnd && eventObject.eventDateEnd
      ? getDateString(eventObject.eventDateEnd)
      : "";

  /* Get image source of either the supplied image or a placeholder. */
  const imageSource = eventObject.eventImage
    ? URL.createObjectURL(eventObject.eventImage)
    : PlaceholderImage;

  /* Create FormData object to be posted. */
  const formData = new FormData();
  appendEventData(formData);

  const arrangerName = (() => {
    if (user?.arrangerId === eventObject.eventArrangerId) {
      return `${user.firstName} ${user.lastName}`;
    }

    return orgs?.find((org) => org.arrangerId === eventObject.eventArrangerId)
      ?.name;
  })();

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
        <SummaryCard
          inputId={0}
          Icon={<TitleCircle className={styles.summaryIcon} />}
          onClick={buttonOnClick}
        >
          <p className={styles.titleText}>{eventObject.eventTitle}</p>
        </SummaryCard>
        {eventObject.eventArrangerId && (
          <SummaryCard
            inputId={0}
            Icon={<UserCircle large className={styles.summaryIcon} />}
            onClick={buttonOnClick}
          >
            <p className={styles.titleText}>{arrangerName}</p>
          </SummaryCard>
        )}
        {selectedCoOrganizerNames.length > 0 && (
          <SummaryCard
            inputId={0}
            Icon={<UserCircle large className={styles.summaryIcon} />}
            onClick={buttonOnClick}
          >
            <p className={styles.titleText}>
              {selectedCoOrganizerNames.join(" · ")}
            </p>
          </SummaryCard>
        )}
        <SummaryCard
          inputId={1}
          Icon={<CalendarCircleSummary className={styles.summaryIcon} />}
          onClick={buttonOnClick}
        >
          <p
            className={`${styles.dateText} ${
              eventObject.eventHasDateEnd && styles.marginBottomVerySmall
            }`}
          >
            <span className={styles.textColorPrimary}>Start: </span>
            {`${dateStringStart}, ${eventObject.eventTimeStart}`}
          </p>
          {eventObject.eventHasDateEnd && (
            <p
              className={`${styles.dateText} ${
                eventObject.eventHasRegStart && styles.marginBottomVerySmall
              }`}
            >
              <span className={styles.textColorPrimary}>Slutt: </span>
              {`${dateStringEnd}, ${eventObject.eventTimeEnd}`}
            </p>
          )}
          {eventObject.eventHasRegStart && (
            <p
              className={`${styles.dateText} ${
                eventObject.eventHasRegEnd && styles.marginBottomVerySmall
              }`}
            >
              <span className={styles.textColorPrimary}>Påmelding åpner: </span>
              {`${getDateString(eventObject.eventRegStartDate)}, ${
                eventObject.eventRegStartTime
              }`}
            </p>
          )}
          {eventObject.eventHasRegEnd && (
            <p className={`${styles.dateText} ${styles.marginBottomVerySmall}`}>
              <span className={styles.textColorPrimary}>
                Påmelding stenger:{" "}
              </span>
              {`${getDateString(eventObject.eventRegEndDate)}, ${
                eventObject.eventRegEndTime
              }`}
            </p>
          )}
        </SummaryCard>
        <SummaryCard
          inputId={2}
          Icon={<PlaceCircleSummary className={styles.summaryIcon} />}
          onClick={buttonOnClick}
        >
          <p className={`${styles.placeText} ${styles.marginBottomSmall}`}>
            {eventObject.eventLocationName}
          </p>
          {eventObject.eventLocation?.poi?.name && (
            <a className={`${styles.placeText} ${styles.address}`}>
              {eventObject.eventLocation?.poi?.name}
            </a>
          )}
          {eventObject.eventLocation?.address?.freeformAddress && (
            <a className={`${styles.placeText} ${styles.address}`}>
              {eventObject.eventLocation?.address?.freeformAddress}
            </a>
          )}
        </SummaryCard>
        <SummaryCard
          inputId={3}
          Icon={<InfoCircleSummary className={styles.summaryIcon} />}
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
                  text={cat.name}
                  active={eventObject.eventActiveCategories.includes(cat.id)}
                  noShadow
                />
              ))}
            </div>
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={4}
          Icon={<ImageCircleSummary className={styles.summaryIcon} />}
          onClick={buttonOnClick}
        >
          <div className={styles.imageContainer}>
            <Image
              src={imageSource}
              alt="Bilde av arrangementet"
              objectFit="cover"
              layout="fill"
              objectPosition="center"
            />
          </div>
        </SummaryCard>
        <SummaryCard
          inputId={5}
          Icon={<DataCircleSummary className={styles.summaryIcon} />}
          onClick={buttonOnClick}
        >
          <div className={styles.dataContainer}>
            {eventObject.eventVisibility === Visibility.UNLISTED ? (
              <div className={styles.dataItemContainer}>
                <PrivateIconSmall className={styles.dataIcon} />{" "}
                <p className={styles.dataLabel}>Ikke oppført</p>
              </div>
            ) : eventObject.eventVisibility === Visibility.PUBLIC ? (
              <div className={styles.dataItemContainer}>
                <PublicIconSmall className={styles.dataIcon} />
                <p className={styles.dataLabel}>Offentlig</p>
              </div>
            ) : (
              <>{/* TODO: implement Private */}</>
            )}
            {eventObject.eventHasCapacity ? (
              <div className={styles.dataItemContainer}>
                <LimitIconSmall className={styles.dataIcon} />
                <p
                  className={styles.dataLabel}
                >{`${eventObject.eventCapacity} plasser`}</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <NoLimitIconSmall className={styles.dataIcon} />
                <p className={styles.dataLabel}>Ingen kapasitet</p>
              </div>
            )}
            {eventObject.eventHasFood ? (
              <div className={styles.dataItemContainer}>
                <FoodIcon className={styles.dataIcon} />
                <p className={styles.dataLabel}>Det serveres mat</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <NoFoodIcon className={styles.dataIcon} />
                <p className={styles.dataLabel}>Ingen matservering</p>
              </div>
            )}
            {eventObject.eventFormQuestion && (
              <div className={styles.dataItemContainer}>
                <HelpCircleIcon className={styles.dataIcon} />
                <p className={styles.dataLabel}>
                  {eventObject.eventFormQuestion.length > 30
                    ? eventObject.eventFormQuestion.slice(0, 29) + "...?"
                    : eventObject.eventFormQuestion}
                </p>
              </div>
            )}
            {eventObject.eventHasExternalRegistration && (
              <div className={styles.dataItemContainer}>
                <LinkIcon className={styles.dataIcon} />
                <p
                  className={styles.dataLabel}
                  style={{ overflowWrap: "anywhere" }}
                >
                  Ekstern påmelding: {eventObject.eventExternalUrl}
                </p>
              </div>
            )}
          </div>
        </SummaryCard>
      </div>
      <Button
        onClick={() => createEventFunction(formData)}
        text={buttonText}
        className={buttonStyles}
        disabled={!validData}
      />
    </div>
  );
};

export default SummaryPage;
