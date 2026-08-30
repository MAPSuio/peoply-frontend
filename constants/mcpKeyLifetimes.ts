export const MAX_MCP_KEY_LIFETIME_DAYS = 365;

export const DEFAULT_MCP_KEY_LIFETIME_DAYS = 90;

export type McpKeyLifetimeOption = {
  days: number;
  label: string;
};

export const MCP_KEY_LIFETIME_OPTIONS: McpKeyLifetimeOption[] = [
  { days: 7, label: "7 dager" },
  { days: 30, label: "30 dager" },
  { days: DEFAULT_MCP_KEY_LIFETIME_DAYS, label: "90 dager (anbefalt)" },
  { days: 180, label: "180 dager" },
  { days: MAX_MCP_KEY_LIFETIME_DAYS, label: "365 dager" },
];
