const UUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const API_REF_PATTERN = /^[A-Za-z0-9-]{1,64}$/;

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

export function isValidApiRef(value: string): boolean {
  return API_REF_PATTERN.test(value);
}
