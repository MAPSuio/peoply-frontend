// Next.js.
import { useRouter } from "next/router";

// React.
import { ChangeEvent, useEffect, useRef, useState } from "react";

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
  getInputPageData,
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
  Event,
  InputPages,
  Organization,
  Visibility,
  ImageCaching,
  SnackTypes,
  OrganizationRole,
} from "../types/types";
import { AzureMapsSearchFuzzyResult } from "../types/azureMaps";

export interface EventObjectProps {
  eventTitle: string;
  eventArrangerId: string;
  eventCoOrganizerOrganizationIds: string[];
  eventDescription: string;
  eventLocationName: string;
  eventLocation?: AzureMapsSearchFuzzyResult;
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

  const updateEventTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventTitle: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTitle: e.target.value,
    });
  };

  const updateEventArrangerId = (arrangerId: string) => {
    const primaryOrganizationId = orgs?.find(
      (organization) => organization.arrangerId === arrangerId,
    )?.id;
    const nextCoOrganizerOrganizationIds = primaryOrganizationId
      ? eventObject.eventCoOrganizerOrganizationIds.filter(
          (organizationId) => organizationId !== primaryOrganizationId,
        )
      : eventObject.eventCoOrganizerOrganizationIds;

    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventArrangerId: arrangerId,
      eventCoOrganizerOrganizationIds: nextCoOrganizerOrganizationIds,
    }));
    updateLocalStorage({
      ...eventObject,
      eventArrangerId: arrangerId,
      eventCoOrganizerOrganizationIds: nextCoOrganizerOrganizationIds,
    });
  };

  const toggleCoOrganizerOrganization = (organizationId: string) => {
    const nextCoOrganizerOrganizationIds =
      eventObject.eventCoOrganizerOrganizationIds.includes(organizationId)
        ? eventObject.eventCoOrganizerOrganizationIds.filter(
            (id) => id !== organizationId,
          )
        : [...eventObject.eventCoOrganizerOrganizationIds, organizationId];

    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventCoOrganizerOrganizationIds: nextCoOrganizerOrganizationIds,
    }));

    updateLocalStorage({
      ...eventObject,
      eventCoOrganizerOrganizationIds: nextCoOrganizerOrganizationIds,
    });
  };

  const updateEventDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventDescription: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDescription: e.target.value,
    });
  };

  const updateEventLocationName = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventLocationName: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventLocationName: e.target.value,
    });
  };

  const updateEventLocation = (loc?: AzureMapsSearchFuzzyResult) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventLocation: loc,
    }));
    updateLocalStorage({
      ...eventObject,
      eventLocation: loc,
    });
  };

  /* will toggle category */
  const updateEventCategories = (categoryId: number) => {
    const newEventCategories = eventObject.eventActiveCategories.includes(
      categoryId,
    )
      ? eventObject.eventActiveCategories.filter((id) => id !== categoryId)
      : [...eventObject.eventActiveCategories, categoryId];

    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventActiveCategories: newEventCategories,
    }));

    updateLocalStorage({
      ...eventObject,
      eventActiveCategories: newEventCategories,
    });
  };

  const updateEventDateStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventDateStart: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDateStart: e.target.value,
    });
  };

  const updateEventTimeStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventTimeStart: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTimeStart: e.target.value,
    });
  };

  const setEventHasDateEnd = (value: boolean) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventHasDateEnd: value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasDateEnd: value,
    });
  };

  const updateEventDateEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventDateEnd: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDateEnd: e.target.value,
    });
  };

  const updateEventTimeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventTimeEnd: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTimeEnd: e.target.value,
    });
  };

  const seteventHasRegStart = (value: boolean) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventHasRegStart: value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasRegStart: value,
    });
  };

  const updateEventRegStartDate = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventRegStartDate: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventRegStartDate: e.target.value,
    });
  };

  const updateEventRegStartTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventRegStartTime: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventRegStartTime: e.target.value,
    });
  };

  const seteventHasRegEnd = (value: boolean) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventHasRegEnd: value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasRegEnd: value,
    });
  };

  const updateEventRegEndDate = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventRegEndDate: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventRegEndDate: e.target.value,
    });
  };

  const updateEventRegEndTime = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventRegEndTime: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventRegEndTime: e.target.value,
    });
  };

  /* TODO: Fix this TS error. */
  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      //should we add check for same filename to avoid excess writes?
      writeImageToLocalStorage(e.target.files[0]);
      setEventObject((prevEventObject) => ({
        ...prevEventObject,
        // @ts-ignore
        eventImage: e.target.files[0],
        eventImageValid: true,
        imageStorageKey: fileName,
      }));
      updateLocalStorage({
        ...eventObject,
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
          lastModified: new Date().getTime(),
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
    if (id === 2) {
      setEventObject((prevEventObject) => ({
        ...prevEventObject,
        eventHasCapacity: true,
      }));
    } else {
      setEventObject((prevEventObject) => ({
        ...prevEventObject,
        eventHasCapacity: false,
      }));
    }
    updateLocalStorage({
      ...eventObject,
      eventHasCapacity: id === 2,
    });
  };

  const updateEventCapacity = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventCapacity: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventCapacity: e.target.value,
    });
  };

  const updateVisibility = (id: number) => {
    let visibility = Visibility.PUBLIC;
    switch (id) {
      case 1:
        setEventObject((prevEventObject) => ({
          ...prevEventObject,
          eventVisibility: Visibility.PUBLIC,
        }));
        break;

      case 2:
        visibility = Visibility.UNLISTED;
        setEventObject((prevEventObject: EventObjectProps) => ({
          ...prevEventObject,
          eventVisibility: Visibility.UNLISTED,
        }));
        break;

      default:
        break;
    }
    updateLocalStorage({
      ...eventObject,
      eventVisibility: visibility,
    });
  };

  const updateHasFood = (id: number) => {
    let eventHasFood = false;
    switch (id) {
      case 1:
        setEventObject((prevEventObject) => ({
          ...prevEventObject,
          eventHasFood: false,
        }));
        break;

      case 2:
        eventHasFood = true;
        setEventObject((prevEventObject: EventObjectProps) => ({
          ...prevEventObject,
          eventHasFood: true,
        }));
        break;

      default:
        break;
    }
    updateLocalStorage({
      ...eventObject,
      eventHasFood: eventHasFood,
    });
  };

  const setEventHasExternalRegistration = (value: boolean) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventHasExternalRegistration: value,
      eventExternalUrl: value ? prevEventObject.eventExternalUrl : "",
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasExternalRegistration: value,
      eventExternalUrl: value ? eventObject.eventExternalUrl : "",
    });
  };

  const updateEventExternalUrl = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventExternalUrl: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventExternalUrl: e.target.value,
    });
  };

  const setEventHasFormQuestion = (value: boolean) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventHasFormQuestion: value,
      eventFormQuestion: value ? eventObject.eventFormQuestion : "",
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasFormQuestion: value,
      eventFormQuestion: value ? eventObject.eventFormQuestion : "",
    });
  };

  const updateEventFormQuestion = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventFormQuestion: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
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
    if (step !== stepCount) {
      setEventObject((prevEventObject) => ({
        ...prevEventObject,
        currentStep: step,
      }));
    }
    if (step > eventObject.reachedStep) {
      setEventObject((prevEventObject) => ({
        ...prevEventObject,
        reachedStep: step,
      }));
    }
    updateLocalStorage({
      ...eventObject,
      currentStep: step,
      eventImageValid: eventImageValid,
      eventExtraInfoValid: eventExtraInfoValid,
    });
  };

  const summaryPageOnClick = async (formData: FormData) => {
    {
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
      : !eventObject.eventTimeEnd && !eventObject.eventDateEnd // if both are not there
        ? true
        : false;

  const eventCapacityValid = radioInputValid(
    eventObject.eventHasCapacity,
    parseInt(eventObject.eventCapacity),
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

  const validArrangersOptions = (() => {
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
      label: `${user?.firstName} ${user?.lastName}`,
      value: user?.arrangerId,
    };
    const orgOptions = validArrangers?.map((org) => ({
      label: org.name,
      value: org.arrangerId,
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
    updateLocalStorage(eventObject);
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
