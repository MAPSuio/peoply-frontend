import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import HeadComponent from "../../../components/HeadComponent";
import Modal from "../../../components/Modal";
import ModalButton from "../../../components/ModalButton";
import QueryState from "../../../components/QueryState";
import PopupDateRangeButton, {
  type PopupInterval,
} from "../../../components/PopupDateRangeButton";
import EditIcon from "../../../components/svgs/EditIcon";
import PlusIcon from "../../../components/svgs/PlusIcon";
import TrashIcon from "../../../components/svgs/TrashIcon";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import { ApiError, apiErrorMessage } from "../../../services/apiError";
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
  type PopupConflict,
  popupConflict,
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
  const [conflict, setConflict] = useState<PopupConflict>();

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
    setConflict(undefined);
    try {
      await onSave(payload);
      onClose();
    } catch (error) {
      /* Show what the API actually said. Asserting a cause here ("sjekk at
         tidsrommet er ledig") sent people looking for an overlap whenever the
         real failure was something else entirely. */
      setError(apiErrorMessage(error) ?? "Kunne ikke lagre pop-upen.");
      setConflict(popupConflict(error));
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
        {error && (
          <div className={styles.formError} role="alert">
            <p>{error}</p>
            {/* Without the interval the admin has nothing to move out of the
                way - the colliding popup is often not in the list behind this
                dialog, since it only revalidates after a successful write. */}
            {conflict && (
              <p className={styles.conflictRange}>
                {`«${conflict.title}» opptar ${formatPopupRange(
                  conflict.startsAt,
                  conflict.endsAt,
                )}`}
              </p>
            )}
          </div>
        )}
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
  onChangeDates: (interval: PopupInterval) => Promise<void>;
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
          <PopupDateRangeButton
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

  /* Best-effort on purpose: the write has already landed by the time this
     runs, so a refresh that fails must not make it look like the write did.
     SwrProvider's onError already reports the failed refresh itself. */
  const refresh = () => {
    query.mutate().catch(() => {
      // Already surfaced by onError; nothing left for this caller to do.
    });
  };

  /* The list only ever revalidated after a *successful* write, so the popup
     behind a 409 was one it had usually never seen: the conflict named a row
     that was nowhere on the page, which reads as the scheduler making it up.
     Pull the list in on conflict so the offender appears behind the dialog. */
  const writePopup = async (resource: string, init: RequestInit) => {
    try {
      return await fetchFromPeoplyApiJson(resource, {
        headers: { "Content-Type": "application/json" },
        ...init,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) refresh();
      throw error;
    }
  };

  const createPopup = async (payload: PopupPayload) => {
    await writePopup("/popups", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    addSnack("Pop-upen er planlagt", SnackTypes.SUCCESS);
    refresh();
  };

  const updatePopup = async (
    popupId: string,
    payload: Partial<PopupPayload>,
  ) => {
    await writePopup(`/popups/${popupId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    refresh();
  };

  const updateDates = async (popupId: string, interval: PopupInterval) => {
    try {
      await updatePopup(popupId, interval);
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
      addSnack("Pop-upen er slettet", SnackTypes.SUCCESS);
      refresh();
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

            /* Every popup lands in exactly one bucket, including one whose
               dates we cannot read. Three independent predicates left such a
               popup matching none of them, so it vanished from the page while
               still occupying its interval - the scheduler then reported a
               conflict against a popup that was nowhere on screen. */
            const grouped: Record<"active" | "upcoming" | "past", Popup[]> = {
              active: [],
              upcoming: [],
              past: [],
            };

            for (const popup of popups) {
              const startsAt = new Date(popup.startsAt).getTime();
              const endsAt = new Date(popup.endsAt).getTime();

              if (Number.isNaN(startsAt) || Number.isNaN(endsAt)) {
                grouped.upcoming.push(popup);
              } else if (startsAt > now) {
                grouped.upcoming.push(popup);
              } else if (endsAt > now) {
                grouped.active.push(popup);
              } else {
                grouped.past.push(popup);
              }
            }

            const { active, upcoming, past } = grouped;
            const card = (
              popup: Popup,
              variant: "active" | "upcoming" | "past",
            ) => (
              <PopupCard
                key={popup.id}
                popup={popup}
                variant={variant}
                onEdit={() => setEditorPopup(popup)}
                onChangeDates={(interval) => updateDates(popup.id, interval)}
                onDelete={() => setDeletePopup(popup)}
              />
            );

            return (
              <div className={styles.sections}>
                <section aria-labelledby="active-heading">
                  <div className={styles.sectionHeading}>
                    <h2 id="active-heading">Aktiv pop-up</h2>
                  </div>
                  {active.length ? (
                    active.map((popup) => card(popup, "active"))
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
