import type { NextPage } from "next";
import { useRouter } from "next/router";
import { type FormEvent, type MouseEvent, useRef, useState } from "react";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import HeadComponent from "../../components/HeadComponent";
import Link from "../../components/Link";
import { requestEmailLogin, verifyEmailLogin } from "../../services/auth";
import styles from "../../styles/Login.module.scss";
import { takeStoredRedirectPath } from "../../utils/redirect";

type Status = "idle" | "sending" | "sent" | "failed" | "rateLimited";

const STATUS_TEXT: Partial<Record<Status, string>> = {
  sent: "Sjekk e-posten din. Finnes det en bruker med denne adressen, har vi sendt deg en lenke.",
  failed: "Noe gikk galt. Prøv igjen.",
  rateLimited: "For mange forsøk. Vent litt og prøv igjen.",
};

const RequestLinkForm = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const latestRequest = useRef(0);

  const changeEmail = (value: string) => {
    latestRequest.current += 1;
    setEmail(value);
    setStatus("idle");
  };

  const submit = async (event: FormEvent | MouseEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    const request = ++latestRequest.current;
    setStatus("sending");
    try {
      const response = await requestEmailLogin(email.trim());
      if (request !== latestRequest.current) return;
      setStatus(
        response.ok
          ? "sent"
          : response.status === 429
            ? "rateLimited"
            : "failed",
      );
    } catch {
      if (request === latestRequest.current) setStatus("failed");
    }
  };

  return (
    <form className={styles.emailForm} onSubmit={submit}>
      <label className={styles.emailLabel} htmlFor="login-email">
        E-post
      </label>
      <input
        className={styles.emailInput}
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        maxLength={254}
        required
        value={email}
        onChange={(event) => changeEmail(event.target.value)}
      />
      <Button
        text="Send lenke"
        onClick={submit}
        loading={status === "sending"}
        disabled={status === "sending"}
      />
      {STATUS_TEXT[status] && (
        <p className={styles.emailStatus} role="status">
          {STATUS_TEXT[status]}
        </p>
      )}
    </form>
  );
};

const UseLink = ({ token }: { token: string }) => {
  const [status, setStatus] = useState<"idle" | "busy" | "invalid" | "failed">(
    "idle",
  );

  const logIn = async () => {
    setStatus("busy");
    try {
      const response = await verifyEmailLogin(token);
      if (!response.ok) {
        setStatus(response.status === 401 ? "invalid" : "failed");
        return;
      }
      window.location.assign(takeStoredRedirectPath());
    } catch {
      setStatus("failed");
    }
  };

  if (status === "invalid") {
    return (
      <div className={styles.emailForm}>
        <p className={styles.emailStatus} role="status">
          Lenken er utløpt eller allerede brukt.
        </p>
        <Link className={styles.providerButton} href="/login/email">
          <span className={styles.providerButtonText}>Be om en ny lenke</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.emailForm}>
      <Button
        text="Logg inn"
        onClick={logIn}
        loading={status === "busy"}
        disabled={status === "busy"}
      />
      {status === "failed" && (
        <p className={styles.emailStatus} role="status">
          {STATUS_TEXT.failed}
        </p>
      )}
    </div>
  );
};

const EmailLogin: NextPage = () => {
  const router = useRouter();
  const token =
    typeof router.query.token === "string" ? router.query.token : undefined;

  return (
    <>
      <HeadComponent
        title="Logg inn med e-post"
        description="Logg inn på Peoply med en lenke på e-post"
        path="/login/email"
      />
      <div className={styles.loginWrapper}>
        <div className={styles.loginContainer}>
          <BackButton onClick={() => router.push("/login")} />
          <div className={styles.loginHeaderContainer}>
            <h1>Logg inn med e-post</h1>
            <p>
              {token
                ? "Trykk på knappen for å fullføre innloggingen."
                : "Vi sender deg en lenke du kan logge inn med."}
            </p>
          </div>
          {token ? <UseLink key={token} token={token} /> : <RequestLinkForm />}
        </div>
      </div>
    </>
  );
};

export default EmailLogin;
