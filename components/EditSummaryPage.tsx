// Next
import Image from "next/legacy/image";

// Types
import {
  ButtonType,
  Event,
  EventCategory,
  Organization,
  EventRegistrationMode,
  SnackTypes,
  Visibility,
} from "../types/types";

// Icons
import TitleCircle from "./TitleCircle";
import PlaceIconSummary from "./svgs/PlaceIconSummary";
import IconCircle from "./IconCircle";
import InfoIconSummary from "./svgs/InfoIconSummary";
import RadioInput from "./inputs/RadioInput";
import UnlistedIcon from "../components/svgs/UnlistedIcon";
import PublicIcon from "../components/svgs/PublicIcon";
import PrivateIconSmall from "./svgs/PrivateIconSmall";
import PublicIconSmall from "./svgs/PublicIconSmall";
import PlusIcon from "./svgs/PlusIcon";
import ImageIconSummary from "./svgs/ImageIconSummary";
import DataIconSummary from "./svgs/DataIconSummary";
import PlaceholderImage from "../assets/images/cat.jpg";
import MinusIcon from "./svgs/MinusIcon";

// Components
import SummaryCard from "./SummaryCard";
import CalendarIconSummary from "./svgs/CalendarIconSummary";
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
import NumberInput from "./inputs/NumberInput";
import CheckboxInput from "./inputs/CheckboxInput";

// Styles
import styles from "../styles/SummaryPage.module.scss";
import createStyles from "../styles/CreateEvent.module.scss";

// Hooks
import { useRouter } from "next/router";
import useSnack from "../hooks/useSnack";
import useSWR from "swr";
import useRegistrationCount from "../hooks/useRegistrationCount";

