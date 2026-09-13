import { useRouter } from "next/router";
import useSWR from "swr";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import RequireUser from "../../../components/RequireUser";
import EventUpdateVisibilityInput from "../../../components/events/EventUpdateVisibilityInput";
import CheckboxInput from "../../../components/inputs/CheckboxInput";
import TextInput from "../../../components/inputs/TextInput";
import TextInputLong from "../../../components/inputs/TextInputLong";
import useBack from "../../../hooks/useBack";
import useEventUpdateForm from "../../../hooks/useEventUpdateForm";
import useSnack from "../../../hooks/useSnack";
import { type Event, SnackTypes } from "../../../types/types";

import styles from "../../../styles/UpdateEvent.module.scss";

const SUBJECT_MIN_LENGTH = 3;
const SUBJECT_MAX_LENGTH = 100;

function EventUpdateForm() {
  const goBack = useBack();
  const { addSnack } = useSnack();
  const router = useRouter();
  const { eid } = router.query;
  const { data: event, error: eventError } = useSWR<Event>(() =>
    eid ? `/events/${eid}` : false,
  );
  const form = useEventUpdateForm(event?.id);

  if (eventError) {
    addSnack("Kunne ikke hente arrangementet", SnackTypes.ERROR);
    router.replace(`/events/${eid}`);
  }

  if (!event) {
    return <></>;
  }

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
            value={form.subject}
            inputId="subject"
            inputName="subject"
            label="Emne"
            maxLength={SUBJECT_MAX_LENGTH}
            minLength={SUBJECT_MIN_LENGTH}
            errorMessage={`Emnet må være mellom ${SUBJECT_MIN_LENGTH} og ${SUBJECT_MAX_LENGTH} tegn`}
            required
            handleChange={(e) => form.setSubject(e.target.value)}
            setValid={form.setSubjectValid}
            valid={form.subjectValid}
            validate
          />
          <TextInputLong
            value={form.content}
            handleChange={(e) => form.setContent(e.target.value)}
            inputName="updateContent"
            inputId="updateContent"
            rows={8}
            label="Innhold"
            placeholder=""
            maxLength={440}
            errorMessage="Innholdet kan ikke være tomt."
            className={styles.description}
            setValid={form.setContentValid}
            valid={form.contentValid}
            validate
            required
          />
          <EventUpdateVisibilityInput
            visibility={form.visibility}
            onChange={form.setVisibility}
          />
          <CheckboxInput
            label="Send oppdateringen til deltakere via e-post"
            checked={form.sendEmail}
            checkboxId="allowNotifications"
            checkboxName="allowNotifications"
            onChange={form.toggleSendEmail}
            className={styles.emailCheckBox}
          />
          {form.sendEmail && (
            <TextInput
              value={form.replyToMail}
              inputId="subject"
              inputName="subject"
              label="Kontaktmail"
              errorMessage="Eposten må være gyldig."
              placeholder="svar@eksempel.no"
              maxLength={SUBJECT_MAX_LENGTH}
              handleChange={(e) => form.setReplyToMail(e.target.value)}
              setValid={form.setReplyToMailValid}
              valid={form.replyToMailValid}
              validate
              isEmail
              required
            />
          )}
        </div>
        {form.validEdit && (
          <Button
            text="Publiser oppdatering"
            onClick={form.submit}
            className={styles.confirm}
          />
        )}
      </div>
    </>
  );
}

export default function UpdateEvent() {
  return <RequireUser>{() => <EventUpdateForm />}</RequireUser>;
}
