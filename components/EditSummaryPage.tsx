// Next
import Image from "next/legacy/image";

// Types
import {
  ButtonType,
  Event,
  EventCategory,
  SnackTypes,
  Visibility,
} from "../types/types";

// Icons
import TitleCircle from "./TitleCircle";
import PlaceCircleSummary from "./PlaceCircleSummary";
import InfoCircleSummary from "./InfoCircleSummary";
import RadioInput from "./inputs/RadioInput";
import UnlistedIcon from "../components/svgs/UnlistedIcon";
import PublicIcon from "../components/svgs/PublicIcon";
import PrivateIconSmall from "./svgs/PrivateIconSmall";
import PublicIconSmall from "./svgs/PublicIconSmall";
import PlusIcon from "./svgs/PlusIcon";
import ImageCircleSummary from "./ImageCircleSummary";
import DataCircleSummary from "./DataCircleSummary";
import PlaceholderImage from "../assets/images/cat.jpg";
import MinusIcon from "./svgs/MinusIcon";

// Components
import SummaryCard from "./SummaryCard";
import CalendarCircleSummary from "./CalendarCircleSummary";
import TextInput from "./inputs/TextInput";
import DateInput from "./inputs/DateInput";
import TimeInput from "./inputs/TimeInput";
import CategoryInput from "./inputs/CategoryInput";
import Tag from "./Tag";
import Button from "./Button";
import ImageInput from "./inputs/ImageInput";
import TimeView from "./TimeView";
import Modal from "./Modal";
import TextInputLong from "./inputs/TextInputLong";

// Styles
import styles from "../styles/SummaryPage.module.scss";

// Hooks
import { useRouter } from "next/router";
import useSnack from "../hooks/useSnack";
import useSWR from "swr";

