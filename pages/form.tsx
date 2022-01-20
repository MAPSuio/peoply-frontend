import { NextPage } from "next";

import { useState, ChangeEvent } from "react";

import DateInput from "../components/inputs/DateInput";
import TimeInput from "../components/inputs/TimeInput";
import TextInput from "../components/inputs/TextInput";
import NumberInput from "../components/inputs/NumberInput";

import { getISODate, getISOTime } from "../utils/functions";
import styles from "../styles/Form.module.scss";
import TextInputLong from "../components/inputs/TextInputLong";

const Form: NextPage = () => {
  const today = new Date();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getISODate(today));
  const [time, setTime] = useState("");
  const [capacity, setCapacity] = useState("");

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
          errorMessage="Datoen kan ikke være eldre enn dagens dato"
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
      </div>
    </div>
  );
};

export default Form;
