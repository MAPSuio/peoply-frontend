import { User } from "../types/types";

export function getFormattedName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}
