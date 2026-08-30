import useSWR from "swr";
import {
  listMcpTools,
  type McpTool,
  type McpToolScope,
} from "../services/mcpTools";
import styles from "../styles/Integrasjoner.module.scss";

const scopeLabels: { scope: McpToolScope; label: string }[] = [
  { scope: "peoply:read", label: "Les" },
  { scope: "peoply:write", label: "Skriv" },
  { scope: "peoply:organize", label: "Arranger" },
];

const ToolGroup = ({ label, tools }: { label: string; tools: McpTool[] }) => {
  if (!tools.length) return null;
  return (
    <div className={styles.toolGroup}>
      <h4>
        {label} <small>{tools.length} verktøy</small>
      </h4>
      <dl>
        {tools.map((tool) => (
          <div className={styles.toolRow} key={tool.name}>
            <dt>{tool.name}</dt>
            <dd>{tool.summary}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

const McpToolCatalog = () => {
  const { data: tools, error, isLoading } = useSWR("/mcp/tools", listMcpTools);

  return (
    <details className={styles.setupGuide}>
      <summary>Hva kan agenten gjøre med nøkkelen?</summary>
      {isLoading && <p className={styles.keyStatus}>Henter verktøylista…</p>}
      {error && (
        <p className={styles.copyError} role="alert">
          Kunne ikke hente verktøylista fra API-et.
        </p>
      )}
      {tools?.length === 0 && (
        <p className={styles.keyStatus}>
          API-et oppgir ingen verktøy akkurat nå.
        </p>
      )}
      {tools &&
        scopeLabels.map(({ scope, label }) => (
          <ToolGroup
            key={scope}
            label={label}
            tools={tools.filter((tool) => tool.scope === scope)}
          />
        ))}
    </details>
  );
};

export default McpToolCatalog;