// Utils
import {
  removeTimezone,
  getISODateString,
  getISOTimeString,
  addTimezone,
  laterThan,
  latherThanNowISOString,
} from "../utils/functions";
import { fetchFromPeoplyApiJson } from "../services/fetchers";
import React, { ChangeEvent, useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import { Models } from "azure-maps-rest";
import TextInputLocationSelect from "./inputs/TextInputLocationSelect";
import ModalButton from "./ModalButton";

function getCategories(categories: EventCategory[] | undefined) {
  if (categories === undefined) {
    return [];
  }
  return categories.map((category) => {
    return category.category.id;
  });
}

interface EditSummaryPageProps {
  event: Event;
}

interface EventObjectProps {
  visibility: Visibility;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  regStart?: string;
  regEnd?: string;
  categoryIds: number[];
  capacity?: number | null;
  eventImage?: File;
  deleteImage: boolean;
  locationName: string;
  poiName?: string;
  country?: string;
  countryCode?: string;
  countryCodeISO3?: string;
  countrySubdivision?: string;
  localName?: string;
  municipality?: string;
  postalCode?: string;
  streetName?: string;
  streetNumber?: string;
  freeformAddress?: string;
  latitude?: number | string;
  longitude?: number | string;
}

const EditSummaryPage = ({ event }: EditSummaryPageProps) => {
  const { ipInfo } = useUser();

  const [eventObject, setEventObject] = useState<EventObjectProps>({
    title: event.title,
    description: event.description,
    startDate: removeTimezone(event.startDate.toString()),
    endDate: event.endDate
      ? removeTimezone(event.endDate.toString())
      : undefined,
    regStart: event.regStart
      ? removeTimezone(event.regStart.toString())
      : undefined,
    regEnd: event.regEnd ? removeTimezone(event.regEnd.toString()) : undefined,
    categoryIds: getCategories(event.eventCategories),
    visibility: event.visibility,
    capacity: event.capacity,
    eventImage: undefined,
    deleteImage: false,
    locationName: event.locationName,
    poiName: event.poiName,
    country: event.country,
    countryCode: event.countryCode,
    countryCodeISO3: event.countryCodeISO3,
    countrySubdivision: event.countrySubdivision,
    localName: event.localName,
    municipality: event.municipality,
    postalCode: event.postalCode,
    streetName: event.streetName,
    streetNumber: event.streetNumber,
    freeformAddress: event.freeformAddress,
    latitude: event.latitude,
    longitude: event.longitude,
  });
  /*
  When editing changes are written to this state.
  The changes are written to the eventObject state when the user clicks the accept button.
  */
  const [tempEventObject, setTempEventObject] = useState<EventObjectProps>({
    ...eventObject,
  });

  const [location, setLocation] = useState<
    Models.SearchFuzzyResult | undefined
  >({
    poi: { name: event.poiName },
    address: {
      country: event.country,
      countryCode: event.countryCode,
      countryCodeISO3: event.countryCodeISO3,
      countrySubdivision: event.countrySubdivision,
      localName: event.localName,
      municipality: event.municipality,
      postalCode: event.postalCode,
      streetName: event.streetName,
      streetNumber: event.streetNumber,
      freeformAddress: event.freeformAddress,
    },
    position: { lat: event.latitude, lon: event.longitude },
  });

  const [validTitle, setValidTitle] = useState(true);
  const [validStart, setValidStart] = useState(true);
  const [validEnd, setValidEnd] = useState(true);
  const [validRegStart, setValidRegStart] = useState(true);
  const [validRegEnd, setValidRegEnd] = useState(true);
  const [validLocationName, setValidLocationName] = useState(true);
  const [validDescription, setValidDescription] = useState(true);
  const [validCategories, setValidCategories] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [changesMade, setChangesMade] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { addSnack } = useSnack();

  // syncronize location state and values in tempEventObject
  useEffect(() => {
    setTempEventObject((e) => ({
      ...e,
      poiName: location?.poi?.name ?? "",
      latitude: location?.position?.lat ?? "",
      longitude: location?.position?.lon ?? "",
      country: location?.address?.country ?? "",
      countryCode: location?.address?.countryCode ?? "",
      countryCodeISO3: location?.address?.countryCodeISO3 ?? "",
      countrySubdivision: location?.address?.countrySubdivision ?? "",
      localName: location?.address?.localName ?? "",
      municipality: location?.address?.municipality ?? "",
      postalCode: location?.address?.postalCode ?? "",
      streetName: location?.address?.streetName ?? "",
      streetNumber: location?.address?.streetNumber ?? "",
      freeformAddress: location?.address?.freeformAddress ?? "",
    }));
  }, [location]);

  /*
  update the tempEventObject state with the new value of the input.
  The input id is used as the key in the tempEventObject.
  */
  const updateTempObjectProps = (e: ChangeEvent<HTMLInputElement>) => {
    let newObjectProps: EventObjectProps;

    for (const key in tempEventObject) {
      if (key === e.target.id) {
        newObjectProps = {
          ...tempEventObject,
          [key]: e.target.value,
        };
        setTempEventObject({ ...newObjectProps });
        return;
      }
    }
  };

  function updateCategories(id: number) {
    const newCategories = [...tempEventObject.categoryIds];
    for (let i = 0; i < newCategories.length; i++) {
      if (newCategories[i] === id) {
        newCategories.splice(i, 1);
        setTempEventObject({
          ...tempEventObject,
          categoryIds: newCategories,
        });
        return;
      }
    }

    newCategories.push(id);
    setTempEventObject({
      ...tempEventObject,
      categoryIds: newCategories,
    });
  }

  const updateVisibility = (id: number) => {
    setTempEventObject({
      ...tempEventObject,
      visibility: id === 1 ? Visibility.PUBLIC : Visibility.UNLISTED,
    });
  };

  function updateStartDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.startDate.substring(10);
    setTempEventObject({
      ...tempEventObject,
      startDate: newDate,
    });

    setValidStart(latherThanNowISOString(tempEventObject.startDate));
    setValidEnd(laterThan(tempEventObject.endDate ?? newDate, newDate));
  }

  function updateStartTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.startDate.substring(0, 11) + e.target.value + ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      startDate: newDate,
    });

    setValidEnd(laterThan(tempEventObject.endDate ?? newDate, newDate));
  }

  function updateEndDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.endDate?.substring(10);
    setTempEventObject({
      ...tempEventObject,
      endDate: newDate,
    });

    setValidEnd(laterThan(newDate, tempEventObject.startDate));
  }

  function updateEndTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.endDate?.substring(0, 10) +
      "T" +
      e.target.value +
      ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      endDate: newDate,
    });

    setValidEnd(laterThan(newDate, tempEventObject.startDate));
  }

  function updateRegStartDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.regStart?.substring(10);
    setTempEventObject({
      ...tempEventObject,
      regStart: newDate,
    });

    setValidRegStart(laterThan(tempEventObject.startDate, newDate));
  }

  function updateRegStartTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.regStart?.substring(0, 11) + e.target.value + ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      regStart: newDate,
    });

    setValidRegStart(laterThan(tempEventObject.startDate, newDate));
  }

  function updateRegEndDate(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value + tempEventObject.regEnd?.substring(10);
    setTempEventObject({
      ...tempEventObject,
      regEnd: newDate,
    });

    setValidRegEnd(
      laterThan(tempEventObject.endDate, newDate) &&
        laterThan(newDate, tempEventObject.regStart),
    );
  }

  function updateRegEndTime(e: ChangeEvent<HTMLInputElement>) {
    const newDate =
      tempEventObject.regEnd?.substring(0, 10) +
      "T" +
      e.target.value +
      ":00.000Z";

    setTempEventObject({
      ...tempEventObject,
      regEnd: newDate,
    });

    setValidRegEnd(
      laterThan(tempEventObject.endDate, newDate) &&
        laterThan(newDate, tempEventObject.regStart),
    );
  }

  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTempEventObject((tempEventObject) => ({
        ...tempEventObject,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        eventImage: e.target.files[0],
        deleteImage: false,
      }));
    }
  };

  function deleteImage() {
    setTempEventObject({
      ...tempEventObject,
      eventImage: undefined,
      deleteImage: true,
    });
    event.image = undefined;
  }

  function acceptChange() {
    setChangesMade(true);
    setEventObject({ ...tempEventObject });
    setEditOpen(false);
  }

  function rejectChange() {
    setTempEventObject({ ...eventObject });
    setEditOpen(false);
  }

  function setFormData(formData: FormData, eventObject: EventObjectProps) {
    for (const [key, value] of Object.entries(eventObject)) {
      if (value !== null && value !== undefined && value !== "null") {
        if (["startDate", "endDate", "regStart", "regEnd"].includes(key)) {
          formData.set(key, addTimezone(value));
        } else {
          formData.set(key, value);
        }
        /* empty string will delete the attribute in the backend */
      } else {
        formData.set(key, "");
      }
    }
  }

  const saveChanges = async (changes: EventObjectProps) => {
    const formData = new FormData();
    setFormData(formData, changes);

    try {
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "PATCH",
        body: formData,
      });

      addSnack("Oppdatert arrangement", SnackTypes.SUCCESS);
      router.back();
    } catch (e) {
      addSnack(
        "Det skjedde en feil under endring av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  const deleteEvent = async () => {
    try {
      await fetchFromPeoplyApiJson(`/events/${event.id}`, {
        method: "DELETE",
      });
      addSnack("Arrangement slettet", SnackTypes.SUCCESS);
      router.push("/");
    } catch (e) {
      addSnack(
        "Det skjedde en feil under sletting av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  const router = useRouter();
  /* Get all the possible event categories. */
  const { data: allCategories } = useSWR("/categories", fetchFromPeoplyApiJson);

  /* Get image source of either the supplied image or a placeholder. */
  const imageSource = tempEventObject.eventImage
    ? URL.createObjectURL(tempEventObject.eventImage)
    : tempEventObject.eventImage;

  function mapsUrl(eventData: EventObjectProps) {
    if (navigator && eventData?.freeformAddress) {
      const url = `https://maps.google.com?q=`;
      let query: string;
      if (eventData.poiName) {
        query = encodeURIComponent(
          `${eventData.poiName} ${eventData?.freeformAddress}`,
        );
      } else {
        query = encodeURIComponent(eventData?.freeformAddress);
      }
      return url + query;
    }
  }

  const allValid =
    validTitle &&
    validStart &&
    validEnd &&
    validRegStart &&
    validRegEnd &&
    validLocationName &&
    validDescription &&
    validCategories;
  return (
    <>
      <div className={styles.summaryContainer}>
        <SummaryCard
          inputId={0}
          Icon={<TitleCircle className={styles.summaryIcon} />}
          editButtonVisible
          editButtonDisabled={editOpen}
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          valid={validTitle}
          inputComponent={
            <TextInput
              value={tempEventObject.title}
              inputId="title"
              inputName="eventTitle"
              label="Endre tittel på arrangementet"
              placeholder={tempEventObject.title}
              maxLength={100}
              minLength={3}
              errorMessage={`Tittelen må være mellom ${3} og ${100} tegn`}
              required={false}
              handleChange={updateTempObjectProps}
              setValid={setValidTitle}
              valid={validTitle}
              validate
              noExtraInfo
              card
            />
          }
        >
          <p className={styles.titleText}>{eventObject.title}</p>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          inputId={1}
          Icon={<CalendarCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          editButtonDisabled={editOpen}
          editButtonOnClick={() => setEditOpen(true)}
          valid={validStart && validEnd}
          inputComponent={
            <>
              <div
                className={`${styles.horizontalContainer} ${styles.marginBottomVerySmall} `}
              >
                <DateInput
                  value={getISODateString(tempEventObject.startDate)}
                  inputId="dateStart"
                  inputName="eventDateStart"
                  label="Dato start"
                  errorMessage="Dato må være i dag eller i fremtiden."
                  handleChange={updateStartDate}
                  valid={validStart}
                  noExtraInfo
                  card
                />
                <TimeInput
                  value={getISOTimeString(tempEventObject.startDate)}
                  inputId="timeStart"
                  inputName="eventTimeStart"
                  label="Tidspunkt start"
                  errorMessage="Tiden må være i fremtiden."
                  handleChange={updateStartTime}
                  valid={validStart}
                  noExtraInfo
                  card
                />
              </div>
              {!tempEventObject.endDate && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => {
                    setTempEventObject({
                      ...tempEventObject,
                      endDate: tempEventObject.startDate,
                    });
                  }}
                >
                  <PlusIcon className={styles.addDateIcon} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {tempEventObject.endDate && (
                <>
                  <button
                    className={styles.addDateContainer}
                    onClick={() => {
                      setTempEventObject({
                        ...tempEventObject,
                        endDate: undefined,
                      });
                      setValidEnd(true);
                    }}
                  >
                    <MinusIcon
                      className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                    />
                    <p className={styles.addDateText}>
                      Sluttdato og -tidspunkt
                    </p>
                  </button>
                  <div className={`${styles.horizontalContainer} `}>
                    <DateInput
                      value={
                        tempEventObject.endDate
                          ? getISODateString(tempEventObject.endDate)
                          : getISODateString(tempEventObject.startDate)
                      }
                      inputId="dateEnd"
                      inputName="eventDateEnd"
                      label="Dato slutt"
                      errorMessage="Sluttdato kan ikke være før startdato."
                      handleChange={updateEndDate}
                      valid={validEnd}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                    <TimeInput
                      value={
                        tempEventObject.endDate
                          ? getISOTimeString(tempEventObject.endDate)
                          : getISOTimeString(tempEventObject.startDate)
                      }
                      inputId="timeEnd"
                      inputName="eventTimeEnd"
                      label="Tidspunkt slutt"
                      errorMessage="Sluttidspunkt kan ikke være før starttidspunkt."
                      handleChange={updateEndTime}
                      valid={validEnd}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                  </div>
                </>
              )}
              {!tempEventObject.regStart && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => {
                    setTempEventObject({
                      ...tempEventObject,
                      regStart: tempEventObject.startDate,
                    });
                  }}
                >
                  <PlusIcon className={styles.addDateIcon} />
                  <p className={styles.addDateText}>Påmelding åpner</p>
                </button>
              )}
              {tempEventObject.regStart && (
                <>
                  <button
                    className={styles.addDateContainer}
                    onClick={() => {
                      setTempEventObject({
                        ...tempEventObject,
                        regStart: undefined,
                      });
                      setValidRegStart(true);
                    }}
                  >
                    <MinusIcon
                      className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                    />
                    <p className={styles.addDateText}>Påmelding åpner</p>
                  </button>
                  <div className={`${styles.horizontalContainer} `}>
                    <DateInput
                      value={
                        tempEventObject.regStart
                          ? getISODateString(tempEventObject.regStart)
                          : ""
                      }
                      inputId="regDateStart"
                      inputName="eventRegDateStart"
                      label="Dato åpning"
                      errorMessage="Påmelding må åpne før startdato."
                      handleChange={updateRegStartDate}
                      valid={validRegStart}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                    <TimeInput
                      value={
                        tempEventObject.regStart
                          ? getISOTimeString(tempEventObject.regStart)
                          : ""
                      }
                      inputId="regTimeStart"
                      inputName="eventRegTimeStart"
                      label="Tidspunkt åpning"
                      errorMessage="Påmelding må åpne før startdato."
                      handleChange={updateRegStartTime}
                      valid={validRegStart}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                  </div>
                </>
              )}
              {!tempEventObject.regEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => {
                    setTempEventObject({
                      ...tempEventObject,
                      regEnd: tempEventObject.startDate,
                    });
                  }}
                >
                  <PlusIcon className={styles.addDateIcon} />
                  <p className={styles.addDateText}>Påmelding stenger</p>
                </button>
              )}
              {tempEventObject.regEnd && (
                <>
                  <button
                    className={styles.addDateContainer}
                    onClick={() => {
                      setTempEventObject({
                        ...tempEventObject,
                        regEnd: undefined,
                      });
                      setValidRegEnd(true);
                    }}
                  >
                    <MinusIcon
                      className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                    />
                    <p className={styles.addDateText}>Påmelding stenger</p>
                  </button>
                  <div className={`${styles.horizontalContainer} `}>
                    <DateInput
                      value={
                        tempEventObject.regEnd
                          ? getISODateString(tempEventObject.regEnd)
                          : ""
                      }
                      inputId="regDateEnd"
                      inputName="eventRegDateEnd"
                      label="Dato frist"
                      errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                      handleChange={updateRegEndDate}
                      valid={validRegEnd}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                    <TimeInput
                      value={
                        tempEventObject.regEnd
                          ? getISOTimeString(tempEventObject.regEnd)
                          : ""
                      }
                      inputId="regTimeEnd"
                      inputName="eventRegTimeEnd"
                      label="Tidspunkt frist"
                      errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                      handleChange={updateRegEndTime}
                      valid={validRegEnd}
                      initiallyFocused
                      noExtraInfo
                      card
                    />
                  </div>
                </>
              )}
            </>
          }
        >
          <div className={`${styles.horizontalContainer}`}>
            <div className={`${styles.diagonalContainer} `}>
              <span
                className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
              >
                Start:{" "}
              </span>
              {eventObject.endDate && (
                <span
                  className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
                >
                  Slutt:{" "}
                </span>
              )}
              {eventObject.regStart && (
                <span
                  className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
                >
                  Påmelding åpner:
                </span>
              )}
              {eventObject.regEnd && (
                <span
                  className={`${styles.marginBottomVerySmall} ${styles.startAlign}`}
                >
                  Påmelding stenger:
                </span>
              )}
            </div>

            <div className={`${styles.diagonalContainer} ${styles.startAlign}`}>
              <TimeView
                ISOtime={tempEventObject.startDate}
                styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
                localTime={false}
              ></TimeView>
              {tempEventObject.endDate && (
                <TimeView
                  ISOtime={tempEventObject.endDate}
                  styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
                  localTime={false}
                ></TimeView>
              )}
              {tempEventObject.regStart && (
                <TimeView
                  ISOtime={tempEventObject.regStart}
                  styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
                  localTime={false}
                ></TimeView>
              )}
              {tempEventObject.regEnd && (
                <TimeView
                  ISOtime={tempEventObject.regEnd}
                  styles={`${styles.marginBottomVerySmall} ${styles.dateText}`}
                  localTime={false}
                ></TimeView>
              )}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={2}
          Icon={<PlaceCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          valid={validLocationName}
          inputComponent={
            <>
              <TextInput
                value={tempEventObject.locationName}
                inputId="locationName"
                inputName="eventLocationName"
                label="Kallenavn på stedet"
                placeholder="F.eks. Bliss"
                maxLength={100}
                minLength={1}
                errorMessage="Du må oppgi et kallenavn på stedet."
                required
                handleChange={updateTempObjectProps}
                setValid={setValidLocationName}
                valid={validLocationName}
                validate
                noExtraInfo
                card
              />

              <TextInputLocationSelect
                inputId="Location"
                inputName="eventLocation"
                placeholder="F.eks. Gaustadalléen 23B"
                onLocationSelect={setLocation}
                selectedLocation={location}
                card
                options={
                  ipInfo
                    ? {
                        countrySet: [ipInfo.country_code],
                        lat: ipInfo.latitude,
                        lon: ipInfo.longitude,
                      }
                    : undefined
                }
              />
            </>
          }
        >
          <p className={styles.titleText}>{eventObject.locationName}</p>
          <a
            className={styles.placeText}
            href={mapsUrl(eventObject)}
            target="_blank"
            rel="noreferrer"
          >
            {eventObject?.freeformAddress}
          </a>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={3}
          Icon={<InfoCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          valid={validDescription}
          inputComponent={
            <>
              <TextInputLong
                value={tempEventObject.description}
                inputId="description"
                inputName="eventTitle"
                label="Endre beskrivelse av arrangementet"
                placeholder={tempEventObject.description}
                maxLength={2500}
                errorMessage="Beskrivelsen kan ikke være tom"
                required={false}
                handleChange={updateTempObjectProps}
                setValid={setValidDescription}
                valid={validDescription}
                validate
                noExtraInfo
                card
              />
            </>
          }
        >
          <div className={styles.descriptionText}>
            {tempEventObject.description}
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={4}
          Icon={<InfoCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          valid={validCategories}
          inputComponent={
            <CategoryInput
              categories={allCategories}
              activeCategories={tempEventObject.categoryIds}
              errorMessage="Du må velge minst en kategori."
              onClick={updateCategories}
              style={styles.categoryTag}
              setValid={setValidCategories}
              valid={validCategories}
              noExtraInfo
            />
          }
        >
          <div className={styles.categoryContainer}>
            <p className={styles.categoryLabel}>Kategori(er)</p>
            <div className={styles.categoryTagsContainer}>
              {tempEventObject.categoryIds !== undefined &&
                tempEventObject.categoryIds.map((categoryId) => {
                  return (
                    <Tag
                      key={categoryId}
                      text={
                        allCategories !== undefined
                          ? allCategories.find((c: any) => c.id === categoryId)
                              ?.name
                          : "..."
                      }
                      active={true}
                    />
                  );
                })}
            </div>
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={5}
          Icon={<ImageCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          inputComponent={
            <>
              <ImageInput
                value={tempEventObject.eventImage}
                placeholder={event.image}
                inputId="image"
                inputName="eventImage"
                label="Last opp et bilde til arrangementet"
                buttonLabel="Endre bilde"
                errorMessage="Bildet kan ikke være så stort."
                onChange={updateEventImage}
                noExtraInfo
                card
              />
              <a className={styles.deleteImage} onClick={deleteImage}>
                Slett bilde
              </a>
            </>
          }
        >
          <div className={styles.imageContainer}>
            <Image
              src={imageSource ?? event.image ?? PlaceholderImage}
              layout="fill"
              alt="Bilde for arrangementet"
              objectFit="cover"
              objectPosition="center"
            />
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          editButtonOnClick={() => setEditOpen(true)}
          editButtonDisabled={editOpen}
          inputId={6}
          Icon={<DataCircleSummary className={styles.summaryIcon} />}
          editButtonVisible
          inputComponent={
            <>
              <RadioInput
                optionsAndIcons={[
                  {
                    id: 1,
                    text: "offentlig",
                    hintText:
                      "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                    icon: PublicIcon,
                    active: tempEventObject.visibility === Visibility.PUBLIC,
                  },
                  {
                    id: 2,
                    text: "ikke oppført",
                    hintText:
                      "Ikke synlig for offentligheten, men alle med lenken kan se arrangementet, inkludert personer uten brukerkonto.",
                    icon: UnlistedIcon,
                    active: tempEventObject.visibility === Visibility.UNLISTED,
                  },
                ]}
                onClick={updateVisibility}
                label="Privat eller ikke oppført arrangement?"
                card
              />
            </>
          }
        >
          <div className={styles.dataContainer}>
            {eventObject.visibility === Visibility.UNLISTED ? (
              <div className={styles.dataItemContainer}>
                <PrivateIconSmall className={styles.dataIcon} />{" "}
                <p className={styles.dataLabel}>Ikke oppført</p>
              </div>
            ) : eventObject.visibility === Visibility.PUBLIC ? (
              <div className={styles.dataItemContainer}>
                <PublicIconSmall className={styles.dataIcon} />
                <p className={styles.dataLabel}>Offentlig</p>
              </div>
            ) : (
              <>{/* TODO: implement Private */}</>
            )}
          </div>
        </SummaryCard>
        <Button
          text={"Lagre endringer"}
          onClick={() => saveChanges(eventObject)}
          disabled={!changesMade || editOpen || !allValid}
        ></Button>

        <button
          className={styles.deleteButton}
          onClick={() => {
            setDeleteModalOpen(true);
          }}
        >
          Slett arrangementet
        </button>
        {deleteModalOpen && (
          <Modal
            label="Slette arrangement"
            description="Er du sikker på at du vil slette arrangementet?"
            closeButtonOnClick={() => {
              setDeleteModalOpen(false);
            }}
          >
            <>
              <ModalButton
                text="Slett"
                type={ButtonType.DANGER}
                onClick={deleteEvent}
              />
              <ModalButton
                text="Avbryt"
                onClick={() => {
                  setDeleteModalOpen(false);
                }}
                type={ButtonType.SECONDARY}
              />
            </>
          </Modal>
        )}
      </div>
    </>
  );
};

export default EditSummaryPage;
