/* Components */
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import BackButton from "./BackButton";
import TitleSummarySection from "./summary/TitleSummarySection";
import PersonSummarySection from "./summary/PersonSummarySection";
import DateTimeSummarySection from "./summary/DateTimeSummarySection";
import PlaceSummarySection from "./summary/PlaceSummarySection";
import DescriptionSummarySection from "./summary/DescriptionSummarySection";
import ImageSummarySection from "./summary/ImageSummarySection";
import DataSummarySection from "./summary/DataSummarySection";

/* Assets */
import PlaceholderImage from "../assets/images/cat.jpg";

/* Utils */
import { formatDateAndTime } from "../utils/functions";

/* Styles */
import styles from "../styles/SummaryPage.module.scss";
import { EventRegistrationMode } from "../types/types";
import { EventObjectProps } from "../pages/events/create";
import useUser from "../hooks/useUser";

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
    if (eventObject.eventCoOrganizerOrganizationIds.length > 0) {
      formData.set(
        "coOrganizerOrganizationIds",
        JSON.stringify(eventObject.eventCoOrganizerOrganizationIds),
      );
    }
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
        <TitleSummarySection
          title={eventObject.eventTitle}
          onClick={buttonOnClick}
        />
        {eventObject.eventArrangerId && (
          <PersonSummarySection text={arrangerName} onClick={buttonOnClick} />
        )}
        {selectedCoOrganizerNames.length > 0 && (
          <PersonSummarySection
            text={selectedCoOrganizerNames.join(" · ")}
            onClick={buttonOnClick}
          />
        )}
        <DateTimeSummarySection
          eventObject={eventObject}
          onClick={buttonOnClick}
        />
        <PlaceSummarySection
          eventObject={eventObject}
          onClick={buttonOnClick}
        />
        <DescriptionSummarySection
          eventObject={eventObject}
          summaryCategories={summaryCategories}
          onClick={buttonOnClick}
        />
        <ImageSummarySection
          imageSource={imageSource}
          onClick={buttonOnClick}
        />
        <DataSummarySection eventObject={eventObject} onClick={buttonOnClick} />
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
