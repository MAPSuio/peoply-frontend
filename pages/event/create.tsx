/* Next */
import { GetStaticProps } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";

/* React */
import { useState, ChangeEvent, useEffect } from "react";

/* Components */
import DateInput from "../../components/inputs/DateInput";
import TimeInput from "../../components/inputs/TimeInput";
import TextInput from "../../components/inputs/TextInput";
import TextInputLong from "../../components/inputs/TextInputLong";
import NumberInput from "../../components/inputs/NumberInput";
import CategoryInput from "../../components/inputs/CategoryInput";
import ImageInput from "../../components/inputs/ImageInput";
import RadioInput from "../../components/inputs/RadioInput";
import Modal from "../../components/Modal";

import SummaryPage from "../../components/SummaryPage";
import InputPage from "../../components/InputPage";

import NoLimitIcon from "../../components/svgs/NoLimitIcon";
import LimitIcon from "../../components/svgs/LimitIcon";
import UnlistedIcon from "../../components/svgs/UnlistedIcon";
import PublicIcon from "../../components/svgs/PublicIcon";
import PlusIcon from "../../components/svgs/PlusIcon";
import MinusIcon from "../../components/svgs/MinusIcon";

/* Hooks */
import { fetchFromPeoplyApiJson } from "../../services/fetchers";

/* Utils */
import {
  getInputPageData,
  allEventInputsValid,
  textInputValid,
  dateInputStartValid,
  timeInputStartValid,
  dateInputEndValid,
  timeInputEndValid,
  categoryInputValid,
  radioInputValid,
  getCategoryText,
} from "../../utils/functions";

/* Types. */
import {
  Event,
  InputPages,
  Visibility,
  ImageCaching,
  SnackTypes,
} from "../../types/types";

/* Styles */
import styles from "../../styles/CreateEvent.module.scss";
import useUser from "../../hooks/useUser";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import Header from "../../components/Header";
import useSnack from "../../hooks/useSnack";
import HeadComponent from "../../components/HeadComponent";

interface EventObjectProps {
  eventTitle: string;
  eventDescription: string;
  eventAddress: string;
  eventDateStart: string;
  eventDateEnd: string | null;
  eventHasDateEnd: boolean;
  eventTimeStart: string;
  eventTimeEnd: string | null;
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
}

interface CreateEventProps {
  baseUrl: string;
}

