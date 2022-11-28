// Next.js.
import { GetStaticProps } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";

// React.
import { useState, ChangeEvent, useEffect } from "react";

// Components.
import DateInput from "../../components/inputs/DateInput";
import TimeInput from "../../components/inputs/TimeInput";
import TextInput from "../../components/inputs/TextInput";
import TextInputLong from "../../components/inputs/TextInputLong";
import NumberInput from "../../components/inputs/NumberInput";
import CategoryInput from "../../components/inputs/CategoryInput";
import ImageInput from "../../components/inputs/ImageInput";
import RadioInput from "../../components/inputs/RadioInput";
import Modal from "../../components/Modal";
import TextInputLocationSelect from "../../components/inputs/TextInputLocationSelect";
import Dropdown from "../../components/Dropdown";
import HeadComponent from "../../components/HeadComponent";
import ModalButton from "../../components/ModalButton";
import CheckboxInput from "../../components/inputs/CheckboxInput";

import SummaryPage from "../../components/SummaryPage";
import InputPage from "../../components/InputPage";

import NoLimitIcon from "../../components/svgs/NoLimitIcon";
import LimitIcon from "../../components/svgs/LimitIcon";
import UnlistedIcon from "../../components/svgs/UnlistedIcon";
import PublicIcon from "../../components/svgs/PublicIcon";
import PlusIcon from "../../components/svgs/PlusIcon";
import MinusIcon from "../../components/svgs/MinusIcon";
import NoFoodIcon from "../../components/svgs/NoFoodIcon";
import FoodIcon from "../../components/svgs/FoodIcon";

// Hooks.
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useUser from "../../hooks/useUser";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import useSnack from "../../hooks/useSnack";

// Utils
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
} from "../../utils/functions";

import {
  eventDescriptionMaxLength,
  eventDescriptionMinLength,
  eventLocationNameMaxLength,
  eventLocationNameMinLength,
  eventTitleMaxLength,
  eventTitleMinLength,
} from "../../utils/constants";

import {
  isEventRegEndDateValid,
  isEventRegEndTimeValid,
  isEventRegStartDateValid,
  isEventRegStartTimeValid,
} from "../../utils/event";

// Types.
import {
  Event,
  InputPages,
  Visibility,
  ImageCaching,
  SnackTypes,
  OrganizationRole,
  ButtonType,
} from "../../types/types";
import { Models } from "azure-maps-rest";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

export interface EventObjectProps {
  eventTitle: string;
  eventArrangerId: string;
  eventDescription: string;
  eventLocationName: string;
  eventLocation?: Models.SearchFuzzyResult;
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

interface CreateEventProps {
  baseUrl: string;
}

const CreateEvent = ({ baseUrl }: CreateEventProps) => {
  const { user, ipInfo, error: userError, orgs } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventExtraInfoValid, setEventExtraInfoValid] = useState(false);
  const [eventImageValid, setEventImageValid] = useState(false);

