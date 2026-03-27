import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import useUser from "../hooks/useUser";
import styles from "../styles/FeedbackEntryPoints.module.scss";

const HIDDEN_PATH_PREFIXES = ["/feedback"];

export default function FeedbackEntryPoints() {
  const router = useRouter();
  const { user } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  const shouldHide = useMemo(
    () =>
      HIDDEN_PATH_PREFIXES.some((pathPrefix) =>
        router.pathname.startsWith(pathPrefix),
      ),
    [router.pathname],
  );

  if (shouldHide) {
    return null;
  }

  const goToFeedback = async () => {
    setModalOpen(false);
    await router.push("/feedback");
  };

  return (
    <>
      <button
        className={styles.popupLauncher}
        onClick={() => setModalOpen(true)}
        type="button"
      >
        Gi feedback
      </button>

      <button
        className={styles.bottomButton}
        onClick={goToFeedback}
        type="button"
      >
        Fortell oss hva du synes om Peoply
      </button>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={() => setModalOpen(false)}
          role="presentation"
        >
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-entry-title"
          >
            <p className={styles.eyebrow}>Peoply vil lytte</p>
            <h2 className={styles.title} id="feedback-entry-title">
              Fortell oss hva du synes om Peoply
            </h2>
            <p className={styles.copy}>
              Del en anonym tilbakemelding om hva som fungerer bra, hva som er
              uklart, eller hva du savner.
            </p>
            <p className={styles.copyMuted}>
              {user
                ? "Du er logget inn og kan sende feedback med en gang."
                : "Du må være logget inn for å sende feedback."}
            </p>
            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setModalOpen(false)}
                type="button"
              >
                Lukk
              </button>
              <button
                className={styles.primaryButton}
                onClick={goToFeedback}
                type="button"
              >
                {user ? "Gå til feedback" : "Logg inn og svar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
