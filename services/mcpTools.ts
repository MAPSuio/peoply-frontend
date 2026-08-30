import { fetchFromPeoplyApiJson } from "./fetchers";

export type McpToolScope = "peoply:read" | "peoply:write" | "peoply:organize";

export type McpTool = {
  name: string;
  title: string;
  description: string;
  scope: McpToolScope;
};

export const listMcpTools = async (): Promise<McpTool[]> => {
  const data = await fetchFromPeoplyApiJson("/mcp/tools");
  return data ?? [];
};
