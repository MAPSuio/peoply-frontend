import styles from "../../styles/CreateOrganization.module.scss";
import useUser from "../../hooks/useUser";
import BackButton from "../../components/BackButton";
import useBack from "../../hooks/useBack";
import router from "next/router";
import Button from "../../components/Button";
import TextInput from "../../components/inputs/TextInput";
import { useState } from "react";
import TextInputLong from "../../components/inputs/TextInputLong";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useSnack from "../../hooks/useSnack";
import { SnackTypes } from "../../types/types";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import HeadComponent from "../../components/HeadComponent";

interface CreateProps {
  baseUrl: string;
}

const Create = ({ baseUrl }: CreateProps) => {
  const { user, loading, reload } = useUser();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameValid, setNameValid] = useState(false);
  const goBack = useBack();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  if (loading) {
    return <></>;
  }

  if (!user) {
    redirectToLogin();
  }

  const handleConfirm = async () => {
    try {
      await fetchFromPeoplyApiJson("/organizations", {
        method: "POST",
        body: JSON.stringify({ name, description }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      reload();
      addSnack("Organisasjon opprettet", SnackTypes.SUCCESS);
    } catch (error) {
      addSnack("Klarte ikke å lage organisasjon", SnackTypes.ERROR);
    }
    router.push("/me/orgs");
  };

  return (
    <>
      <HeadComponent
        title="Opprett organisasjon"
        description="Opprett en ny organisasjon"
        url={`${baseUrl}/orgs/create`}
      />
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
            minLength={1}
            errorMessage="Navnet kan ikke være tomt"
            valid={nameValid}
            setValid={setNameValid}
            validate
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
          <Button
            disabled={!nameValid}
            text="Lagre endringer"
            onClick={handleConfirm}
          />
        </div>
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Create;
