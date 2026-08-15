import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { DayPicker, type DateRange } from "react-day-picker";
import { nb } from "react-day-picker/locale";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import Modal from "../../../components/Modal";
import ModalButton from "../../../components/ModalButton";
import QueryState from "../../../components/QueryState";
import EditIcon from "../../../components/svgs/EditIcon";
import CalendarIconCard from "../../../components/svgs/CalendarIconCard";
import PlusIcon from "../../../components/svgs/PlusIcon";
import TrashIcon from "../../../components/svgs/TrashIcon";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { apiErrorMessage } from "../../../services/apiError";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";
import styles from "../../../styles/PopupScheduler.module.scss";
import {
  ButtonSize,
  ButtonType,
  type Popup,
  SnackTypes,
} from "../../../types/types";
import { isAdmin } from "../../../utils/admin";
import {
  formatPopupRange,
  fromDateTimeLocal,
  getDefaultInterval,
} from "../../../utils/popups";

interface PopupPayload {
  title: string;
  body: string;
  startsAt?: string;
  endsAt?: string;
}

function ContentModal({
  popup,
  onClose,
  onSave,
}: {
  popup?: Popup;
  onClose: () => void;
  onSave: (payload: PopupPayload) => Promise<void>;
}) {
  const defaults = getDefaultInterval();
  const [title, setTitle] = useState(popup?.title ?? "");
  const [body, setBody] = useState(popup?.body ?? "");
  const [startsAt, setStartsAt] = useState(defaults.startsAt);
  const [endsAt, setEndsAt] = useState(defaults.endsAt);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle || !trimmedBody) {
      setError("Tittel og innhold må fylles ut.");
      return;
    }

    const payload: PopupPayload = { title: trimmedTitle, body: trimmedBody };
    if (!popup) {
      const start = new Date(startsAt);
      const end = new Date(endsAt);
      if (start >= end) {
        setError("Sluttidspunktet må være etter start.");
        return;
      }
      payload.startsAt = fromDateTimeLocal(startsAt);
      payload.endsAt = fromDateTimeLocal(endsAt);
    }

    setSaving(true);
    setError("");
    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      /* Show what the API actually said. Asserting a cause here ("sjekk at
         tidsrommet er ledig") sent people looking for an overlap whenever the
         real failure was something else entirely. */
      setError(apiErrorMessage(error) ?? "Kunne ikke lagre pop-upen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      label={popup ? "Rediger pop-up" : "Ny pop-up"}
      closeButtonOnClick={onClose}
    >
      <div className={styles.editor}>
        <label className={styles.label} htmlFor="popup-title">
          Tittel <span>{title.length}/120</span>
        </label>
        <input
          id="popup-title"
          className={styles.input}
          value={title}
          maxLength={120}
          onChange={(event) => setTitle(event.target.value)}
          autoComplete="off"
        />
        <label className={styles.label} htmlFor="popup-body">
          Innhold <span>{body.length}/4000</span>
        </label>
        <textarea
          id="popup-body"
          className={styles.textarea}
          value={body}
          maxLength={4000}
          rows={7}
          placeholder="Skriv ett eller flere avsnitt …"
          onChange={(event) => setBody(event.target.value)}
        />
        {!popup && (
          <div className={styles.dateGrid}>
            <label className={styles.label} htmlFor="popup-start">
              Starter
              <input
                id="popup-start"
                className={styles.input}
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </label>
            <label className={styles.label} htmlFor="popup-end">
              Slutter
              <input
                id="popup-end"
                className={styles.input}
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </label>
          </div>
        )}
        {error && <p className={styles.formError}>{error}</p>}
        <ModalButton
          text={
            saving ? "Lagrer …" : popup ? "Lagre innhold" : "Opprett pop-up"
          }
          onClick={save}
          disabled={saving}
        />
      </div>
    </Modal>
  );
}