const CreateEvent = ({ baseUrl }: CreateEventProps) => {
  const { user, currentOrg, error: userError } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const [modalOpen, setModalOpen] = useState(false);
  const [eventExtraInfoValid, setEventExtraInfoValid] = useState(false);
  const [eventImageValid, setEventImageValid] = useState(false);

  const [eventObject, setEventObject] = useState<EventObjectProps>({
    eventTitle: "",
    eventDescription: "",
    eventAddress: "",
    eventDateStart: "",
    eventDateEnd: null,
    eventHasDateEnd: false,
    eventTimeStart: "",
    eventTimeEnd: null,
    eventActiveCategories: [],
    eventVisibility: Visibility.PUBLIC,
    eventHasCapacity: false,
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
  /* Might be useful later. */
  const today = new Date();

  /* Get all the possible event categories. */
  const { data: categories, error: categoriesError } = useSWR(
    "/categories",
    fetchFromPeoplyApiJson,
  );

  const updateEventTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventTitle: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTitle: e.target.value,
    });
  };

  const updateEventDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventDescription: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDescription: e.target.value,
    });
  };

  const updateEventAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventAddress: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventAddress: e.target.value,
    });
  };

  const updateEventCategories = (categoryId: number) => {
    if (!eventObject.eventActiveCategories.includes(categoryId)) {
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
        eventActiveCategories: [
          ...eventObject.eventActiveCategories,
          categoryId,
        ],
      }));
    }
    updateLocalStorage({
      ...eventObject,
      eventActiveCategories: [...eventObject.eventActiveCategories, categoryId],
    });
  };

  const updateEventDateStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventDateStart: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDateStart: e.target.value,
    });
  };

  const updateEventTimeStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventTimeStart: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTimeStart: e.target.value,
    });
  };

  const seteventHasDateEnd = (value: boolean) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventHasDateEnd: value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventHasDateEnd: value,
    });
  };

  const updateEventDateEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventDateEnd: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventDateEnd: e.target.value,
    });
  };

  const updateEventTimeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      eventTimeEnd: e.target.value,
    }));
    updateLocalStorage({
      ...eventObject,
      eventTimeEnd: e.target.value,
    });
  };

  /* TODO: Fix this TS error. */
  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      //should we add check for same filename to avoid excess writes?
      writeImageToLocalStorage(e.target.files[0]);
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
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
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
        eventHasCapacity: true,
      }));
    } else {
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
        eventHasCapacity: false,
      }));
    }
    updateLocalStorage({
      ...eventObject,
      eventHasCapacity: id === 2,
    });
  };

  const updateEventCapacity = (e: ChangeEvent<HTMLInputElement>) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
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
        setEventObject((prevEventOjbect) => ({
          ...prevEventOjbect,
          eventVisibility: Visibility.PUBLIC,
        }));
        break;

      case 2:
        visibility = Visibility.UNLISTED;
        setEventObject((prevEventOjbect: EventObjectProps) => ({
          ...prevEventOjbect,
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

  const updateImageCached = (cached: ImageCaching) => {
    setEventObject((prevEventOjbect) => ({
      ...prevEventOjbect,
      imageCached: cached,
    }));
  };

  const inputPageOnClick = (step: number) => {
    if (step !== stepCount) {
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
        currentStep: step,
      }));
    }
    if (step > eventObject.reachedStep) {
      setEventObject((prevEventOjbect) => ({
        ...prevEventOjbect,
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
      if (currentOrg) {
        formData.set("arrangerId", currentOrg.arrangerId);
      } else if (user) {
        formData.set("arrangerId", user.arrangerId);
      } else {
        redirectToLogin();
        return;
      }
      try {
        const event: Event = await fetchFromPeoplyApiJson("/events", {
          method: "post",
          body: formData,
        });
        addSnack("Ditt arrangement har blitt opprettet", SnackTypes.SUCCESS);
        localStorage.removeItem("eventObject");
        localStorage.removeItem("eventImage");
        router.push(`/event/${event.urlId}`);
      } catch (e) {
        // snackbar showing error
        addSnack(
          "Det skjedde en feil under opprettelsen av arrangementet",
          SnackTypes.ERROR,
        );
      }
    }
  };

  /* TODO: Maybe move this logic into the `allEventInputsValid` function instead. */
  const eventTitleValid = textInputValid(eventObject.eventTitle, 0, 100);
  const eventDescriptionValid = textInputValid(
    eventObject.eventDescription,
    0,
    2500,
  );
  const eventAddressValid = textInputValid(eventObject.eventAddress, 0, 100);
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
  const eventActiveCategoriesValid = categoryInputValid(
    eventObject.eventActiveCategories,
  );
  const eventCapacityValid = radioInputValid(
    eventObject.eventHasCapacity,
    parseInt(eventObject.eventCapacity),
    0,
    10000,
  );

  const lastStep = eventObject.currentStep === 6;
  let validEvent: boolean;
  if (eventObject.eventHasDateEnd) {
    validEvent = allEventInputsValid([
      eventTitleValid,
      eventDescriptionValid,
      eventAddressValid,
      eventDateStartValid,
      eventTimeStartValid,
      eventDateEndValid,
      eventTimeEndValid,
      eventActiveCategoriesValid,
      eventCapacityValid,
      eventImageValid,
      lastStep,
    ]);
  } else {
    validEvent = allEventInputsValid([
      eventTitleValid,
      eventDescriptionValid,
      eventAddressValid,
      eventDateStartValid,
      eventTimeStartValid,
      eventActiveCategoriesValid,
      eventCapacityValid,
      eventImageValid,
      lastStep,
    ]);
  }

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
    const dateInputPageValid = eventObject.eventHasDateEnd
      ? eventDateStartValid &&
        eventTimeStartValid &&
        eventDateEndValid &&
        eventTimeEndValid
      : eventDateStartValid && eventTimeStartValid;
    const addressInputPageValid = eventAddressValid;
    const descriptionInputPageValid =
      eventDescriptionValid && eventActiveCategoriesValid;
    const imageInputPageValid = eventImageValid;
    const extraInfoInputPageValid = eventCapacityValid;

    const validDataMap: Map<string, boolean> = new Map();
    validDataMap.set(InputPages.TITLEPAGE, titleInputPageValid);
    validDataMap.set(InputPages.DATEPAGE, dateInputPageValid);
    validDataMap.set(InputPages.ADDRESSPAGE, addressInputPageValid);
    validDataMap.set(InputPages.DESCRIPTIONPAGE, descriptionInputPageValid);
    validDataMap.set(InputPages.IMAGEPAGE, imageInputPageValid);
    validDataMap.set(
      InputPages.EXTRAINFOPAGE,
      extraInfoInputPageValid && eventExtraInfoValid,
    );
    validDataMap.set(InputPages.SUMMARYPAGE, validEvent);

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
            page={InputPages.TITLEPAGE}
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
                maxLength={100}
                minLength={3}
                errorMessage={`Tittelen må være mellom ${3} og ${100} tegn`}
                required
                handleChange={updateEventTitle}
              />
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
            page={InputPages.DATEPAGE}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic={eventObject.eventHasDateEnd}
          >
            <div
              className={`${styles.dateContainer} ${styles.marginBottomMedium}`}
            >
              <div
                className={`${styles.dateColumn} ${styles.marginBottomMedium}`}
              >
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
                  onClick={() => seteventHasDateEnd(true)}
                >
                  <PlusIcon className={styles.addDateDimensions} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {eventObject.eventHasDateEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => seteventHasDateEnd(false)}
                >
                  <MinusIcon className={styles.addDateDimensions} />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
            </div>
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
            page={InputPages.ADDRESSPAGE}
            buttonOnClick={inputPageOnClick}
          >
            <div className={styles.textContainer}>
              <TextInput
                value={eventObject.eventAddress}
                inputId="address"
                inputName="eventAddress"
                label="Adressen til arrangementet*"
                placeholder="F.eks. Gaustadalléen 23B, 0373 Oslo"
                maxLength={100}
                errorMessage="Du må oppgi en adresse eller et sted."
                required
                handleChange={updateEventAddress}
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
            page={InputPages.DESCRIPTIONPAGE}
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
                  maxLength={2500}
                  errorMessage="Beskrivelsen kan ikke være tom"
                  required
                  handleChange={updateEventDescription}
                  validate
                />
                <CategoryInput
                  categories={categories}
                  activeCategories={eventObject.eventActiveCategories}
                  errorMessage="Du må velge minst en kategori."
                  onClick={updateEventCategories}
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
            page={InputPages.IMAGEPAGE}
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
            page={InputPages.EXTRAINFOPAGE}
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
                  label="Privat eller ikke oppført arrangement?*"
                />
              </div>
              <div
                className={
                  !eventObject.eventHasCapacity
                    ? styles.noExtraOptionPadding
                    : ""
                }
              >
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
                  label="Privat eller offentlig arrangement?*"
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
            page={InputPages.SUMMARYPAGE}
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
      updateImageCached(ImageCaching.PREEMPTIVEMESSAGE);
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
    if (oldEventObject.imageCached === ImageCaching.PREEMPTIVEMESSAGE) {
      setEventImageValid(false);
      setEventObject(() => ({
        ...oldEventObject,
        eventImage: undefined,
        imageCached: ImageCaching.REFRESHMESSAGE,
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
        title="Peoply - Nytt arrangement"
        description="Opprett et nytt arrangement på Peoply"
        url={`${baseUrl}/event/create`}
      />
      <Header />
      <div className={styles.wrapper}>
        {modalOpen && (
          <Modal
            label="Fortsett opprettelse av arrangement?"
            description="Vi ser at du har et tidligere arrangement som ikke ble postet. Vil du fortsette der du slapp, eller opprette et nytt arrangment?"
            buttonText="Fortsett"
            secondaryButtonText="Opprett nytt"
            buttonOnClick={continueEventCreation}
            secondaryButtonOnClick={startNewEventCreation}
          />
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
