// Next.js.
import { useRouter } from "next/router";

// React.
import { type ChangeEvent, useEffect, useRef, useState } from "react";

// Data fetching.
import useSWR from "swr";
import {
  fetchAllFromPeoplyApiJson,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";

// Hooks.
import useUser from "./useUser";
import useRedirectToLogin from "./useRedirectToLogin";
import useSnack from "./useSnack";

// Utils.
import {
  allEventInputsValid,
  dateInputStartValid,
  timeInputStartValid,
  dateInputEndValid,
  timeInputEndValid,
  radioInputValid,
  getCategoryText,
  getOrganizationRolePrivilege,
} from "../utils/functions";

import {
  eventDescriptionMaxLength,
  eventDescriptionMinLength,
  eventLocationNameMaxLength,
  eventLocationNameMinLength,
  eventTitleMaxLength,
  eventTitleMinLength,
} from "../utils/constants";

import {
  isEventRegEndDateValid,
  isEventRegEndTimeValid,
  isEventRegStartDateValid,
  isEventRegStartTimeValid,
} from "../utils/event";

// Types.
import {
  type Event,
  InputPages,
  type Organization,
  type User,
  Visibility,
  ImageCaching,
  SnackTypes,
  OrganizationRole,
} from "../types/types";
import type { LocationSearchResult } from "../types/locationSearch";

/**
 * Someone the signed-in user may create an event as: themselves, or an
 * organization they administer. The organization or user is carried along
 * whole rather than as a name, so the picker can show their avatar.
 */
export interface ArrangerOption {
  value: string;
  label: string;
  organization?: Organization;
  user?: User;
}

export interface EventObjectProps {
  eventTitle: string;
  eventArrangerId: string;
  eventCoOrganizerOrganizationIds: string[];
  eventDescription: string;
  eventLocationName: string;
  eventLocation?: LocationSearchResult;
  eventRegStartDate: string;
  eventRegStartTime: string;
  eventRegEndDate: string;
  eventRegEndTime: string;
  eventHasRegStart: boolean;
  eventHasRegEnd: boolean;
  eventDateStart: string;
  eventDateEnd: string | null;
  eventHasDateEnd: boolean;
  eventTimeStart: string;
  eventTimeEnd: string | null;
  eventActiveCategories: number[];
  eventVisibility: Visibility;
  eventHasCapacity: boolean;
  eventCapacity: string;
  eventHasFood: boolean;
  eventHasExternalRegistration: boolean;
  eventExternalUrl: string;
  eventHasFormQuestion: boolean;
  eventFormQuestion?: string;
  eventExtraInfoValid: boolean;
  eventImage?: File;
  eventImageValid: boolean;
  currentStep: number;
  imageStorageKey: string;
  reachedStep: number;
  imageCached: ImageCaching;
}

/**
 * All the state, handlers, localStorage continue/resume logic and validation
 * derivations behind the multi-step "create event" wizard. Lifted out of
 * `pages/events/create.tsx` so the page can stay a thin orchestrator and the
 * per-step JSX can live in its own components.
 */
function toggled<Item>(items: Item[], item: Item): Item[] {
  return items.includes(item)
    ? items.filter((candidate) => candidate !== item)
    : [...items, item];
}

export default function useCreateEventForm() {
  const { user, ipInfo, orgs } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const [modalOpen, setModalOpen] = useState(false);
  const [coOrganizerOpen, setCoOrganizerOpen] = useState(false);
  const [coOrganizerSearch, setCoOrganizerSearch] = useState("");
  const [eventExtraInfoValid, setEventExtraInfoValid] = useState(false);
  const [eventImageValid, setEventImageValid] = useState(false);
  const coOrganizerCardRef = useRef<HTMLDivElement>(null);

  const [eventObject, setEventObject] = useState<EventObjectProps>({
    eventTitle: "",
    eventArrangerId: user?.arrangerId ?? "",
    eventCoOrganizerOrganizationIds: [],
    eventDescription: "",
    eventLocationName: "",
    eventRegStartDate: "",
    eventRegStartTime: "",
    eventRegEndDate: "",
    eventRegEndTime: "",
    eventHasRegStart: false,
    eventHasRegEnd: false,
    eventDateStart: "",
    eventDateEnd: null,
    eventHasDateEnd: false,
    eventTimeStart: "",
    eventTimeEnd: null,
    eventActiveCategories: [],
    eventVisibility: Visibility.PUBLIC,
    eventHasCapacity: false,
    eventHasFood: false,
    eventHasExternalRegistration: false,
    eventExternalUrl: "",
    eventHasFormQuestion: false,
    eventFormQuestion: "",
    eventImage: undefined,
    eventCapacity: "",
    eventExtraInfoValid: eventExtraInfoValid,
    eventImageValid: eventImageValid,
    currentStep: 0,
    imageStorageKey: "",
    reachedStep: 0,
    imageCached: ImageCaching.OK,
  });
  /* The number of input screens. */
  const stepCount = 7;

  const router = useRouter();
  const { addSnack } = useSnack();

  /* Get all the possible event categories. */
  const { data: categories } = useSWR("/categories");
  const { data: organizations } = useSWR<Organization[]>(
    "/organizations?orderBy=name",
    fetchAllFromPeoplyApiJson,
  );

  const latestEventObject = useRef(eventObject);

  useEffect(() => {
    latestEventObject.current = eventObject;
  }, [eventObject]);

  const patchEvent = (
    patch:
      | Partial<EventObjectProps>
      | ((current: EventObjectProps) => Partial<EventObjectProps>),
  ) => {
    const current = latestEventObject.current;
    const nextEventObject = {
      ...current,
      ...(typeof patch === "function" ? patch(current) : patch),
    };
    latestEventObject.current = nextEventObject;
    setEventObject(nextEventObject);
    updateLocalStorage({ ...nextEventObject });
  };

  const updateEventTitle = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventTitle: e.target.value,
    });
  };

  const updateEventArrangerId = (arrangerId: string) => {
    const primaryOrganizationId = orgs?.find(
      (organization) => organization.arrangerId === arrangerId,
    )?.id;

    patchEvent((current) => ({
      eventArrangerId: arrangerId,
      eventCoOrganizerOrganizationIds:
        current.eventCoOrganizerOrganizationIds.filter(
          (organizationId) => organizationId !== primaryOrganizationId,
        ),
    }));
  };

  const toggleCoOrganizerOrganization = (organizationId: string) => {
    patchEvent((current) => ({
      eventCoOrganizerOrganizationIds: toggled(
        current.eventCoOrganizerOrganizationIds,
        organizationId,
      ),
    }));
  };

  const updateEventDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    patchEvent({
      eventDescription: e.target.value,
    });
  };

  const updateEventLocationName = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventLocationName: e.target.value,
    });
  };

  const updateEventLocation = (loc?: LocationSearchResult) => {
    patchEvent({
      eventLocation: loc,
    });
  };

  const updateEventCategories = (categoryId: number) => {
    patchEvent((current) => ({
      eventActiveCategories: toggled(current.eventActiveCategories, categoryId),
    }));
  };

  const updateEventDateStart = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventDateStart: e.target.value,
    });
  };

  const updateEventTimeStart = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventTimeStart: e.target.value,
    });
  };

  const setEventHasDateEnd = (value: boolean) => {
    patchEvent({
      eventHasDateEnd: value,
    });
  };

  const updateEventDateEnd = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventDateEnd: e.target.value,
    });
  };

  const updateEventTimeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventTimeEnd: e.target.value,
    });
  };

  const seteventHasRegStart = (value: boolean) => {
    patchEvent({
      eventHasRegStart: value,
    });
  };

  const updateEventRegStartDate = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventRegStartDate: e.target.value,
    });
  };

  const updateEventRegStartTime = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventRegStartTime: e.target.value,
    });
  };

  const seteventHasRegEnd = (value: boolean) => {
    patchEvent({
      eventHasRegEnd: value,
    });
  };

  const updateEventRegEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventRegEndDate: e.target.value,
    });
  };

  const updateEventRegEndTime = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventRegEndTime: e.target.value,
    });
  };

  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const fileName = e.target.files[0].name;
      writeImageToLocalStorage(e.target.files[0]);
      patchEvent({
        eventImage: e.target.files[0],
        eventImageValid: true,
        imageStorageKey: fileName,
      });
    }
  };

  const updateEventImageFromStorage = (
    imageUrl: string,
    oldEventObject: EventObjectProps,
  ) => {
    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], oldEventObject.imageStorageKey, {
          type: blob.type,
          lastModified: Date.now(),
        });

        setEventObject(() => ({
          ...oldEventObject,
          eventImage: file,
          eventImageValid: true,
          currentStep: oldEventObject.currentStep,
        }));
      });
  };

  const updateHasCapacity = (id: number) => {
    patchEvent({ eventHasCapacity: id === 2 });
  };

  const updateEventCapacity = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventCapacity: e.target.value,
    });
  };

  const updateVisibility = (id: number) => {
    patchEvent({
      eventVisibility: id === 2 ? Visibility.UNLISTED : Visibility.PUBLIC,
    });
  };

  const updateHasFood = (id: number) => {
    patchEvent({ eventHasFood: id === 2 });
  };

  const setEventHasExternalRegistration = (value: boolean) => {
    patchEvent((current) => ({
      eventHasExternalRegistration: value,
      eventExternalUrl: value ? current.eventExternalUrl : "",
    }));
  };

  const updateEventExternalUrl = (e: ChangeEvent<HTMLInputElement>) => {
    patchEvent({
      eventExternalUrl: e.target.value,
    });
  };

  const setEventHasFormQuestion = (value: boolean) => {
    patchEvent((current) => ({
      eventHasFormQuestion: value,
      eventFormQuestion: value ? current.eventFormQuestion : "",
    }));
  };

  const updateEventFormQuestion = (e: ChangeEvent<HTMLTextAreaElement>) => {
    patchEvent({
      eventFormQuestion: e.target.value,
    });
  };

  const updateImageCached = (cached: ImageCaching) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      imageCached: cached,
    }));
  };

  const inputPageOnClick = (step: number) => {
    patchEvent((current) => ({
      currentStep: step === stepCount ? current.currentStep : step,
      reachedStep: Math.max(current.reachedStep, step),
    }));
  };

  const summaryPageOnClick = async (formData: FormData) => {
    if (!user) {
      return redirectToLogin();
    }

    try {
      const event: Event = await fetchFromPeoplyApiJson("/events", {
        method: "post",
        body: formData,
      });
      addSnack("Ditt arrangement har blitt opprettet", SnackTypes.SUCCESS);
      localStorage.removeItem("eventObject");
      localStorage.removeItem("eventImage");
      router.replace(`/events/${event.urlId}`);
    } catch {
      addSnack(
        "Det skjedde en feil under opprettelsen av arrangementet",
        SnackTypes.ERROR,
      );
    }
  };

  /* TODO: Maybe move this logic into the `allEventInputsValid` function instead. */
  const [eventTitleValid, setEventTitleValid] = useState(false);
  const [eventDescriptionValid, setEventDescriptionValid] = useState(false);
  const [eventActiveCategoriesValid, setEventActiveCategoriesValid] =
    useState(false);
  const [eventAddressValid, setEventAddressValid] = useState(false);

  /* validate fields to fill progressbar on refresh */
  /* title */
  const { eventTitle, eventDescription, eventActiveCategories } = eventObject;
  if (
    !eventTitleValid &&
    eventTitle.length >= eventTitleMinLength &&
    eventTitle.length <= eventTitleMaxLength
  ) {
    setEventTitleValid(true);
  }

  /* address */
  if (
    !eventAddressValid &&
    eventObject.eventLocationName.length >= eventLocationNameMinLength &&
    eventObject.eventLocationName.length <= eventLocationNameMaxLength
  ) {
    setEventAddressValid(true);
  }

  /* description */
  if (
    !eventDescriptionValid &&
    eventDescription.length >= eventDescriptionMinLength &&
    eventDescription.length <= eventDescriptionMaxLength &&
    eventActiveCategories.length > 0
  ) {
    setEventDescriptionValid(true);
    setEventActiveCategoriesValid(true);
  }

  const eventDateStartValid = dateInputStartValid(eventObject.eventDateStart);
  const eventTimeStartValid = timeInputStartValid(
    eventObject.eventTimeStart,
    eventObject.eventDateStart,
  );
  const eventDateEndValid = eventObject.eventDateEnd
    ? dateInputEndValid(eventObject.eventDateStart, eventObject.eventDateEnd)
    : true;

  const eventTimeEndValid =
    eventObject.eventTimeEnd && eventObject.eventDateEnd // if both are there
      ? timeInputEndValid(
          eventObject.eventTimeStart,
          eventObject.eventTimeEnd,
          eventObject.eventDateStart,
          eventObject.eventDateEnd,
        )
      : // if both are not there
        !!(!eventObject.eventTimeEnd && !eventObject.eventDateEnd);

  const eventCapacityValid = radioInputValid(
    eventObject.eventHasCapacity,
    parseInt(eventObject.eventCapacity, 10),
    0,
    10000,
  );

  const {
    eventRegStartDate,
    eventRegStartTime,
    eventRegEndDate,
    eventRegEndTime,
    eventDateStart,
    eventTimeStart,
    eventDateEnd,
    eventTimeEnd,
    eventHasRegStart,
    eventHasRegEnd,
  } = eventObject;
  const regStartDateValid = eventHasRegStart
    ? isEventRegStartDateValid(eventRegStartDate, eventDateStart)
    : true;
  const regStartTimeValid = eventHasRegStart
    ? isEventRegStartTimeValid(
        eventRegStartDate,
        eventRegStartTime,
        eventDateStart,
        eventTimeStart,
      )
    : true;

  const regEndDateValid = eventHasRegEnd
    ? isEventRegEndDateValid(eventRegStartDate, eventRegEndDate, eventDateStart)
    : true;

  const regEndTimeValid = eventHasRegEnd
    ? isEventRegEndTimeValid(
        eventRegStartDate,
        eventRegStartTime,
        eventRegEndDate,
        eventRegEndTime,
        eventDateEnd ?? undefined,
        eventTimeEnd ?? undefined,
      )
    : true;

  const externalRegistrationUrlValid =
    !eventObject.eventHasExternalRegistration ||
    /^https?:\/\/\S+$/i.test(eventObject.eventExternalUrl.trim());

  const lastStep = eventObject.currentStep === 6;

  const validEvent = allEventInputsValid([
    eventTitleValid,
    eventDescriptionValid,
    eventAddressValid,
    eventDateStartValid,
    eventTimeStartValid,
    eventDateEndValid,
    eventTimeEndValid,
    regStartDateValid,
    regStartTimeValid,
    regEndDateValid,
    regEndTimeValid,
    externalRegistrationUrlValid,
    eventActiveCategoriesValid,
    eventCapacityValid,
    eventImageValid,
    lastStep,
  ]);

  const summaryCategories = eventObject.eventActiveCategories.map((catId) => {
    return {
      id: catId,
      name: getCategoryText(categories, catId),
    };
  });

  const selectedPrimaryOrganizationId = orgs?.find(
    (organization) => organization.arrangerId === eventObject.eventArrangerId,
  )?.id;

  const coOrganizerOptions = (organizations ?? [])
    .filter((organization) => organization.id !== selectedPrimaryOrganizationId)
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
      eventObject.eventCoOrganizerOrganizationIds.includes(organization.id),
    )
    .map((organization) => organization.label);

  const titleInputPageValid = eventTitleValid;
  const dateInputPageValid =
    eventDateStartValid &&
    eventTimeStartValid &&
    eventDateEndValid &&
    eventTimeEndValid &&
    regStartDateValid &&
    regStartTimeValid &&
    regEndDateValid &&
    regEndTimeValid &&
    externalRegistrationUrlValid;
  const addressInputPageValid = eventAddressValid;
  const descriptionInputPageValid =
    eventDescriptionValid && eventActiveCategoriesValid;
  const imageInputPageValid = eventImageValid;
  const extraInfoInputPageValid = eventCapacityValid;

  const validDataMap: Map<InputPages, boolean> = new Map();
  validDataMap.set(InputPages.TITLE_PAGE, titleInputPageValid);
  validDataMap.set(InputPages.DATE_PAGE, dateInputPageValid);
  validDataMap.set(InputPages.ADDRESS_PAGE, addressInputPageValid);
  validDataMap.set(InputPages.DESCRIPTION_PAGE, descriptionInputPageValid);
  validDataMap.set(InputPages.IMAGE_PAGE, imageInputPageValid);
  validDataMap.set(
    InputPages.EXTRA_INFO_PAGE,
    extraInfoInputPageValid && eventExtraInfoValid,
  );
  validDataMap.set(InputPages.SUMMARY_PAGE, validEvent);

  const validArrangersOptions = ((): ArrangerOption[] => {
    if (!user) return [];
    const validArrangers = orgs?.filter((org) => {
      const userRoleInOrganization = org.organizationRoles.find((userRole) => {
        return (
          userRole.userId === user?.id &&
          getOrganizationRolePrivilege(userRole.role) >
            getOrganizationRolePrivilege(OrganizationRole.MEMBER)
        );
      });
      return userRoleInOrganization !== undefined;
    });

    const userOption = {
      label: `${user.firstName} ${user.lastName}`,
      value: user.arrangerId,
      user,
    };
    const orgOptions = validArrangers?.map((org) => ({
      label: org.name,
      value: org.arrangerId,
      organization: org,
    }));
    return orgOptions ? [userOption, ...orgOptions] : [userOption];
  })();

  async function updateLocalStorage(writeObject: EventObjectProps) {
    writeObject.eventExtraInfoValid = eventExtraInfoValid;
    writeObject.eventImageValid = eventImageValid;

    const eventStorageString = JSON.stringify(writeObject);
    localStorage.setItem("eventObject", eventStorageString);
  }

  async function writeImageToLocalStorage(file: File) {
    if (file.size > 4500000) {
      updateImageCached(ImageCaching.PREEMPTIVE_MESSAGE);
      localStorage.removeItem("eventImage");
      return;
    }
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (reader.result) {
        localStorage.setItem("eventImage", reader.result.toString());
      }
    });
    reader.readAsDataURL(file);
    updateImageCached(ImageCaching.OK);
  }

  function parseImageFromLocalStorage(eventObject: EventObjectProps) {
    const eventImageDataUrl = localStorage.getItem("eventImage");

    if (eventImageDataUrl) {
      updateEventImageFromStorage(eventImageDataUrl, eventObject);
    } else {
      setEventObject(() => ({
        ...eventObject,
        eventImage: undefined,
        currentStep: eventObject.currentStep,
      }));
    }
  }

  function parseLocalStorage() {
    const existingEvent = window.localStorage.getItem("eventObject");
    const parsedEvent = existingEvent && JSON.parse(existingEvent);
    if (parsedEvent) {
      setEventImageValid(parsedEvent.eventImageValid);
      setEventExtraInfoValid(parsedEvent.eventExtraInfoValid);
    }
    return parsedEvent;
  }

  function startNewEventCreation() {
    localStorage.removeItem("eventObject");
    localStorage.removeItem("eventImage");
  }

  function continueEventCreation() {
    const oldEventObject = parseLocalStorage();
    if (!oldEventObject) {
      //in case of parsing error, start new event creation
      startNewEventCreation();
    }
    oldEventObject.eventHasExternalRegistration ??= false;
    oldEventObject.eventExternalUrl ??= "";
    oldEventObject.eventCoOrganizerOrganizationIds ??= [];
    setEventExtraInfoValid(oldEventObject.eventExtraInfoValid);

    /* arrangerId will be undefined if user was not logged in */
    if (oldEventObject.eventArrangerId === "" && user) {
      oldEventObject.eventArrangerId = user.arrangerId;
    }

    if (oldEventObject.imageCached === ImageCaching.PREEMPTIVE_MESSAGE) {
      setEventImageValid(false);
      setEventObject(() => ({
        ...oldEventObject,
        eventImage: undefined,
        imageCached: ImageCaching.REFRESH_MESSAGE,
        eventImageValid: false,
        currentStep: 4,
      }));
    } else {
      parseImageFromLocalStorage(oldEventObject);
      setEventImageValid(oldEventObject.eventImageValid);
    }
  }

  useEffect(() => {
    if (localStorage.getItem("eventObject")) {
      setModalOpen(true);
    }
  }, []);

  /* The state initializer runs before the user has loaded, so a fresh visit
     starts with an empty arrangerId. Without this backfill the POST is
     rejected by the backend unless the user touches the arranger dropdown. */
  useEffect(() => {
    if (!user?.arrangerId) {
      return;
    }
    setEventObject((prevEventObject) =>
      prevEventObject.eventArrangerId === ""
        ? { ...prevEventObject, eventArrangerId: user.arrangerId }
        : prevEventObject,
    );
  }, [user?.arrangerId]);

  useEffect(() => {
    if (!coOrganizerOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        coOrganizerCardRef.current &&
        !coOrganizerCardRef.current.contains(event.target as Node)
      ) {
        setCoOrganizerOpen(false);
        setCoOrganizerSearch("");
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCoOrganizerOpen(false);
        setCoOrganizerSearch("");
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [coOrganizerOpen]);

  return {
    // Data.
    ipInfo,
    categories,
    eventObject,
    stepCount,

    // "Continue previous event?" modal.
    modalOpen,
    setModalOpen,

    // Co-organizer search UI state.
    coOrganizerOpen,
    setCoOrganizerOpen,
    coOrganizerSearch,
    setCoOrganizerSearch,
    coOrganizerCardRef,
    coOrganizerOptions,
    visibleCoOrganizerOptions,
    selectedCoOrganizerNames,
    toggleCoOrganizerOrganization,
    validArrangersOptions,

    // Field handlers.
    updateEventTitle,
    updateEventArrangerId,
    updateEventDescription,
    updateEventLocationName,
    updateEventLocation,
    updateEventCategories,
    updateEventDateStart,
    updateEventTimeStart,
    setEventHasDateEnd,
    updateEventDateEnd,
    updateEventTimeEnd,
    seteventHasRegStart,
    updateEventRegStartDate,
    updateEventRegStartTime,
    seteventHasRegEnd,
    updateEventRegEndDate,
    updateEventRegEndTime,
    updateEventImage,
    updateHasCapacity,
    updateEventCapacity,
    updateVisibility,
    updateHasFood,
    setEventHasExternalRegistration,
    updateEventExternalUrl,
    setEventHasFormQuestion,
    updateEventFormQuestion,

    // Step navigation / submission.
    inputPageOnClick,
    summaryPageOnClick,

    // Validity state + setters (some are handed to `InputPage` so it can flag
    // a step valid on mount, see `setEventImageValid`/`setEventExtraInfoValid`).
    eventTitleValid,
    setEventTitleValid,
    eventDescriptionValid,
    setEventDescriptionValid,
    eventActiveCategoriesValid,
    setEventActiveCategoriesValid,
    eventAddressValid,
    setEventAddressValid,
    eventImageValid,
    setEventImageValid,
    eventExtraInfoValid,
    setEventExtraInfoValid,
    eventDateStartValid,
    eventTimeStartValid,
    eventDateEndValid,
    eventTimeEndValid,
    eventCapacityValid,
    regStartDateValid,
    regStartTimeValid,
    regEndDateValid,
    regEndTimeValid,
    externalRegistrationUrlValid,
    validEvent,
    validDataMap,

    // Summary page inputs.
    summaryCategories,

    // localStorage continue-flow.
    startNewEventCreation,
    continueEventCreation,
  };
}
