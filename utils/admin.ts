import type { User } from "../types/types";

export function isAdmin(user: User | undefined) {
  return Boolean(user?.isAdmin);
}
