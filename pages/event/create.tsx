/* Next */
import { NextPage } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";

/* React */
import { useState, ChangeEvent } from "react";

/* Components */
import DateInput from "../../components/inputs/DateInput";
import TimeInput from "../../components/inputs/TimeInput";
import TextInput from "../../components/inputs/TextInput";
import TextInputLong from "../../components/inputs/TextInputLong";
import NumberInput from "../../components/inputs/NumberInput";
import CategoryInput from "../../components/inputs/CategoryInput";
import ImageInput from "../../components/inputs/ImageInput";
import RadioInput from "../../components/inputs/RadioInput";

import SummaryPage from "../../components/SummaryPage";
import InputPage from "../../components/InputPage";
import InputHeader from "../../components/InputHeader";

import CalendarCircle from "../../components/CalendarCircle";
import NoLimitIcon from "../../components/svgs/NoLimitIcon";
import LimitIcon from "../../components/svgs/LimitIcon";
import PrivateIcon from "../../components/svgs/PrivateIcon";
import PublicIcon from "../../components/svgs/PublicIcon";
import PlusIcon from "../../components/svgs/PlusIcon";
import MinusIcon from "../../components/svgs/MinusIcon";

/* Hooks */
import { fetchFromPeoplyApi } from "../../services/fetchers";

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

/* Styles */
import styles from "../../styles/CreateEvent.module.scss";
import { InputPages } from "../../types/types";

