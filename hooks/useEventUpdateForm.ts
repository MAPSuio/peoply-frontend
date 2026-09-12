import { useState } from "react";

import { fetchFromPeoplyApi } from "../services/fetchers";
import { EventUpdateVisibility, SnackTypes } from "../types/types";
import useBack from "./useBack";
import useSnack from "./useSnack";

export default function useEventUpdateForm(eventId: string | undefined) {
  const goBack = useBack();
  const { addSnack } = useSnack();
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

  const submit = async () => {
    try {
      await fetchFromPeoplyApi(`/events/${eventId}/update`, {
        method: "POST",
        body: JSON.stringify({
          subject,
          body: content,
          visibility,
          sendEmail,
          replyTo: replyToMail,
        }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Oppdatering sendt", SnackTypes.SUCCESS);
    } catch {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
    goBack();
  };

  return {
    subject,
    setSubject,
    subjectValid,
    setSubjectValid,
    content,
    setContent,
    contentValid,
    setContentValid,
    sendEmail,
    toggleSendEmail: () => {
      setReplyToMailValid(sendEmail || replyToMailValid);
      setSendEmail(!sendEmail);
    },
    replyToMail,
    setReplyToMail,
    replyToMailValid,
    setReplyToMailValid,
    visibility,
    setVisibility,
    validEdit: subjectValid && contentValid && replyToMailValid,
    submit,
  };
}
