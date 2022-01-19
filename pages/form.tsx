import { NextPage } from "next";

import { useState, ChangeEvent } from "react";

import TextInput from "../components/inputs/TextInput";

import styles from "../styles/Form.module.scss";

const Form: NextPage = () => {
  const [text, setText] = useState("");

  const updateInputValue = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 100) {
      setText(e.target.value);
    }
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
          handleChange={updateInputValue}
        />
        <h2>{text}</h2>
      </div>
    </div>
  );
};

export default Form;
