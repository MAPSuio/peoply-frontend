export const MAX_MCP_KEY_LIFETIME_DAYS = 365;

export const DEFAULT_MCP_KEY_LIFETIME_DAYS = 90;

export const MCP_KEY_LIFETIME_OPTIONS = [
  { days: 7, label: "7 dager" },
  { days: 30, label: "30 dager" },
  { days: DEFAULT_MCP_KEY_LIFETIME_DAYS, label: "90 dager (anbefalt)" },
  { days: 180, label: "180 dager" },
  { days: MAX_MCP_KEY_LIFETIME_DAYS, label: "365 dager" },
] as const;

export type McpKeyLifetimeDays =
  (typeof MCP_KEY_LIFETIME_OPTIONS)[number]["days"];

export const toMcpKeyLifetimeDays = (value: number): McpKeyLifetimeDays =>
  MCP_KEY_LIFETIME_OPTIONS.find((option) => option.days === value)?.days ??
  DEFAULT_MCP_KEY_LIFETIME_DAYS;
