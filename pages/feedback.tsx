import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import BackButton from "../components/BackButton";
import Button from "../components/Button";
import HeadComponent from "../components/HeadComponent";
import TextInputLong from "../components/inputs/TextInputLong";
import useBack from "../hooks/useBack";
import useSnack from "../hooks/useSnack";
import useUser from "../hooks/useUser";
import { createFeedback } from "../services/feedback";
import { ButtonType, SnackTypes } from "../types/types";
import styles from "../styles/FeedbackPage.module.scss";

interface FeedbackPageProps {
  baseUrl: string;
}

export default function FeedbackPage({ baseUrl }: FeedbackPageProps) {
  const goBack = useBack();
  const router = useRouter();
  const { user, loading } = useUser();
  const { addSnack } = useSnack();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const trimmedMessage = useMemo(() => message.trim(), [message]);
  const validMessage =
    trimmedMessage.length >= 10 && trimmedMessage.length <= 2000;

  const handleLoginRedirect = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("redirectURL", "/feedback");
    }

    await router.push("/login?redirect=/feedback");
  };

  const handleSubmit = async () => {
    if (!user) {
      await handleLoginRedirect();
      return;
    }

    if (!validMessage) {
      addSnack("Skriv minst 10 tegn i tilbakemeldingen din", SnackTypes.ERROR);
      return;
    }

    try {
      setSubmitting(true);
      await createFeedback(trimmedMessage);
      setMessage("");
      addSnack("Takk! Tilbakemeldingen din er sendt.", SnackTypes.SUCCESS);
    } catch (error) {
      if (error instanceof Response) {
        if (error.status === 429) {
          addSnack(
            "Du kan sende maks en tilbakemelding per time",
            SnackTypes.WARNING,
          );
        } else if (error.status === 401) {
          await handleLoginRedirect();
        } else {
          addSnack(
            "Kunne ikke sende tilbakemelding akkurat nå",
            SnackTypes.ERROR,
          );
        }
      } else {
        addSnack(
          "Kunne ikke sende tilbakemelding akkurat nå",
          SnackTypes.ERROR,
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <HeadComponent
        title="Feedback"
        description="Send anonym feedback til Peoply"
        url={`${baseUrl}/feedback`}
        noIndex
      />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton onClick={goBack} className={styles.backButton} />
          <div className={styles.hero}>
            <h1 className={styles.title}>Hva synes du om Peoply?</h1>
            <p className={styles.lead}>
              Vi bruker tilbakemeldingene dine for å forbedre Peoply og
              prioritere nye fixes og features.
            </p>
          </div>

          <div className={styles.card}>
            <div className={styles.infoBlock}>
              <h2 className={styles.sectionTitle}>
                Slik behandler vi feedbacken
              </h2>
              <p className={styles.copy}>
                Alle tilbakemeldinger er anonyme og brukes kun til å forbedre
                Peoply.app. Grunnet spam har vi lagt tilbakemeldingene bak
                autentisering.
              </p>
            </div>

            <div className={styles.formBlock}>
              {loading ? null : user ? (
                <>
                  <TextInputLong
                    value={message}
                    inputId="feedback-message"
                    inputName="feedback-message"
                    rows={8}
                    label="Din tilbakemelding"
                    placeholder="Hva fungerer bra, hva fungerer ikke, og hva burde vi bygge videre?"
                    maxLength={2000}
                    errorMessage="Skriv minst 10 tegn"
                    handleChange={(event) => setMessage(event.target.value)}
                    validate
                    valid={validMessage}
                    required
                    card
                  />

                  <Button
                    text="Send feedback"
                    onClick={handleSubmit}
                    disabled={!validMessage || submitting}
                    loading={submitting}
                    className={styles.submitButton}
                  />
                </>
              ) : (
                <div className={styles.loginGate}>
                  <h2 className={styles.sectionTitle}>
                    Logg inn for å gi feedback
                  </h2>
                  <Button
                    text="Logg inn for å starte"
                    onClick={handleLoginRedirect}
                    type={ButtonType.SECONDARY}
                    className={styles.submitButton}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  return {
    props: {
      baseUrl,
    },
  };
};
