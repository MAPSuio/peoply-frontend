import { RegStatus, SnackTypes } from "../types/types";

const REGISTRATION_SNACK: Partial<Record<RegStatus, string>> = {
  [RegStatus.GOING]: "Du er nå meldt på arrangementet",
  [RegStatus.WAITLISTED]: "Du er nå på venteliste",
  [RegStatus.NOT_GOING]: "Du er nå meldt av arrangementet",
};

export interface RegistrationListeners {
  refresh: () => void;
  snack: (message: string, type: SnackTypes) => void;
}

export function announceRegistration(
  registration: { regStatus: RegStatus } | undefined,
  errorMessage: string,
  { refresh, snack }: RegistrationListeners,
): void {
  if (!registration) {
    snack(errorMessage, SnackTypes.ERROR);
    return;
  }

  refresh();

  const message = REGISTRATION_SNACK[registration.regStatus];
  if (message) {
    snack(message, SnackTypes.SUCCESS);
  }
}
