import { fetchFromPeoplyApi, fetchFromPeoplyApiJson } from "./fetchers";

export type McpScope = "READ" | "WRITE" | "ORGANIZE";

export type McpApiKey = {
  id: string;
  name: string;
  scopes: McpScope[];
  expiresAt: string;
  revokedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
};

export type CreatedMcpApiKey = McpApiKey & { token: string };

export const listMcpApiKeys = async (): Promise<McpApiKey[]> => {
  const data = await fetchFromPeoplyApiJson("/mcp/keys");
  return data ?? [];
};

export const createMcpApiKey = async (
  name: string,
  scopes: McpScope[],
  expiresInDays: number,
): Promise<CreatedMcpApiKey> => {
  const data = (await fetchFromPeoplyApiJson("/mcp/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, scopes, expiresInDays }),
  })) as CreatedMcpApiKey | undefined;
  if (!data?.token) {
    throw new Error("Kunne ikke hente MCP-nøkkel");
  }
  return data;
};

export const revokeMcpApiKey = (keyId: string) =>
  fetchFromPeoplyApi(`/mcp/keys/${encodeURIComponent(keyId)}`, {
    method: "DELETE",
  });
