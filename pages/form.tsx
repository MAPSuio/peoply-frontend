import { NextPage } from "next";

import { useState, ChangeEvent } from "react";
import DateInput from "../components/inputs/DateInput";

import TextInput from "../components/inputs/TextInput";

import { getISODate } from "../utils/functions";
import styles from "../styles/Form.module.scss";

const Form: NextPage = () => {
  const [text, setText] = useState("");
  const [date, setDate] = useState(getISODate(new Date()));

  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const updateDate = (e: ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.formContainer}>
        <h1 className={styles.header}>This is an awesome form</h1>
        <TextInput
          value={text}
          inputId="title"
          inputName="event_title"
          label="Tittel på arrangementet*"
          placeholder="Here there will be a placeholder"
          maxLength={100}
          errorMessage="Tittelen kan ikke være tom."
          handleChange={updateTitle}
        />
        <DateInput
          value={date}
          inputId="dateStart"
          inputName="event_date_start"
          label="Dato start*"
          handleChange={updateDate}
        />
      </div>
    </div>
  );
};

export default Form;
