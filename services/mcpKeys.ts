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

export const listMcpApiKeys = (): Promise<McpApiKey[]> =>
  fetchFromPeoplyApiJson("/mcp/keys");

export const createMcpApiKey = (
  name: string,
  scopes: McpScope[],
): Promise<CreatedMcpApiKey> =>
  fetchFromPeoplyApiJson("/mcp/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, scopes, expiresInDays: 90 }),
  });

export const revokeMcpApiKey = (keyId: string) =>
  fetchFromPeoplyApi(`/mcp/keys/${encodeURIComponent(keyId)}`, {
    method: "DELETE",
  });