function PopupCard({
  popup,
  variant,
  onEdit,
  onChangeDates,
  onDelete,
}: {
  popup: Popup;
  variant: "active" | "upcoming" | "past";
  onEdit: () => void;
  onChangeDates: (
    payload: Pick<PopupPayload, "startsAt" | "endsAt">,
  ) => Promise<void>;
  onDelete: () => void;
}) {
  return (
    <article
      className={`${styles.card} ${styles[variant]}`}
      aria-disabled={variant === "past"}
    >
      <h3>{popup.title}</h3>
      <p className={styles.preview}>{popup.body}</p>
      <div className={styles.cardFooter}>
        <span className={styles.dateRange}>
          {formatPopupRange(popup.startsAt, popup.endsAt)}
        </span>
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onEdit}
            disabled={variant === "past"}
            aria-label="Rediger innhold"
          >
            <EditIcon />
          </button>
          <DateRangeButton
            popup={popup}
            disabled={variant === "past"}
            onChange={onChangeDates}
          />
          <button
            type="button"
            className={styles.delete}
            onClick={onDelete}
            disabled={variant === "past"}
            aria-label="Slett"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

function withTime(date: Date, timestamp: string) {
  const time = new Date(timestamp);
  const next = new Date(date);
  next.setHours(time.getHours(), time.getMinutes(), 0, 0);
  return next.toISOString();
}

function DateRangeButton({
  popup,
  disabled,
  onChange,
}: {
  popup: Popup;
  disabled: boolean;
  onChange: (
    payload: Pick<PopupPayload, "startsAt" | "endsAt">,
  ) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  const selectRange = async (nextRange: DateRange | undefined) => {
    setRange(nextRange);
    if (!nextRange?.from || !nextRange.to) return;

    try {
      await onChange({
        startsAt: withTime(nextRange.from, popup.startsAt),
        endsAt: withTime(nextRange.to, popup.endsAt),
      });
      setOpen(false);
      setRange(undefined);
    } catch {
      setRange(undefined);
    }
  };

  return (
    <div className={styles.rangePicker} ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setRange(undefined);
          setOpen((value) => !value);
        }}
        disabled={disabled}
        aria-expanded={open}
        aria-label="Endre datoer"
      >
        <CalendarIconCard />
      </button>
      {open && (
        <div className={styles.calendarPopover}>
          <DayPicker
            className={styles.dayPicker}
            mode="range"
            locale={nb}
            defaultMonth={new Date(popup.startsAt)}
            selected={range}
            onSelect={selectRange}
            min={0}
          />
        </div>
      )}
    </div>
  );
}

