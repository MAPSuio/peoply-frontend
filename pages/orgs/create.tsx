import styles from "../../styles/CreateOrganization.module.scss";
import { NextPage } from "next";
import useUser from "../../hooks/useUser";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import router from "next/router";
import PrimaryButton from "../../components/PrimaryButton";
import TextInput from "../../components/inputs/TextInput";
import { useEffect, useState } from "react";
import TextInputLong from "../../components/inputs/TextInputLong";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useSnack from "../../hooks/useSnack";
import { SnackTypes } from "../../types/types";

const Create: NextPage = () => {
  const { user, loading } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isValid, setIsValid] = useState(false);
  const goBack = useBack();
  const { addSnack } = useSnack();

  /* hook for validating form */
  useEffect(() => {
    if (name.length > 0 && description.length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, description]);

  if (loading) {
    return <></>;
  }

  if (!user) {
    router.push("/login");
  }

  async function handleConfirm() {
    try {
      await fetchFromPeoplyApiJson("/organizations", {
        method: "POST",
        body: JSON.stringify({ name, description }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Organisasjon opprettet!", SnackTypes.SUCCESS);
      router.push("/me/orgs");
    } catch (error) {
      addSnack("Noe gikk galt!", SnackTypes.ERROR);
      router.push("/me/orgs");
    }
  }

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <div className={styles.header}>
        <h1>Opprett organisasjon</h1>
        <p>Skap et sted folk kan høre til</p>
      </div>
      <div className={styles.form}>
        <TextInput
          value={name}
          handleChange={(e) => setName(e.target.value)}
          inputName="orgName"
          inputId="orgName"
          label="Organisasjonens navn"
          placeholder="ProgSys"
          maxLength={50}
          errorMessage="Navnet kan ikke være tomt"
        />
        <TextInputLong
          value={description}
          handleChange={(e) => setDescription(e.target.value)}
          inputName="orgDescription"
          inputId="orgDescription"
          label="Beskrivelse av organisasjonen"
          placeholder="Progsys er linjeforeningen for studenter ved Programmering og Systemarkitektur på UiO. Vi planlegger mange morsomme arrangementer for at studentene kan bli bedre kjent."
          rows={8}
          maxLength={300}
          errorMessage="Beskrivelsen kan ikke være tom"
          validate
        />
      </div>
      <div className={styles.confirm}>
        <PrimaryButton
          disabled={!isValid}
          text="Lagre endringer"
          onClick={handleConfirm}
        />
      </div>
    </div>
  );
};

export default Create;
