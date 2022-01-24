import { NextPage } from "next";

import { useState, ChangeEvent } from "react";

import DateInput from "../components/inputs/DateInput";
import TimeInput from "../components/inputs/TimeInput";
import TextInput from "../components/inputs/TextInput";
import NumberInput from "../components/inputs/NumberInput";
import CategoryInput from "../components/inputs/CategoryInput";
import TextInputLong from "../components/inputs/TextInputLong";
import RadioInput from "../components/inputs/RadioInput";
import PrivateIcon from "../components/svgs/PrivateIcon";
import PublicIcon from "../components/svgs/PublicIcon";

import { getISODate } from "../utils/functions";
import styles from "../styles/Form.module.scss";
import ImageInput from "../components/inputs/ImageInput";
import ProgressBar from "../components/ProgressBar";
import InputPage from "../components/InputPage";
import InputHeader from "../components/InputHeader";
import CalendarCircle from "../components/CalendarCircle";
import EditIcon from "../components/svgs/EditIcon";
import { Value } from "sass";

const Form: NextPage = () => {
  const today = new Date();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getISODate(today));
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [activeCategories, setActiveCategories] = useState([1, 2]);
  const [privateEvent, setPrivateEvent] = useState(false);
  const [image, setImage] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  console.log(time);

  // TODO: Convert these functions into a general function.
  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const updateDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const updateDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const updateTime = (e: ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const updateCapacity = (e: ChangeEvent<HTMLInputElement>) => {
    setCapacity(e.target.value);
  };

  const updateCategories = (categoryId: number) => {
    if (activeCategories.includes(categoryId)) {
      setActiveCategories(activeCategories.filter((id) => categoryId !== id));
    } else {
      setActiveCategories([...activeCategories, categoryId]);
    }
  };

  const updateVisibility = (id: number) => {
    if (id === 2) {
      setPrivateEvent(true);
    } else {
      setPrivateEvent(false);
    }
  };

  /* TODO: Fix this TS error. */
  const updateImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      setImage(e.target.files[0]);
    }
  };

  const updateCurrentStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h1 className={styles.header}>This is an awesome form</h1>
        <TextInput
          value={title}
          inputId="title"
          inputName="event_title"
          label="Tittel på arrangementet*"
          placeholder="Here there will be a placeholder"
          maxLength={100}
          errorMessage="Tittelen kan ikke være tom."
          required
          handleChange={updateTitle}
        />
        <TextInputLong
          value={description}
          inputId="description"
          inputName="event_description"
          rows={12}
          label="Beskrivelse av arrangementet*"
          placeholder="Peoply inviterer til julebord. Det blir god mat og forhåpentligvis god stemning!"
          maxLength={2500}
          errorMessage="Beskrivelsen kan ikke være tom"
          required
          handleChange={updateDescription}
        />
        <DateInput
          value={date}
          inputId="dateStart"
          inputName="event_date_start"
          label="Dato start*"
          errorMessage="Datoen kan ikke være eldre enn dagens dato."
          required
          handleChange={updateDate}
        />
        <TimeInput
          value={time}
          date={date}
          inputId="timeStart"
          inputName="event_time_start"
          label="Tidspunkt start*"
          errorMessage="Tiden må være i fremtiden."
          required
          handleChange={updateTime}
        />
        <NumberInput
          value={capacity}
          inputId="capacity"
          inputName="event_capacity"
          label="Antall deltakere*"
          placeholder="0"
          errorMessage="Antall deltakere kan ikke være tom eller null."
          max="250"
          required
          handleChange={updateCapacity}
        />
        <CategoryInput
          categories={[
            { id: 1, text: "LGBTQ" },
            { id: 2, text: "Trening" },
            { id: 3, text: "Matservering" },
            { id: 4, text: "Alkohol" },
          ]}
          activeCategories={activeCategories}
          errorMessage="Du må velge minst en kategori."
          onClick={updateCategories}
        />
        <RadioInput
          optionsAndIcons={[
            {
              id: 1,
              text: "offentlig",
              hintText:
                "Synlig for offentligheten. Vises for alle i appen, inkludert personer uten brukerkonto.",
              icon: PublicIcon,
              active: !privateEvent,
            },
            {
              id: 2,
              text: "privat",
              hintText:
                "Ikke synlig for offentligheten, men kan deles med lenke og/eller invitasjon",
              icon: PrivateIcon,
              active: privateEvent,
            },
          ]}
          onClick={updateVisibility}
          label="Privat eller offentlig arrangement?*"
        />
        <ImageInput
          inputId="image"
          inputName="event_image"
          label="Last opp et bilde til arrangementet"
          buttonLabel="Endre bilde"
          value={image}
          errorMessage="Bildet kan ikke være så stort."
          onChange={updateImage}
        />
        {currentStep === 0 && (
          <InputPage
            step={0}
            title="Opprett nytt arrangement"
            subTitle="Hva vil du kalle arrangementet ditt for?"
            currentStep={currentStep}
            stepCount={7}
            buttonText="Gå til dato og tidspunkt"
            validData={title.length > 0}
            firstPage
            buttonOnClick={updateCurrentStep}
          >
            <InputHeader title="Tittel">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <TextInput
              value={title}
              inputId="title"
              inputName="event_title"
              label="Tittel på arrangementet*"
              placeholder="Here there will be a placeholder"
              maxLength={100}
              errorMessage="Tittelen kan ikke være tom."
              required
              handleChange={updateTitle}
            />
          </InputPage>
        )}
        {currentStep === 1 && (
          <InputPage
            step={1}
            title="Opprett enda et nytt arrangement"
            subTitle="Hva vil du kalle arrangementet ditt for?"
            currentStep={currentStep}
            stepCount={7}
            buttonText="Gå til dato og tidspunkt"
            validData={title.length > 0}
            buttonOnClick={updateCurrentStep}
          >
            <InputHeader title="Tittel 2">
              <CalendarCircle width={24} height={24} strokeWidth={1.5} />
            </InputHeader>
            <TextInput
              value={title}
              inputId="title"
              inputName="event_title"
              label="Tittel på arrangementet*"
              placeholder="Here there will be a placeholder"
              maxLength={100}
              errorMessage="Tittelen kan ikke være tom."
              required
              handleChange={updateTitle}
            />
          </InputPage>
        )}
      </div>
    </div>
  );
};

export default Form;
