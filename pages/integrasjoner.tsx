import { useState } from "react";

import BackButton from "../components/BackButton";
import HeadComponent from "../components/HeadComponent";
import Navbar from "../components/Navbar";
import useBack from "../hooks/useBack";

import { API_URL } from "../constants/urls";

import styles from "../styles/Integrasjoner.module.scss";

type Prompt = {
  id: string;
  title: string;
  text: string;
};

type CopyState = {
  promptId: string;
  status: "copying" | "copied" | "error";
};

const createPrompts = (apiBaseUrl: string, openApiUrl: string): Prompt[] => {
  const apiContext = `Peoply API base URL: ${apiBaseUrl}
Peoply API docs: ${apiBaseUrl}/api
Peoply OpenAPI JSON: ${openApiUrl}
Peoply agent docs: https://peoply.app/llms.txt`;

  return [
    {
      id: "openapi-integration",
      title: "Bruk OpenAPI JSON i en integrasjon",
      text: `${apiContext}

Use the Peoply API to implement [DESCRIBE YOUR GOAL] in this repository. Inspect the repository and follow its existing architecture, data-fetching, error-handling, and test conventions.

Before planning or writing code, fetch and read ${openApiUrl}. Use paths, HTTP methods, operationId, parameters, required fields, enums, and schemas as the source of truth. Map the goal to the exact operations it needs. If authentication, response schemas, or behavior are missing or ambiguous, state that clearly instead of guessing. Prefer public GET operations unless the task explicitly requires protected access.

Present a short plan, then implement it. Build requests from the documented contract, validate untrusted responses at the application boundary, and handle non-2xx responses, timeouts, pagination, and empty data. Do not expose credentials or personal data. Add focused tests, run the repository checks, and summarize the API operations used.`,
    },
    {
      id: "event-feed",
      title: "Bygg en arrangement-feed",
      text: `${apiContext}

Add an upcoming Peoply events feed to this repository. Inspect the repository first and follow its existing architecture, data-fetching, UI, and test conventions.

Read ${openApiUrl} before writing code. Use the public GET ${apiBaseUrl}/events operation with afterDate set to the current ISO timestamp, orderBy=startDate, and orderDirection=asc. Include parameters marked as required by the current schema. Paginate with skip and take. Do not invent response fields; render only fields confirmed by OpenAPI or an existing typed client.

Show clear loading, empty, and error states. Handle time zones, URL encoding, request cancellation, and non-2xx responses. Do not send credentials or use protected or write operations. Add tests for the request parameters, pagination, and error state. Run the repository checks and summarize the result.`,
    },
    {
      id: "organization-search",
      title: "Legg til foreningssøk",
      text: `${apiContext}

Add Peoply organization search to this repository. Inspect the repository first and reuse its existing search, data-fetching, UI, and test patterns.

Read ${openApiUrl} before writing code. Use the public GET ${apiBaseUrl}/organizations operation and its name query parameter. Build query strings with URLSearchParams, debounce user input if this is an interactive client, cancel stale requests, and use the organization's stable ID for selection and links. Do not invent response fields.

Show useful loading, no-results, and error states. Do not send credentials or expose protected organization data. Add tests for URL encoding, stale responses, no results, and API errors. Run the repository checks and summarize the result.`,
    },
    {
      id: "calendar-subscription",
      title: "Legg til kalenderabonnement",
      text: `${apiContext}

Add a public Peoply calendar subscription for an organization in this repository. Inspect the repository first and follow its existing component, link, and test conventions.

Read ${openApiUrl} before writing code. Use the public GET ${apiBaseUrl}/organizations/{orgId}/calendar.ics operation with a real stable organization ID from the surrounding data. Link directly to the feed unless the existing architecture requires a server proxy. Do not parse and rebuild the ICS payload, add credentials, or use a display name in place of orgId.

Make the action clear and accessible. Verify the generated URL, preserve the .ics response, add a regression test, run the repository checks, and summarize the result.`,
    },
  ];
};

const CopyIcon = ({ copied }: { copied: boolean }) => (
  <svg
    aria-hidden="true"
    fill="none"
    height="18"
    viewBox="0 0 24 24"
    width="18"
  >
    {copied ? (
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    ) : (
      <>
        <rect
          height="13"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
          width="13"
          x="8"
          y="8"
        />
        <path
          d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </>
    )}
  </svg>
);