  const [eventObject, setEventObject] = useState<EventObjectProps>({
    eventTitle: "",
    eventArrangerId: user?.arrangerId ?? "",
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
  const { data: categories, error: categoriesError } = useSWR(
    "/categories",
    fetchFromPeoplyApiJson,
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
    setEventObject((prevEventObject) => ({
      ...prevEventObject,
      eventArrangerId: arrangerId,
    }));
    updateLocalStorage({
      ...eventObject,
      eventArrangerId: arrangerId,
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

  const updateEventLocation = (loc?: Models.SearchFuzzyResult) => {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
      } catch (e) {
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
    eventDescription.length > eventDescriptionMinLength &&
    eventDescription.length < eventDescriptionMaxLength &&
    eventActiveCategories.length
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

  /* TODO: Perhaps move the returned components into their own wrapper components. */
  const getCurrentInputPage = (step: number) => {
    const { title, subTitle, buttonText } = getInputPageData(step);
    const titleInputPageValid = eventTitleValid;
    const dateInputPageValid =
      eventDateStartValid &&
      eventTimeStartValid &&
      eventDateEndValid &&
      eventTimeEndValid &&
      regStartDateValid &&
      regStartTimeValid &&
      regEndDateValid &&
      regEndTimeValid;
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
        const userRoleInOrganization = org.organizationRoles.find(
          (userRole) => {
            return (
              userRole.userId === user?.id &&
              getOrganizationRolePrivilege(userRole.role) >
                getOrganizationRolePrivilege(OrganizationRole.MEMBER)
            );
          },
        );
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

    switch (step) {
      case 0:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.TITLE_PAGE}
            firstPage
            buttonOnClick={inputPageOnClick}
          >
            <div className={styles.textContainer}>
              <TextInput
                value={eventObject.eventTitle}
                inputId="title"
                inputName="eventTitle"
                label="Tittel på arrangementet*"
                placeholder="F.eks. Peoply launch party"
                maxLength={eventTitleMaxLength}
                minLength={eventTitleMinLength}
                errorMessage={`Tittelen må være mellom ${eventTitleMinLength} og ${eventTitleMaxLength} tegn`}
                required
                handleChange={updateEventTitle}
                setValid={setEventTitleValid}
                valid={eventTitleValid}
                validate
              />
              {validArrangersOptions.length > 0 && (
                <Dropdown
                  label="Opprett arrangementet som: "
                  options={validArrangersOptions}
                  value={eventObject.eventArrangerId}
                  inputId="arrangerInput"
                  className={styles.arrangerInput}
                  setValue={updateEventArrangerId}
                />
              )}
            </div>
          </InputPage>
        );
      case 1:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.DATE_PAGE}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic={[
              eventObject.eventHasDateEnd,
              eventObject.eventHasRegStart,
              eventObject.eventHasRegEnd,
            ].some((cond) => cond)}
          >
            <div className={styles.dateContainer}>
              <div className={styles.dateColumn}>
                <DateInput
                  value={eventObject.eventDateStart}
                  valid={eventDateStartValid}
                  inputId="dateStart"
                  inputName="eventDateStart"
                  label="Dato start*"
                  errorMessage="Dato må være i dag eller i fremtiden."
                  required
                  handleChange={updateEventDateStart}
                />
                <TimeInput
                  value={eventObject.eventTimeStart}
                  valid={eventTimeStartValid}
                  inputId="timeStart"
                  inputName="eventTimeStart"
                  label="Tidspunkt start*"
                  errorMessage="Tiden må være i fremtiden."
                  required
                  handleChange={updateEventTimeStart}
                />
              </div>
              {!eventObject.eventHasDateEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => setEventHasDateEnd(true)}
                >
                  <PlusIcon className={styles.addDateDimensions} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {eventObject.eventHasDateEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => setEventHasDateEnd(false)}
                >
                  <MinusIcon className={styles.addDateDimensions} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {eventObject.eventHasDateEnd && (
                <div className={styles.dateContainer}>
                  <div className={styles.dateColumn}>
                    <DateInput
                      value={eventObject.eventDateEnd || ""}
                      valid={eventDateEndValid}
                      inputId="dateEnd"
                      inputName="eventDateEnd"
                      label="Dato slutt*"
                      errorMessage="Sluttdato kan ikke være før startdato."
                      required
                      handleChange={updateEventDateEnd}
                    />
                    <TimeInput
                      value={eventObject.eventTimeEnd || ""}
                      valid={eventTimeEndValid}
                      inputId="timeEnd"
                      inputName="eventTimeEnd"
                      label="Tidspunkt slutt*"
                      errorMessage="Sluttidspunkt kan ikke være før starttidspunkt."
                      required
                      handleChange={updateEventTimeEnd}
                    />
                  </div>
                </div>
              )}
              <div className={styles.scheduledRegContainer}>
                {!eventObject.eventHasRegStart && (
                  <button
                    className={styles.addDateContainer}
                    onClick={() => seteventHasRegStart(true)}
                  >
                    <PlusIcon className={styles.addDateDimensions} />
                    <p className={styles.addDateText}>Påmeldingen åpner</p>
                  </button>
                )}
                {eventObject.eventHasRegStart && (
                  <button
                    className={styles.addDateContainer}
                    onClick={() => seteventHasRegStart(false)}
                  >
                    <MinusIcon className={styles.addDateDimensions} />
                    <p className={styles.addDateText}>Påmeldingen åpner</p>
                  </button>
                )}
                {eventObject.eventHasRegStart && (
                  <div className={styles.dateContainer}>
                    <div className={styles.dateColumn}>
                      <DateInput
                        value={eventObject.eventRegStartDate || ""}
                        valid={regStartDateValid}
                        inputId="regDateStart"
                        inputName="eventRegDateStart"
                        label="Dato åpning*"
                        errorMessage="Påmelding må åpne før startdato."
                        required
                        handleChange={updateEventRegStartDate}
                      />
                      <TimeInput
                        value={eventObject.eventRegStartTime || ""}
                        valid={regStartTimeValid}
                        inputId="regTimeStart"
                        inputName="eventRegTimeStart"
                        label="Tidspunkt åpning*"
                        errorMessage="Påmelding må åpne før startdato."
                        required
                        handleChange={updateEventRegStartTime}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className={styles.scheduledRegContainer}>
                {!eventObject.eventHasRegEnd && (
                  <button
                    className={styles.addDateContainer}
                    onClick={() => seteventHasRegEnd(true)}
                  >
                    <PlusIcon className={styles.addDateDimensions} />
                    <p className={styles.addDateText}>Påmeldingen stenger</p>
                  </button>
                )}
                {eventObject.eventHasRegEnd && (
                  <button
                    className={styles.addDateContainer}
                    onClick={() => seteventHasRegEnd(false)}
                  >
                    <MinusIcon className={styles.addDateDimensions} />
                    <p className={styles.addDateText}>Påmeldingen stenger</p>
                  </button>
                )}
                {eventObject.eventHasRegEnd && (
                  <div className={styles.dateContainer}>
                    <div className={styles.dateColumn}>
                      <DateInput
                        value={eventObject.eventRegEndDate || ""}
                        valid={regEndDateValid}
                        inputId="regDateEnd"
                        inputName="eventRegDateEnd"
                        label="Dato frist*"
                        errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato."
                        required
                        handleChange={updateEventRegEndDate}
                      />
                      <TimeInput
                        value={eventObject.eventRegEndTime || ""}
                        valid={regEndTimeValid}
                        inputId="regTimeEnd"
                        inputName="eventRegTimeEnd"
                        label="Tidspunkt frist*"
                        errorMessage="Påmeldingsfristen må være etter påmeldingsåpning og før sluttdato"
                        required
                        handleChange={updateEventRegEndTime}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </InputPage>
        );
      case 2:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.ADDRESS_PAGE}
            buttonOnClick={inputPageOnClick}
            padding
          >
            <div className={styles.textContainer}>
              <TextInput
                value={eventObject.eventLocationName}
                inputId="locationName"
                inputName="eventLocationName"
                label="Kallenavn på stedet*"
                placeholder="F.eks. Bliss"
                maxLength={eventLocationNameMaxLength}
                minLength={eventLocationNameMinLength}
                errorMessage="Du må oppgi et kallenavn på stedet."
                required
                handleChange={updateEventLocationName}
                setValid={setEventAddressValid}
                valid={eventAddressValid}
                validate
              />
              <br />
              <br />
              <TextInputLocationSelect
                inputId="address"
                inputName="eventAddress"
                label="Legg til en adresse"
                placeholder="F.eks. Gaustadalléen 23B"
                onLocationSelect={updateEventLocation}
                selectedLocation={eventObject.eventLocation}
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
            </div>
          </InputPage>
        );
      case 3:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.DESCRIPTION_PAGE}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic
          >
            <div className={styles.textContainer}>
              <div className={styles.column}>
                <TextInputLong
                  value={eventObject.eventDescription}
                  inputId="description"
                  inputName="eventDescription"
                  rows={12}
                  label="Beskrivelse av arrangementet*"
                  placeholder="F.eks. Peoply inviterer til julebord. Det blir god mat og forhåpentligvis god stemning!"
                  maxLength={eventDescriptionMaxLength}
                  errorMessage="Beskrivelsen kan ikke være tom"
                  required
                  handleChange={updateEventDescription}
                  validate
                  valid={eventDescriptionValid}
                  setValid={setEventDescriptionValid}
                />
                <CategoryInput
                  categories={categories}
                  activeCategories={eventObject.eventActiveCategories}
                  errorMessage="Du må velge minst en kategori."
                  onClick={updateEventCategories}
                  setValid={setEventActiveCategoriesValid}
                  valid={eventActiveCategoriesValid}
                />
              </div>
            </div>
          </InputPage>
        );
      case 4:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.IMAGE_PAGE}
            setEventImageValid={setEventImageValid}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic
          >
            <ImageInput
              value={eventObject.eventImage}
              inputId="image"
              inputName="eventImage"
              label="Last opp et bilde til arrangementet"
              buttonLabel="Endre bilde"
              errorMessage="Bildet kan ikke være så stort."
              onChange={updateEventImage}
              imageCached={eventObject.imageCached}
            />
          </InputPage>
        );
      case 5:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            placeButtonStatic
            validDataMap={validDataMap}
            page={InputPages.EXTRA_INFO_PAGE}
            setEventExtraInfoValid={setEventExtraInfoValid}
            buttonOnClick={inputPageOnClick}
          >
            <div className={`${styles.column} ${styles.gapLarge}`}>
              <div>
                <RadioInput
                  optionsAndIcons={[
                    {
                      id: 1,
                      text: "offentlig",
                      hintText:
                        "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                      icon: PublicIcon,
                      active: eventObject.eventVisibility === Visibility.PUBLIC,
                    },
                    {
                      id: 2,
                      text: "ikke oppført",
                      hintText:
                        "Ikke synlig for offentligheten, men alle med lenken kan se arrangementet, inkludert personer uten brukerkonto.",
                      icon: UnlistedIcon,
                      active:
                        eventObject.eventVisibility === Visibility.UNLISTED,
                    },
                  ]}
                  onClick={updateVisibility}
                  label="Privat eller ikke oppført arrangement?"
                />
              </div>
              <div>
                <RadioInput
                  optionsAndIcons={[
                    {
                      id: 1,
                      text: "ingen",
                      icon: NoLimitIcon,
                      active: !eventObject.eventHasCapacity,
                    },
                    {
                      id: 2,
                      text: "begrensning",
                      icon: LimitIcon,
                      active: eventObject.eventHasCapacity,
                    },
                  ]}
                  onClick={updateHasCapacity}
                  label="Skal arrangementet ha begrenset antall deltakere?"
                />
                {eventObject.eventHasCapacity && (
                  <NumberInput
                    value={eventObject.eventCapacity}
                    inputId="capacity"
                    inputName="eventCapacity"
                    label="Antall deltakere*"
                    placeholder="0"
                    errorMessage="Antall deltakere kan ikke være tom eller null."
                    required
                    handleChange={updateEventCapacity}
                  />
                )}
              </div>
              <div className={styles.eventHasFood}>
                <RadioInput
                  optionsAndIcons={[
                    {
                      id: 1,
                      text: "Ingen matsevering",
                      hintText:
                        "Mat skal ikke serveres. Du får da ikke tilgang på deltakerenes matpreferanser.",
                      icon: NoFoodIcon,
                      active: !eventObject.eventHasFood,
                    },
                    {
                      id: 2,
                      text: "Det serveres mat",
                      hintText:
                        "Det blir servert mat på arrangementet. Deltakernes matpreferanser vil bli synlig i deltakerlisten.",
                      icon: FoodIcon,
                      active: eventObject.eventHasFood,
                    },
                  ]}
                  onClick={updateHasFood}
                  label="Skal det serveres mat på arrangementet?"
                />
              </div>
              <div className={styles.FormQuestion}>
                <CheckboxInput
                  onChange={() =>
                    setEventHasFormQuestion(!eventObject.eventHasFormQuestion)
                  }
                  checked={eventObject.eventHasFormQuestion}
                  label="Spørsmål til deltakere"
                  checkboxId="FormQuestion"
                  checkboxName="FormQuestion"
                />
                {eventObject.eventHasFormQuestion && (
                  <TextInputLong
                    value={eventObject.eventFormQuestion ?? ""}
                    handleChange={updateEventFormQuestion}
                    inputId="FormQuestionInput"
                    inputName="FormQuestionInput"
                    label="Spørsmål til deltakere"
                    maxLength={100}
                    placeholder="F.eks. Hva er din favorittmat?"
                    errorMessage=""
                    rows={4}
                  />
                )}
              </div>
            </div>
          </InputPage>
        );
      case 6:
        return (
          <SummaryPage
            title={title}
            subTitle={subTitle}
            currentStep={eventObject.currentStep}
            reachedStep={eventObject.reachedStep}
            stepCount={stepCount}
            buttonText={buttonText}
            placeButtonStatic
            validDataMap={validDataMap}
            page={InputPages.SUMMARY_PAGE}
            buttonOnClick={inputPageOnClick}
            createEventFunction={summaryPageOnClick}
            changeStep={inputPageOnClick}
            summaryCategories={summaryCategories}
            eventObject={eventObject}
          />
        );
    }
  };

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

  return (
    <>
      <HeadComponent
        title="Nytt arrangement"
        description="Opprett et nytt arrangement på Peoply"
        url={`${baseUrl}/events/create`}
      />
      <div className={styles.wrapper}>
        {modalOpen && (
          <Modal
            label="Fortsett opprettelse av arrangement?"
            description="Vi ser at du har et tidligere arrangement som ikke ble postet. Vil du fortsette der du slapp, eller opprette et nytt arrangement?"
            closeButtonOnClick={() => {
              setModalOpen(false);
              startNewEventCreation();
            }}
          >
            <>
              <ModalButton
                text="Fortsett"
                onClick={() => {
                  continueEventCreation();
                  setModalOpen(false);
                }}
              />
              <ModalButton
                text="Opprett nytt"
                onClick={() => {
                  startNewEventCreation();
                  setModalOpen(false);
                }}
                type={ButtonType.SECONDARY}
              />
            </>
          </Modal>
        )}
        <div className={styles.container}>
          {getCurrentInputPage(eventObject.currentStep)}
        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    props: {
      baseUrl,
    },
  };
};

export default CreateEvent;