const PopupScheduler: NextPage = () => {
  const { user, loading } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const router = useRouter();
  const goBack = useBack();
  const { addSnack } = useSnack();
  const [editorPopup, setEditorPopup] = useState<Popup | "new">();
  const [deletePopup, setDeletePopup] = useState<Popup>();

  useEffect(() => {
    if (!loading && user && !isAdmin(user)) router.replace("/me");
  }, [loading, router, user]);

  const query = useSWR<Popup[]>(
    user && isAdmin(user) ? "/popups" : null,
    fetchFromPeoplyApiJson,
  );

  const createPopup = async (payload: PopupPayload) => {
    await fetchFromPeoplyApiJson("/popups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await query.mutate();
    addSnack("Pop-upen er planlagt", SnackTypes.SUCCESS);
  };

  const updatePopup = async (
    popupId: string,
    payload: Partial<PopupPayload>,
  ) => {
    await fetchFromPeoplyApiJson(`/popups/${popupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await query.mutate();
  };

  const updateDates = async (
    popupId: string,
    payload: Pick<PopupPayload, "startsAt" | "endsAt">,
  ) => {
    try {
      await updatePopup(popupId, payload);
    } catch (error) {
      addSnack(
        apiErrorMessage(error) ?? "Kunne ikke endre tidsrommet",
        SnackTypes.ERROR,
      );
      throw error;
    }
  };

  const removePopup = async () => {
    if (!deletePopup) return;
    try {
      await fetchFromPeoplyApi(`/popups/${deletePopup.id}`, {
        method: "DELETE",
      });
      setDeletePopup(undefined);
      await query.mutate();
      addSnack("Pop-upen er slettet", SnackTypes.SUCCESS);
    } catch (error) {
      addSnack(
        apiErrorMessage(error) ?? "Kunne ikke slette pop-upen",
        SnackTypes.ERROR,
      );
    }
  };

  if (loading) return null;
  if (!user) {
    redirectToLogin();
    return null;
  }
  if (!isAdmin(user)) return null;

  return (
    <>
      <HeadComponent
        title="Schedule en pop-up"
        description="Planlegg meldinger som vises i Peoply"
      />
      <main className={styles.container}>
        <BackButton onClick={goBack} />
        <header className={styles.header}>
          <h1>Schedule en pop-up</h1>
          <Button
            text="Ny pop-up"
            icon={<PlusIcon />}
            hideText
            size={ButtonSize.SMALL}
            onClick={() => setEditorPopup("new")}
            className={styles.addButton}
            width="44px"
          />
        </header>

        <QueryState query={query} errorMessage="Kunne ikke hente popupene.">
          {(popups) => {
            const now = Date.now();
            const active = popups.find(
              (popup) =>
                new Date(popup.startsAt).getTime() <= now &&
                new Date(popup.endsAt).getTime() > now,
            );
            const upcoming = popups.filter(
              (popup) => new Date(popup.startsAt).getTime() > now,
            );
            const past = popups.filter(
              (popup) => new Date(popup.endsAt).getTime() <= now,
            );
            const card = (
              popup: Popup,
              variant: "active" | "upcoming" | "past",
            ) => (
              <PopupCard
                key={popup.id}
                popup={popup}
                variant={variant}
                onEdit={() => setEditorPopup(popup)}
                onChangeDates={(payload) => updateDates(popup.id, payload)}
                onDelete={() => setDeletePopup(popup)}
              />
            );

            return (
              <div className={styles.sections}>
                <section aria-labelledby="active-heading">
                  <div className={styles.sectionHeading}>
                    <h2 id="active-heading">Aktiv pop-up</h2>
                  </div>
                  {active ? (
                    card(active, "active")
                  ) : (
                    <div className={styles.emptyActive}>
                      <p>Ingen pop-up er aktiv akkurat nå.</p>
                    </div>
                  )}
                </section>
                <section aria-labelledby="upcoming-heading">
                  <div className={styles.sectionHeading}>
                    <h2 id="upcoming-heading">Kommende</h2>
                  </div>
                  <div className={styles.list}>
                    {upcoming.length ? (
                      upcoming.map((popup) => card(popup, "upcoming"))
                    ) : (
                      <p className={styles.empty}>Ingen planlagte pop-ups.</p>
                    )}
                  </div>
                </section>
                <section aria-labelledby="history-heading">
                  <div className={styles.sectionHeading}>
                    <h2 id="history-heading">Historikk</h2>
                  </div>
                  <div className={styles.list}>
                    {past.length ? (
                      past.map((popup) => card(popup, "past"))
                    ) : (
                      <p className={styles.empty}>Ingen tidligere pop-ups.</p>
                    )}
                  </div>
                </section>
              </div>
            );
          }}
        </QueryState>
      </main>

      {editorPopup && (
        <ContentModal
          popup={editorPopup === "new" ? undefined : editorPopup}
          onClose={() => setEditorPopup(undefined)}
          onSave={(payload) =>
            editorPopup === "new"
              ? createPopup(payload)
              : updatePopup(editorPopup.id, payload)
          }
        />
      )}
      {deletePopup && (
        <Modal
          label="Slett pop-up?"
          description={`«${deletePopup.title}» fjernes permanent.`}
          closeButtonOnClick={() => setDeletePopup(undefined)}
        >
          <ModalButton
            text="Slett"
            type={ButtonType.DANGER}
            onClick={removePopup}
          />
          <ModalButton
            text="Avbryt"
            type={ButtonType.SECONDARY}
            onClick={() => setDeletePopup(undefined)}
          />
        </Modal>
      )}
    </>
  );
};

export default PopupScheduler;