const ExternalLinkIcon = () => (
  <svg
    aria-hidden="true"
    fill="none"
    height="16"
    viewBox="0 0 24 24"
    width="16"
  >
    <path
      d="M14 5h5v5M19 5l-8 8M19 13v4a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const CopyPromptButton = ({ prompt }: { prompt: Prompt }) => {
  const [copyState, setCopyState] = useState<CopyState>();

  const copyPrompt = async () => {
    setCopyState({ promptId: prompt.id, status: "copying" });

    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopyState({ promptId: prompt.id, status: "copied" });
    } catch {
      setCopyState({ promptId: prompt.id, status: "error" });
    }
  };

  const status =
    copyState?.promptId === prompt.id ? copyState.status : undefined;
  const label =
    status === "copying"
      ? `Kopierer prompt: ${prompt.title}…`
      : status === "copied"
        ? `Prompt kopiert: ${prompt.title}`
        : status === "error"
          ? `Kunne ikke kopiere: ${prompt.title}`
          : `Kopier prompt: ${prompt.title}`;

  return (
    <div className={styles.copyControl}>
      <button
        aria-label={label}
        aria-live="polite"
        className={styles.copyButton}
        disabled={status === "copying"}
        title={label}
        type="button"
        onClick={copyPrompt}
      >
        <CopyIcon copied={status === "copied"} />
      </button>
      {status === "error" && (
        <span className={styles.copyError} role="status">
          Prøv igjen
        </span>
      )}
    </div>
  );
};

const Integrasjoner = () => {
  const goBack = useBack();
  const apiBaseUrl = (API_URL || "https://api.peoply.app").replace(/\/+$/, "");
  const docsUrl = `${apiBaseUrl}/api`;
  const openApiUrl = `${apiBaseUrl}/api/openapi.json`;
  const prompts = createPrompts(apiBaseUrl, openApiUrl);

  return (
    <>
      <HeadComponent
        title="API-dokumentasjon"
        description="Kom i gang med Peoply API-et ved hjelp av en kodeagent"
        path="/integrasjoner"
      />
      <main className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton onClick={goBack} className={styles.backButton} />

          <header className={styles.header}>
            <h1>Bygg med Peoply API-et</h1>
            <div className={styles.headerLinks}>
              <a href={docsUrl} target="_blank" rel="noreferrer">
                API-docs
                <ExternalLinkIcon />
              </a>
              <a href={openApiUrl} target="_blank" rel="noreferrer">
                API JSON
                <ExternalLinkIcon />
              </a>
            </div>
          </header>

          <aside className={styles.intention}>
            <p>
              KI-assistert utvikling blir en stadig viktigere del av hvordan
              programvare bygges. Derfor tilpasser vi dokumentasjonen til
              utviklernes arbeidsflyt, slik at det blir mer sømløst å utforske
              og integrere med Peoplys API. KI-agenter tolker API-et best når de
              leser OpenAPI JSON direkte.
            </p>
          </aside>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>Prompts for kodeagenten din</h2>
            </div>
            <div className={styles.promptList}>
              {prompts.map((prompt) => (
                <article className={styles.promptCard} key={prompt.id}>
                  <div className={styles.promptHeader}>
                    <h3>{prompt.title}</h3>
                    <CopyPromptButton prompt={prompt} />
                  </div>
                  <pre className={styles.promptCode}>
                    <code>{prompt.text}</code>
                  </pre>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>Ressurser</h2>
            </div>
            <div className={styles.resourceList}>
              <a href="/llms.txt" target="_blank" rel="noreferrer">
                <strong>llms.txt</strong>
              </a>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h2>Viktig før du starter</h2>
            </div>
            <ul className={styles.guidelines}>
              <li>
                Start med offentlige GET-kall for arrangementer og foreninger.
              </li>
              <li>
                Bruk OpenAPI-kontrakten, ikke modellens hukommelse, som fasit.
              </li>
              <li>Ikke legg passord, cookies eller persondata i en prompt.</li>
              <li>
                Beskyttede kall bruker Peoplys browserbaserte innlogging og skal
                ikke videresendes til en autonom agent.
              </li>
              <li>
                Organisasjoner kan også importere og dele arrangementer via
                offentlige <code>.ics</code>-feeder.
              </li>
            </ul>
          </section>
        </div>
      </main>
      <Navbar />
    </>
  );
};

export default Integrasjoner;