// Utils
import {
  removeTimezone,
  getISODateString,
  getISOTimeString,
  addTimezone,
  laterThan,
  latherThanNowISOString,
} from "../utils/functions";
import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import React, { ChangeEvent, useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import { AzureMapsSearchFuzzyResult } from "../types/azureMaps";
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
  registrationMode: EventRegistrationMode;
  title: string;
  coOrganizerOrganizationIds: string[];
  description: string;
  startDate: string;
  endDate?: string;
  regStart?: string;
  regEnd?: string;
  categoryIds: number[];
  capacity?: number | null;
  externalUrl?: string;
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
  const [coOrganizerSearch, setCoOrganizerSearch] = useState("");
  const initialExternalRegistrationEnabled =
    event.registrationMode === EventRegistrationMode.EXTERNAL;
  const initialExternalUrl = event.externalUrl ?? "";
  const initialCoOrganizerOrganizationIds = (
    event.eventArrangers ?? []
  ).flatMap((eventArranger) => {
    const organizationId = eventArranger.arranger.organization?.id;

    return eventArranger.role === "COLLABORATOR" && organizationId
      ? [organizationId]
      : [];
  });

  const [eventObject, setEventObject] = useState<EventObjectProps>({
    title: event.title,
    coOrganizerOrganizationIds: initialCoOrganizerOrganizationIds,
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
    registrationMode: event.registrationMode ?? EventRegistrationMode.PEOPLY,
    capacity: event.capacity,
    externalUrl: initialExternalUrl,
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
    AzureMapsSearchFuzzyResult | undefined
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
  const [validCapacity, setValidCapacity] = useState(true);
  const [validExternalUrl, setValidExternalUrl] = useState(
    !initialExternalRegistrationEnabled ||
      /^https?:\/\/\S+$/i.test(initialExternalUrl.trim()),
  );
  const [capacityFieldVisible, setCapacityFieldVisible] = useState(
    event.capacity !== null,
  );

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

  function toggleCoOrganizerOrganization(organizationId: string) {
    const nextCoOrganizerOrganizationIds =
      tempEventObject.coOrganizerOrganizationIds.includes(organizationId)
        ? tempEventObject.coOrganizerOrganizationIds.filter(
            (id) => id !== organizationId,
          )
        : [...tempEventObject.coOrganizerOrganizationIds, organizationId];

    setTempEventObject({
      ...tempEventObject,
      coOrganizerOrganizationIds: nextCoOrganizerOrganizationIds,
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

  function addCapacityField() {
    setCapacityFieldVisible(true);
    setTempEventObject({
      ...tempEventObject,
      capacity: tempEventObject.capacity ?? 1,
    });
    setValidCapacity(true);
  }

  function removeCapacityField() {
    setCapacityFieldVisible(false);
    setTempEventObject({
      ...tempEventObject,
      capacity: null,
    });
    setValidCapacity(true);
  }

  function updateCapacity(e: ChangeEvent<HTMLInputElement>) {
    const nextValue = e.target.value;
    const nextCapacity = nextValue === "" ? null : parseInt(nextValue, 10);
    const minimumCapacity = goingCount ?? 0;

    setTempEventObject({
      ...tempEventObject,
      capacity: nextCapacity,
    });
    setValidCapacity(
      nextCapacity !== null &&
        Number.isFinite(nextCapacity) &&
        nextCapacity > 0 &&
        nextCapacity >= minimumCapacity,
    );
  }

  function setExternalRegistration(enabled: boolean) {
    const nextExternalUrl = enabled ? (tempEventObject.externalUrl ?? "") : "";

    setTempEventObject({
      ...tempEventObject,
      registrationMode: enabled
        ? EventRegistrationMode.EXTERNAL
        : EventRegistrationMode.PEOPLY,
      externalUrl: nextExternalUrl,
    });
    setValidExternalUrl(
      !enabled || /^https?:\/\/\S+$/i.test(nextExternalUrl.trim()),
    );
  }

  function updateExternalUrl(e: ChangeEvent<HTMLInputElement>) {
    setTempEventObject({
      ...tempEventObject,
      externalUrl: e.target.value,
    });
  }

  function acceptChange() {
    setChangesMade(true);
    setEventObject({ ...tempEventObject });
    setCapacityFieldVisible(tempEventObject.capacity !== null);
    setEditOpen(false);
  }

  function rejectChange() {
    setTempEventObject({ ...eventObject });
    setCapacityFieldVisible(eventObject.capacity !== null);
    setValidExternalUrl(
      eventObject.registrationMode !== EventRegistrationMode.EXTERNAL ||
        /^https?:\/\/\S+$/i.test((eventObject.externalUrl ?? "").trim()),
    );
    setEditOpen(false);
  }

  function setFormData(formData: FormData, eventObject: EventObjectProps) {
    for (const [key, value] of Object.entries(eventObject)) {
      if (value !== null && value !== undefined && value !== "null") {
        if (["startDate", "endDate", "regStart", "regEnd"].includes(key)) {
          formData.set(key, addTimezone(value));
        } else if (key === "coOrganizerOrganizationIds") {
          formData.set(key, JSON.stringify(value));
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
    } catch {
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
    } catch {
      addSnack(
        "Det skjedde en feil under sletting av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  const router = useRouter();
  /* Get all the possible event categories. */
  const { data: allCategories } = useSWR("/categories");
  const { data: organizations } = useSWR<Organization[]>(
    "/organizations?orderBy=name",
    fetchAllFromPeoplyApiJson,
  );
  const { data: goingCount } = useRegistrationCount(event.id);

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
    validCategories &&
    validCapacity &&
    validExternalUrl;
  const externalRegistrationEnabled =
    tempEventObject.registrationMode === EventRegistrationMode.EXTERNAL;
  const primaryOrganizationId = event.eventArrangers?.find(
    (eventArranger) => eventArranger.role !== "COLLABORATOR",
  )?.arranger.organization?.id;
  const coOrganizerOptions = (organizations ?? [])
    .filter((organization) => organization.id !== primaryOrganizationId)
    .map((organization) => ({
      id: organization.id,
      label: organization.name,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "nb-NO"));
  const visibleCoOrganizerOptions = coOrganizerOptions.filter((organization) =>
    organization.label
      .toLowerCase()
      .includes(coOrganizerSearch.trim().toLowerCase()),
  );
  const selectedCoOrganizerNames = coOrganizerOptions
    .filter((organization) =>
      eventObject.coOrganizerOrganizationIds.includes(organization.id),
    )
    .map((organization) => organization.label);
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
          Icon={
            <IconCircle
              Icon={InfoIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
          editButtonVisible
          editButtonDisabled={editOpen}
          editButtonOnClick={() => setEditOpen(true)}
          inputComponent={
            <div className={styles.coOrganizerEditor}>
              <div className={styles.coOrganizerHeader}>
                <h2>Medarrangører</h2>
                <p>
                  Legg til eller fjern foreninger som samarbeider om
                  arrangementet.
                </p>
              </div>
              <input
                id="coOrganizerSearch"
                className={createStyles.coOrganizerSearchInput}
                type="text"
                value={coOrganizerSearch}
                onChange={(event) => setCoOrganizerSearch(event.target.value)}
                placeholder="Søk etter forening"
              />
              {tempEventObject.coOrganizerOrganizationIds.length > 0 && (
                <div className={createStyles.coOrganizerTags}>
                  {coOrganizerOptions
                    .filter((organization) =>
                      tempEventObject.coOrganizerOrganizationIds.includes(
                        organization.id,
                      ),
                    )
                    .map((organization) => (
                      <span
                        key={organization.id}
                        className={createStyles.coOrganizerTag}
                      >
                        {organization.label}
                      </span>
                    ))}
                </div>
              )}
              <div className={createStyles.coOrganizerOptionList}>
                {visibleCoOrganizerOptions.map((organization) => (
                  <button
                    key={organization.id}
                    type="button"
                    className={`${createStyles.coOrganizerOptionButton} ${
                      tempEventObject.coOrganizerOrganizationIds.includes(
                        organization.id,
                      )
                        ? createStyles.coOrganizerOptionButtonSelected
                        : ""
                    }`}
                    onClick={() =>
                      toggleCoOrganizerOrganization(organization.id)
                    }
                  >
                    <span>{organization.label}</span>
                  </button>
                ))}
                {visibleCoOrganizerOptions.length === 0 && (
                  <p className={createStyles.coOrganizerEmptyText}>
                    Ingen foreninger matcher søket.
                  </p>
                )}
              </div>
            </div>
          }
        >
          <div className={styles.dataContainer}>
            <p className={styles.categoryLabel}>Medarrangører</p>
            <p className={styles.titleText}>
              {selectedCoOrganizerNames.length > 0
                ? selectedCoOrganizerNames.join(" · ")
                : "Ingen medarrangører"}
            </p>
          </div>
        </SummaryCard>

        <SummaryCard
          onCheck={acceptChange}
          onCross={rejectChange}
          inputId={2}
          Icon={
            <IconCircle
              Icon={CalendarIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
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
          inputId={3}
          Icon={
            <IconCircle
              Icon={PlaceIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
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
          inputId={4}
          Icon={
            <IconCircle
              Icon={InfoIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
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
          inputId={5}
          Icon={
            <IconCircle
              Icon={InfoIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
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
              <button
                type="button"
                className={styles.deleteImage}
                onClick={deleteImage}
              >
                Slett bilde
              </button>
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
          inputId={7}
          Icon={
            <IconCircle
              Icon={DataIconSummary}
              iconClassName={styles.summaryIcon}
            />
          }
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
              {!capacityFieldVisible && (
                <button
                  className={styles.addDateContainer}
                  onClick={addCapacityField}
                >
                  <PlusIcon className={styles.addDateIcon} />
                  <p className={styles.addDateText}>Legg til antall plasser</p>
                </button>
              )}
              {capacityFieldVisible && (
                <>
                  <button
                    className={styles.addDateContainer}
                    onClick={removeCapacityField}
                  >
                    <MinusIcon
                      className={`${styles.addDateIcon} ${styles.marginBottomMedium}`}
                    />
                    <p className={styles.addDateText}>Fjern antall plasser</p>
                  </button>
                  <NumberInput
                    value={`${tempEventObject.capacity ?? ""}`}
                    inputId="capacity"
                    inputName="eventCapacity"
                    label="Antall plasser"
                    placeholder="F.eks. 120"
                    min={`${Math.max(goingCount ?? 1, 1)}`}
                    errorMessage="Antall plasser må være større enn 0"
                    required={false}
                    handleChange={updateCapacity}
                  />
                  {typeof goingCount === "number" && (
                    <p
                      className={styles.dateText}
                    >{`Du kan ikke sette færre enn ${goingCount} plasser fordi ${goingCount} er påmeldt.`}</p>
                  )}
                </>
              )}
              <CheckboxInput
                onChange={() =>
                  setExternalRegistration(!externalRegistrationEnabled)
                }
                checked={externalRegistrationEnabled}
                label="Ekstern påmelding"
                checkboxId="externalRegistration"
                checkboxName="externalRegistration"
              />
              {externalRegistrationEnabled && (
                <TextInput
                  value={tempEventObject.externalUrl ?? ""}
                  inputId="externalUrl"
                  inputName="externalUrl"
                  label="Påmelding URL"
                  placeholder="https://example.com/pamelding"
                  maxLength={500}
                  errorMessage="Legg inn en gyldig URL som starter med http:// eller https://"
                  required
                  handleChange={updateExternalUrl}
                  setValid={setValidExternalUrl}
                  valid={validExternalUrl}
                  validate
                  noExtraInfo
                  card
                />
              )}
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
            {eventObject.capacity !== null ? (
              <div className={styles.dataItemContainer}>
                <p
                  className={styles.dataLabel}
                >{`${eventObject.capacity} plasser`}</p>
              </div>
            ) : (
              <div className={styles.dataItemContainer}>
                <p className={styles.dataLabel}>Ubegrenset antall plasser</p>
              </div>
            )}
            <div className={styles.dataItemContainer}>
              <p className={styles.dataLabel}>
                {eventObject.registrationMode === EventRegistrationMode.EXTERNAL
                  ? "Ekstern påmelding"
                  : eventObject.registrationMode === EventRegistrationMode.NONE
                    ? "Ingen påmelding"
                    : "Påmelding i Peoply"}
              </p>
            </div>
            {eventObject.registrationMode === EventRegistrationMode.EXTERNAL &&
              eventObject.externalUrl && (
                <a
                  className={styles.placeText}
                  href={eventObject.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {eventObject.externalUrl}
                </a>
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