const CreateEvent: NextPage = () => {
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDateStart, setEventDateStart] = useState("");
  const [eventTimeStart, setEventTimeStart] = useState("");
  const [hasEventDateEnd, setHasEventDateEnd] = useState(false);
  const [eventDateEnd, setEventDateEnd] = useState("");
  const [eventTimeEnd, setEventTimeEnd] = useState("");
  const [eventActiveCategories, setEventActiveCategories] = useState<number[]>(
    [],
  );
  const [eventPrivate, setEventPrivate] = useState(false);
  const [eventHasCapacity, setEventHasCapacity] = useState(false);
  const [eventCapacity, setEventCapacity] = useState("");
  const [eventExtraInfoValid, setEventExtraInfoValid] = useState(false);
  const [eventImage, setEventImage] = useState();
  const [eventImageValid, setEventImageValid] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  /* The number of input screens. */
  const stepCount = 6;

  const router = useRouter();

  /* Might be useful later. */
  const today = new Date();

  /* Get all the possible event categories. */
  const { data: categories, error: categoriesError } = useSWR(
    "/categories",
    fetchFromPeoplyApi,
  );

  /* TODO: Consider moving all these state update functions somewhere. */
  const updateEventTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setEventTitle(e.target.value);
  };

  const updateEventDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setEventDescription(e.target.value);
  };

  const updateEventAddress = (e: ChangeEvent<HTMLInputElement>) => {
    setEventAddress(e.target.value);
  };

  /* TODO: Fix this TS error. */
  const updateEventCategories = (categoryId: number) => {
    if (eventActiveCategories.includes(categoryId)) {
      setEventActiveCategories(
        eventActiveCategories.filter((id) => categoryId !== id),
      );
    } else {
      setEventActiveCategories([...eventActiveCategories, categoryId]);
    }
  };

  const updateEventDateStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventDateStart(e.target.value);
  };

  const updateEventTimeStart = (e: ChangeEvent<HTMLInputElement>) => {
    setEventTimeStart(e.target.value);
  };

  const updateEventDateEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventDateEnd(e.target.value);
  };

  const updateEventTimeEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEventTimeEnd(e.target.value);
  };

  /* TODO: Fix this TS error. */
  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setEventImage(e.target.files[0]);
    }
  };

  const updateVisibility = (id: number) => {
    if (id === 2) {
      setEventPrivate(true);
    } else {
      setEventPrivate(false);
    }
  };

  const updateHasCapacity = (id: number) => {
    if (id === 2) {
      setEventHasCapacity(true);
    } else {
      setEventHasCapacity(false);
    }
  };

  const updateEventCapacity = (e: ChangeEvent<HTMLInputElement>) => {
    setEventCapacity(e.target.value);
  };

  const inputPageOnClick = (step: number) => {
    if (step !== stepCount + 1) setCurrentStep(step);
  };

  const summaryPageOnClick = async (formData: FormData) => {
    await fetchFromPeoplyApi("/events", { method: "post", body: formData });
    router.push("/");
  };

  /* TODO: Maybe move this logic into the `allEventInputsValid` function instead. */
  const eventTitleValid = textInputValid(eventTitle, 0, 100);
  const eventDescriptionValid = textInputValid(eventDescription, 0, 2500);
  const eventAddressValid = textInputValid(eventAddress, 0, 100);
  const eventDateStartValid = dateInputStartValid(eventDateStart);
  const eventTimeStartValid = timeInputStartValid(
    eventTimeStart,
    eventDateStart,
  );
  const eventDateEndValid = dateInputEndValid(eventDateStart, eventDateEnd);
  const eventTimeEndValid = timeInputEndValid(
    eventTimeStart,
    eventTimeEnd,
    eventDateStart,
    eventDateEnd,
  );
  const eventActiveCategoriesValid = categoryInputValid(eventActiveCategories);
  const eventCapacityValid = radioInputValid(
    eventHasCapacity,
    parseInt(eventCapacity),
    0,
    10000,
  );

  let validEvent: boolean;
  if (hasEventDateEnd) {
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
    ]);
  }

  const summaryCategories = eventActiveCategories.map((catId) => {
    return {
      category_id: catId,
      category: getCategoryText(categories, catId),
    };
  });

  const eventData = {
    evTitle: eventTitle,
    evDescription: eventDescription,
    evAddress: eventAddress,
    evDateStart: eventDateStart,
    evDateEnd: eventDateEnd,
    evTimeStart: eventTimeStart,
    evTimeEnd: eventTimeEnd,
    evHasDateEnd: hasEventDateEnd,
    evCategories: summaryCategories,
    evActiveCategories: eventActiveCategories,
    evPrivate: eventPrivate,
    evHasCapacity: eventHasCapacity,
    evCapacity: eventCapacity,
    evImage: eventImage,
  };

  /* TODO: Perhaps move the returned components into their own wrapper components. */
  const getCurrentInputPage = (step: number) => {
    const { title, subTitle, buttonText } = getInputPageData(step);
    const titleInputPageValid = eventTitleValid;
    const dateInputPageValid = hasEventDateEnd
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
    validDataMap.set(InputPages.TitlePage, titleInputPageValid);
    validDataMap.set(InputPages.DatePage, dateInputPageValid);
    validDataMap.set(InputPages.AddressPage, addressInputPageValid);
    validDataMap.set(InputPages.DescriptionPage, descriptionInputPageValid);
    validDataMap.set(InputPages.ImagePage, imageInputPageValid);
    validDataMap.set(
      InputPages.ExtraInfoPage,
      extraInfoInputPageValid && eventExtraInfoValid,
    );
    validDataMap.set(InputPages.SummaryPage, validEvent);

    switch (step) {
      case 0:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.TitlePage}
            firstPage
            buttonOnClick={inputPageOnClick}
          >
            <InputHeader title="Tittel">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <TextInput
              value={eventTitle}
              inputId="title"
              inputName="event_title"
              label="Tittel på arrangementet"
              placeholder="F.eks. Peoply launch party"
              maxLength={100}
              errorMessage="Tittelen kan ikke være tom"
              required
              handleChange={updateEventTitle}
            />
          </InputPage>
        );
      case 1:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.DatePage}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic={hasEventDateEnd}
          >
            <div
              className={`${styles.dateContainer} ${styles.marginBottomSmall}`}
            >
              <InputHeader title="Startdato- og tidspunkt">
                <CalendarCircle width={24} height={24} strokeWidth={1.5} />
              </InputHeader>
              <div className={`${styles.column} ${styles.marginBottomSmall}`}>
                <DateInput
                  value={eventDateStart}
                  valid={eventDateStartValid}
                  inputId="dateStart"
                  inputName="event_date_start"
                  label="Dato start*"
                  errorMessage="Datoen kan ikke være eldre enn dagens dato."
                  required
                  handleChange={updateEventDateStart}
                />
                <TimeInput
                  value={eventTimeStart}
                  valid={eventTimeStartValid}
                  inputId="timeStart"
                  inputName="event_time_start"
                  label="Tidspunkt start*"
                  errorMessage="Tiden må være i fremtiden."
                  required
                  handleChange={updateEventTimeStart}
                />
              </div>
              {!hasEventDateEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => setHasEventDateEnd(true)}
                >
                  <PlusIcon />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
              {hasEventDateEnd && (
                <button
                  className={styles.addDateContainer}
                  onClick={() => setHasEventDateEnd(false)}
                >
                  <MinusIcon />
                  <p className={styles.addDateText}>Sluttdato og -tidspunkt</p>
                </button>
              )}
            </div>
            {hasEventDateEnd && (
              <div className={styles.dateContainer}>
                <InputHeader title="Sluttdato- og tidspunkt">
                  <CalendarCircle width={24} height={24} strokeWidth={1.5} />
                </InputHeader>
                <div className={styles.column}>
                  <DateInput
                    value={eventDateEnd}
                    valid={eventDateEndValid}
                    inputId="dateEnd"
                    inputName="event_date_end"
                    label="Dato slutt*"
                    errorMessage="Datoen kan ikke være eldre enn startdato."
                    required
                    handleChange={updateEventDateEnd}
                  />
                  <TimeInput
                    value={eventTimeEnd}
                    valid={eventTimeEndValid}
                    inputId="timeEnd"
                    inputName="event_time_End"
                    label="Tidspunkt slutt*"
                    errorMessage="Tiden kan ikke være før starttiden."
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
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.AddressPage}
            buttonOnClick={inputPageOnClick}
          >
            <InputHeader title="Adresse">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <TextInput
              value={eventAddress}
              inputId="address"
              inputName="event_address"
              label="Adressen til arrangementet*"
              placeholder="F.eks. Gaustadalléen 23B, 0373 Oslo"
              maxLength={100}
              errorMessage="Du må oppgi en adresse eller et sted."
              required
              handleChange={updateEventAddress}
            />
          </InputPage>
        );
      case 3:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.DescriptionPage}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic
          >
            <InputHeader title="Beskrivelse">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <div className={styles.column}>
              <TextInputLong
                value={eventDescription}
                inputId="description"
                inputName="event_description"
                rows={12}
                label="Beskrivelse av arrangementet*"
                placeholder="F.eks. Peoply inviterer til julebord. Det blir god mat og forhåpentligvis god stemning!"
                maxLength={2500}
                errorMessage="Beskrivelsen kan ikke være tom"
                required
                handleChange={updateEventDescription}
              />
              <CategoryInput
                categories={categories}
                activeCategories={eventActiveCategories}
                errorMessage="Du må velge minst en kategori."
                onClick={updateEventCategories}
              />
            </div>
          </InputPage>
        );
      case 4:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            validDataMap={validDataMap}
            page={InputPages.ImagePage}
            setEventImageValid={setEventImageValid}
            buttonOnClick={inputPageOnClick}
            placeButtonStatic
          >
            <InputHeader title="Bilde">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <ImageInput
              value={eventImage}
              inputId="image"
              inputName="event_image"
              label="Last opp et bilde til arrangementet"
              buttonLabel="Endre bilde"
              errorMessage="Bildet kan ikke være så stort."
              onChange={updateEventImage}
            />
          </InputPage>
        );
      case 5:
        return (
          <InputPage
            step={step}
            title={title}
            subTitle={subTitle}
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            placeButtonStatic
            validDataMap={validDataMap}
            page={InputPages.ExtraInfoPage}
            setEventExtraInfoValid={setEventExtraInfoValid}
            buttonOnClick={inputPageOnClick}
          >
            <div className={`${styles.column} ${styles.gapLarge}`}>
              <div>
                <InputHeader title="Synlighet">
                  <CalendarCircle width={24} height={24} strokeWidth={1.5} />
                </InputHeader>
                <RadioInput
                  optionsAndIcons={[
                    {
                      id: 1,
                      text: "offentlig",
                      hintText:
                        "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
                      icon: PublicIcon,
                      active: !eventPrivate,
                    },
                    {
                      id: 2,
                      text: "privat",
                      hintText:
                        "Ikke synlig for offentligheten, men kan deles med lenke og/eller invitasjon",
                      icon: PrivateIcon,
                      active: eventPrivate,
                    },
                  ]}
                  onClick={updateVisibility}
                  label="Privat eller offentlig arrangement?*"
                />
              </div>
              <div
                className={!eventHasCapacity ? styles.noExtraOptionPadding : ""}
              >
                <InputHeader title="Antallsbegrensning">
                  <CalendarCircle width={24} height={24} strokeWidth={1.5} />
                </InputHeader>
                <RadioInput
                  optionsAndIcons={[
                    {
                      id: 1,
                      text: "ingen",
                      icon: NoLimitIcon,
                      active: !eventHasCapacity,
                    },
                    {
                      id: 2,
                      text: "begrensning",
                      icon: LimitIcon,
                      active: eventHasCapacity,
                    },
                  ]}
                  onClick={updateHasCapacity}
                  label="Privat eller offentlig arrangement?*"
                />
                {eventHasCapacity && (
                  <NumberInput
                    value={eventCapacity}
                    inputId="capacity"
                    inputName="event_capacity"
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
            currentStep={currentStep}
            stepCount={stepCount}
            buttonText={buttonText}
            placeButtonStatic
            validDataMap={validDataMap}
            page={InputPages.SummaryPage}
            buttonOnClick={inputPageOnClick}
            createEventFunction={summaryPageOnClick}
            eventData={eventData}
          />
        );
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>{getCurrentInputPage(currentStep)}</div>
    </div>
  );
};

export default CreateEvent;
