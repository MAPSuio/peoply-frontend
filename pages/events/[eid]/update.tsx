import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import HeadComponent from "../../../components/HeadComponent";
import CheckboxInput from "../../../components/inputs/CheckboxInput";
import RadioInput from "../../../components/inputs/RadioInput";
import TextInput from "../../../components/inputs/TextInput";
import TextInputLong from "../../../components/inputs/TextInputLong";
import CloseIcon from "../../../components/svgs/CloseIcon";
import PublicIcon from "../../../components/svgs/PublicIcon";
import UnlistedIcon from "../../../components/svgs/UnlistedIcon";
import UserCheck from "../../../components/svgs/UserCheck";
import UserCheckLight from "../../../components/svgs/UserCheckLight";
import UserSelect from "../../../components/UserSelect";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import useTheme from "next-theme";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";
import styles from "../../../styles/UpdateEvent.module.scss";
import {
  SnackTypes,
  User,
  Event,
  EventUpdateVisibility,
} from "../../../types/types";

export default function UpdateEvent() {
  const goBack = useBack();
  const { user, loading } = useUser();
  const { addSnack } = useSnack();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { eid } = router.query;
  const { data: event, error: eventError } = useSWR<Event>(
    () => (eid ? `/events/${eid}` : false),
    fetchFromPeoplyApiJson,
  );
  const [subject, setSubject] = useState("");
  const [subjectValid, setSubjectValid] = useState(true);
  const [content, setContent] = useState("");
  const [contentValid, setContentValid] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);
  const [replyToMail, setReplyToMail] = useState("");
  const [replyToMailValid, setReplyToMailValid] = useState(true);
  const [visibility, setVisibility] = useState<EventUpdateVisibility>(
    EventUpdateVisibility.ALL,
  );
  const redirectToLogin = useRedirectToLogin();

  if (loading) {
    return <></>;
  }

  if (eventError) {
    addSnack("Kunne ikke hente arrangementet", SnackTypes.ERROR);
    router.replace(`/events/${eid}`);
  }

  const onSubmit = async () => {
    const body = {
      subject,
      body: content,
      visibility,
      sendEmail,
      replyTo: replyToMail,
    };
    try {
      await fetchFromPeoplyApi(`/events/${event?.id}/update`, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Oppdatering sendt", SnackTypes.SUCCESS);
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
    goBack();
  };

  if (!user) {
    redirectToLogin();
    return <></>;
  }

  const validEdit = subjectValid && contentValid && replyToMailValid;

  if (user && event) {
    return (
      <>
        <HeadComponent
          title={`${event.title} - Oppdater`}
          description="Lag oppdatering"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.header}>
            <h1>Lag oppdatering</h1>
            <p>Kommuniser med deltakere av ditt arrangement</p>
          </div>
          <div className={styles.form}>
            <TextInput
              value={subject}
              inputId="subject"
              inputName="subject"
              label="Emne"
              maxLength={100}
              minLength={3}
              errorMessage={`Emnet må være mellom ${3} og ${100} tegn`}
              required={true}
              handleChange={(e) => setSubject(e.target.value)}
              setValid={setSubjectValid}
              valid={subjectValid}
              validate
            />
            <TextInputLong
              value={content}
              handleChange={(e) => setContent(e.target.value)}
              inputName="updateContent"
              inputId="updateContent"
              rows={8}
              label="Innhold"
              placeholder=""
              maxLength={440}
              errorMessage="Innholdet kan ikke være tomt."
              className={styles.description}
              setValid={setContentValid}
              valid={contentValid}
              validate
              required
            />
            <RadioInput
              optionsAndIcons={[
                {
                  id: EventUpdateVisibility.ALL,
                  text: "Offentlig",
                  hintText:
                    "Oppdateringen kan ses på arrangementsiden av alle brukere på platformen.",
                  icon: PublicIcon,
                  active: visibility === EventUpdateVisibility.ALL,
                },
                {
                  id: EventUpdateVisibility.GOING,
                  text: "Kun deltakere",
                  hintText:
                    "Oppdateringen kan kun ses på arrangementsiden av deltakere.",
                  icon: theme === "light" ? UserCheckLight : UserCheck,
                  active: visibility === EventUpdateVisibility.GOING,
                },
              ]}
              onClick={setVisibility}
              label="Synlighet på arrangementsiden"
            />
            <CheckboxInput
              label="Send oppdateringen til deltakere via e-post"
              checked={sendEmail}
              checkboxId="allowNotifications"
              checkboxName="allowNotifications"
              onChange={() => {
                setSendEmail(!sendEmail);
                if (sendEmail) {
                  setReplyToMailValid(true);
                }
              }}
              className={styles.emailCheckBox}
            />
            {sendEmail && (
              <TextInput
                value={replyToMail}
                inputId="subject"
                inputName="subject"
                label="Kontaktmail"
                errorMessage={`Eposten må være gyldig.`}
                placeholder="svar@eksempel.no"
                maxLength={100}
                handleChange={(e) => setReplyToMail(e.target.value)}
                setValid={setReplyToMailValid}
                valid={replyToMailValid}
                validate
                isEmail
              />
            )}
          </div>
          {validEdit && (
            <Button
              disabled={!validEdit}
              text="Publiser oppdatering"
              onClick={onSubmit}
              className={styles.confirm}
            />
          )}
        </div>
      </>
    );
  }
  return <></>;
}
