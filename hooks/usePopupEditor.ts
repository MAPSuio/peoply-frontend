import { useState } from "react";

import { apiErrorMessage } from "../services/apiError";
import type { Popup } from "../types/types";
import {
  type PopupConflict,
  fromDateTimeLocal,
  getDefaultInterval,
  popupConflict,
} from "../utils/popups";

export interface PopupPayload {
  title: string;
  body: string;
  startsAt?: string;
  endsAt?: string;
}

export interface PopupEditorOptions {
  popup?: Popup;
  onSave: (payload: PopupPayload) => Promise<void>;
  onClose: () => void;
}

function intervalPayload(startsAt: string, endsAt: string) {
  if (new Date(startsAt) >= new Date(endsAt)) {
    return { error: "Sluttidspunktet må være etter start." };
  }

  return {
    startsAt: fromDateTimeLocal(startsAt),
    endsAt: fromDateTimeLocal(endsAt),
  };
}

export default function usePopupEditor({
  popup,
  onSave,
  onClose,
}: PopupEditorOptions) {
  const defaults = getDefaultInterval();
  const [title, setTitle] = useState(popup?.title ?? "");
  const [body, setBody] = useState(popup?.body ?? "");
  const [startsAt, setStartsAt] = useState(defaults.startsAt);
  const [endsAt, setEndsAt] = useState(defaults.endsAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<PopupConflict>();

  const buildPayload = (): PopupPayload | string => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();

    if (!trimmedTitle || !trimmedBody) {
      return "Tittel og innhold må fylles ut.";
    }

    const payload: PopupPayload = { title: trimmedTitle, body: trimmedBody };

    if (popup) {
      return payload;
    }

    const interval = intervalPayload(startsAt, endsAt);
    return interval.error ? interval.error : { ...payload, ...interval };
  };

  const save = async () => {
    const payload = buildPayload();

    if (typeof payload === "string") {
      setError(payload);
      return;
    }

    setSaving(true);
    setError("");
    setConflict(undefined);

    try {
      await onSave(payload);
      onClose();
    } catch (saveError) {
      setError(apiErrorMessage(saveError) ?? "Kunne ikke lagre pop-upen.");
      setConflict(popupConflict(saveError));
    } finally {
      setSaving(false);
    }
  };

  return {
    title,
    setTitle,
    body,
    setBody,
    startsAt,
    setStartsAt,
    endsAt,
    setEndsAt,
    saving,
    error,
    conflict,
    save,
  };
}
