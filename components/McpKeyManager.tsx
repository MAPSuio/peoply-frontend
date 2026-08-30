import { useState } from "react";
import useSWR, { type KeyedMutator } from "swr";
import useUser from "../hooks/useUser";
import {
  createMcpApiKey,
  listMcpApiKeys,
  type McpApiKey,
  type McpScope,
  revokeMcpApiKey,
} from "../services/mcpKeys";
import styles from "../styles/Integrasjoner.module.scss";

const scopeOptions: { value: McpScope; label: string; description: string }[] =
  [
    { value: "READ", label: "Les", description: "Arrangementer og egne data" },
    {
      value: "WRITE",
      label: "Skriv",
      description: "Påmelding, favoritter og følger",
    },
    {
      value: "ORGANIZE",
      label: "Arranger",
      description: "Opprett arrangementer og se påmeldte",
    },
  ];

type KeyFormProps = {
  busy: boolean;
  name: string;
  scopes: McpScope[];
  onCreate: () => void;
  onNameChange: (name: string) => void;
  onScopeToggle: (scope: McpScope) => void;
};

const KeyForm = ({
  busy,
  name,
  scopes,
  onCreate,
  onNameChange,
  onScopeToggle,
}: KeyFormProps) => (
  <div className={styles.keyForm}>
    <label htmlFor="mcp-key-name">Navn på nøkkelen</label>
    <input
      id="mcp-key-name"
      maxLength={100}
      placeholder="For eksempel Claude Code"
      value={name}
      onChange={(event) => onNameChange(event.target.value)}
    />
    <fieldset>
      <legend>Tilgang</legend>
      {scopeOptions.map((scope) => (
        <label className={styles.scopeOption} key={scope.value}>
          <input
            checked={scopes.includes(scope.value)}
            type="checkbox"
            onChange={() => onScopeToggle(scope.value)}
          />
          <span>
            <strong>{scope.label}</strong>
            <small>{scope.description}</small>
          </span>
        </label>
      ))}
    </fieldset>
    <button disabled={busy || !name.trim()} type="button" onClick={onCreate}>
      Opprett nøkkel
    </button>
  </div>
);

const KeyList = ({
  keys,
  busy,
  onRevoke,
}: {
  keys: McpApiKey[];
  busy: boolean;
  onRevoke: (key: McpApiKey) => void;
}) => (
  <div className={styles.keyList}>
    {keys.map((key) => (
      <div className={styles.keyRow} key={key.id}>
        <span>
          <strong>{key.name}</strong>
          <small>
            {key.scopes.join(" · ")} · utløper{" "}
            {new Date(key.expiresAt).toLocaleDateString("nb-NO", {
              timeZone: "UTC",
            })}
          </small>
        </span>
        {key.revokedAt ? (
          <small>Tilbakekalt</small>
        ) : (
          <button disabled={busy} type="button" onClick={() => onRevoke(key)}>
            Tilbakekall
          </button>
        )}
      </div>
    ))}
  </div>
);

const useMcpKeyActions = (mutate: KeyedMutator<McpApiKey[]>) => {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<McpScope[]>(["READ"]);
  const [token, setToken] = useState<string>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const toggleScope = (scope: McpScope) =>
    setScopes((current) => {
      const next = current.includes(scope)
        ? current.filter((item) => item !== scope)
        : [...current, scope];
      return next.length ? next : ["READ"];
    });

  const createKey = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setBusy(true);
    setError(undefined);
    setToken(undefined);
    try {
      const created = await createMcpApiKey(trimmedName, scopes);
      const { token: secretToken, ...storedKey } = created;
      await mutate((current = []) => [storedKey, ...current], {
        revalidate: false,
      });
      setToken(secretToken);
      setName("");
    } catch {
      setError("Kunne ikke opprette API-nøkkelen.");
    } finally {
      setBusy(false);
    }
  };

  const revokeKey = async (key: McpApiKey) => {
    setBusy(true);
    setError(undefined);
    try {
      await revokeMcpApiKey(key.id);
      await mutate(
        (current = []) =>
          current.map((item) =>
            item.id === key.id
              ? { ...item, revokedAt: new Date().toISOString() }
              : item,
          ),
        { revalidate: false },
      );
    } catch {
      setError("Kunne ikke tilbakekalle API-nøkkelen.");
    } finally {
      setBusy(false);
    }
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(token ?? "");
    } catch {
      setError("Kunne ikke kopiere nøkkelen. Marker den manuelt.");
    }
  };

  return {
    busy,
    copyToken,
    createKey,
    error,
    name,
    revokeKey,
    scopes,
    setName,
    token,
    toggleScope,
  };
};

const CreatedKey = ({
  token,
  onCopy,
}: {
  token?: string;
  onCopy: () => void;
}) => {
  if (!token) return null;
  return (
    <div className={styles.newKey} role="status">
      <strong>Kopier nøkkelen nå</strong>
      <p>Den vises bare denne gangen.</p>
      <code>{token}</code>
      <button type="button" onClick={onCopy}>
        Kopier nøkkel
      </button>
    </div>
  );
};

const KeyLoadState = ({
  keys,
  error,
  loading,
  busy,
  onRevoke,
}: {
  keys?: McpApiKey[];
  error: unknown;
  loading: boolean;
  busy: boolean;
  onRevoke: (key: McpApiKey) => void;
}) => {
  if (loading) return <p className={styles.keyStatus}>Henter API-nøkler…</p>;
  if (error) return null;
  if (!keys?.length)
    return <p className={styles.keyStatus}>Du har ingen API-nøkler ennå.</p>;
  return <KeyList busy={busy} keys={keys} onRevoke={onRevoke} />;
};

const McpKeyManager = () => {
  const { user, loading: userLoading } = useUser();
  const {
    data: keys,
    error: keysError,
    isLoading,
    mutate,
  } = useSWR<McpApiKey[]>(user ? "/mcp/keys" : null, listMcpApiKeys);
  const actions = useMcpKeyActions(mutate);

  if (userLoading) return null;
  if (!user)
    return (
      <p className={styles.signInNote}>
        <a href="/login">Logg inn</a> for å opprette en personlig MCP-nøkkel.
      </p>
    );

  return (
    <div className={styles.keyManager}>
      <KeyForm
        busy={actions.busy}
        name={actions.name}
        scopes={actions.scopes}
        onCreate={actions.createKey}
        onNameChange={actions.setName}
        onScopeToggle={actions.toggleScope}
      />
      <CreatedKey token={actions.token} onCopy={actions.copyToken} />
      {(actions.error || keysError) && (
        <p className={styles.copyError} role="alert">
          {actions.error ?? "Kunne ikke hente API-nøkler."}
        </p>
      )}
      <KeyLoadState
        busy={actions.busy}
        error={keysError}
        keys={keys}
        loading={isLoading}
        onRevoke={actions.revokeKey}
      />
    </div>
  );
};

export default McpKeyManager;
