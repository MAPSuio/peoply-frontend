// Types
import {
  ButtonType,
  type Category,
  type Event,
  type EventCategory,
  type Organization,
  EventRegistrationMode,
  SnackTypes,
  Visibility,
} from "../types/types";

// Components
import Button from "./Button";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import EditTitleSection from "./summary/EditTitleSection";
import EditCoOrganizerSection from "./summary/EditCoOrganizerSection";
import EditDateTimeSection from "./summary/EditDateTimeSection";
import EditPlaceSection from "./summary/EditPlaceSection";
import EditDescriptionSection from "./summary/EditDescriptionSection";
import EditCategorySection from "./summary/EditCategorySection";
import EditImageSection from "./summary/EditImageSection";
import EditDataSection from "./summary/EditDataSection";

// Assets
import PlaceholderImage from "../assets/images/cat.jpg";

// Styles
import styles from "../styles/SummaryPage.module.scss";

// Hooks
import { useRouter } from "next/router";
import useSnack from "../hooks/useSnack";
import useSWR from "swr";
import useRegistrationCount from "../hooks/useRegistrationCount";

// Utils
import {
  removeTimezone,
  addTimezone,
  laterThan,
  latherThanNowISOString,
} from "../utils/functions";
import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import { type ChangeEvent, useEffect, useState } from "react";
import useUser from "../hooks/useUser";
import type { LocationSearchResult } from "../types/locationSearch";

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

export interface EventObjectProps {
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

  const [location, setLocation] = useState<LocationSearchResult | undefined>({
    id: event.id,
    provider: "entur",
    type: event.poiName ? "poi" : "address",
    poi: event.poiName ? { name: event.poiName } : undefined,
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
  const updateTempObjectProps = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
    const newDate = `${tempEventObject.startDate.substring(0, 11) + e.target.value}:00.000Z`;

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
    const newDate = `${tempEventObject.regStart?.substring(0, 11) + e.target.value}:00.000Z`;

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
    if (e.target.files?.[0]) {
      setTempEventObject((tempEventObject) => ({
        ...tempEventObject,
        // @ts-expect-error
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
  const { data: allCategories } = useSWR<Category[]>("/categories");
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

  const editButtonOnClick = () => setEditOpen(true);

  return (
    <div className={styles.editSummary}>
      <EditTitleSection
        title={eventObject.title}
        tempTitle={tempEventObject.title}
        validTitle={validTitle}
        setValidTitle={setValidTitle}
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onChange={updateTempObjectProps}
        onCheck={acceptChange}
        onCross={rejectChange}
      />

      <EditCoOrganizerSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        coOrganizerSearch={coOrganizerSearch}
        setCoOrganizerSearch={setCoOrganizerSearch}
        tempCoOrganizerOrganizationIds={
          tempEventObject.coOrganizerOrganizationIds
        }
        coOrganizerOptions={coOrganizerOptions}
        visibleCoOrganizerOptions={visibleCoOrganizerOptions}
        toggleCoOrganizerOrganization={toggleCoOrganizerOrganization}
        selectedCoOrganizerNames={selectedCoOrganizerNames}
      />

      <EditDateTimeSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        eventObject={eventObject}
        tempEventObject={tempEventObject}
        setTempEventObject={setTempEventObject}
        validStart={validStart}
        validEnd={validEnd}
        setValidEnd={setValidEnd}
        validRegStart={validRegStart}
        setValidRegStart={setValidRegStart}
        validRegEnd={validRegEnd}
        setValidRegEnd={setValidRegEnd}
        updateStartDate={updateStartDate}
        updateStartTime={updateStartTime}
        updateEndDate={updateEndDate}
        updateEndTime={updateEndTime}
        updateRegStartDate={updateRegStartDate}
        updateRegStartTime={updateRegStartTime}
        updateRegEndDate={updateRegEndDate}
        updateRegEndTime={updateRegEndTime}
      />

      <EditPlaceSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        validLocationName={validLocationName}
        setValidLocationName={setValidLocationName}
        tempLocationName={tempEventObject.locationName}
        onLocationNameChange={updateTempObjectProps}
        location={location}
        setLocation={setLocation}
        ipInfo={ipInfo}
        displayLocationName={eventObject.locationName}
        mapsHref={mapsUrl(eventObject)}
        displayFreeformAddress={eventObject?.freeformAddress}
      />

      <EditDescriptionSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        validDescription={validDescription}
        setValidDescription={setValidDescription}
        tempDescription={tempEventObject.description}
        onChange={updateTempObjectProps}
      />

      <EditCategorySection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        validCategories={validCategories}
        setValidCategories={setValidCategories}
        allCategories={allCategories}
        categoryIds={tempEventObject.categoryIds}
        onCategoryClick={updateCategories}
      />

      <EditImageSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        tempImage={tempEventObject.eventImage}
        placeholderImage={event.image}
        onImageChange={updateEventImage}
        onDeleteImage={deleteImage}
        imageSource={imageSource ?? event.image ?? PlaceholderImage}
      />

      <EditDataSection
        editOpen={editOpen}
        editButtonOnClick={editButtonOnClick}
        onCheck={acceptChange}
        onCross={rejectChange}
        tempVisibility={tempEventObject.visibility}
        onVisibilityClick={updateVisibility}
        capacityFieldVisible={capacityFieldVisible}
        onAddCapacityField={addCapacityField}
        onRemoveCapacityField={removeCapacityField}
        tempCapacity={tempEventObject.capacity}
        onCapacityChange={updateCapacity}
        goingCount={goingCount}
        externalRegistrationEnabled={externalRegistrationEnabled}
        onToggleExternalRegistration={() =>
          setExternalRegistration(!externalRegistrationEnabled)
        }
        tempExternalUrl={tempEventObject.externalUrl}
        onExternalUrlChange={updateExternalUrl}
        validExternalUrl={validExternalUrl}
        setValidExternalUrl={setValidExternalUrl}
        displayVisibility={eventObject.visibility}
        displayCapacity={eventObject.capacity}
        displayRegistrationMode={eventObject.registrationMode}
        displayExternalUrl={eventObject.externalUrl}
      />

      <div className={styles.ctaBar}>
        <Button
          text={"Lagre endringer"}
          onClick={() => saveChanges(eventObject)}
          disabled={!changesMade || editOpen || !allValid}
          className={styles.primaryButton}
        ></Button>
      </div>

      <button
        type="button"
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
        </Modal>
      )}
    </div>
  );
};

export default EditSummaryPage;
