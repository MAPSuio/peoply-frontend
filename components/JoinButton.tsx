import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR, { KeyedMutator } from "swr";
import useRedirectToLogin from "../hooks/useRedirectToLogin";
import useSnack from "../hooks/useSnack";
import useUser from "../hooks/useUser";
import { registerUser, updateRegistrationUser } from "../services/events";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import {
  ButtonType,
  Event,
  InvitationStatus,
  Registration,
  RegStatus,
  SnackTypes,
} from "../types/types";
import Button from "./Button";
import Modal from "./Modal";

interface JoinButtonProps {
  event: Event;
  className?: string;
  joinText?: string;
  joinedText?: string;
  joinWaitlistText?: string;
  joinedWaitlistText?: string;
  eventFinishedText?: string;
  countdownText?: string;
  regClosedText?: string;
  updateOnChange?: KeyedMutator<any>;
  useUnregisterModal?: boolean;
  small?: boolean;
  noShadow?: boolean;
}

export default function JoinButton({
  event,
  className,
  joinText = "Meld deg på arrangementet",
  joinedText = "Meld deg av arrangementet",
  joinWaitlistText = "Meld deg på venteliste",
  joinedWaitlistText = "Meld deg av venteliste",
  eventFinishedText = "Arrangementet er ferdig",
  countdownText = "Påmelding åpner om",
  regClosedText = "Påmeldingen er stengt",
  updateOnChange,
  useUnregisterModal = false,
  small = false,
  noShadow = false,
}: JoinButtonProps) {
  const { user } = useUser();
  const {
    data: myRegistration,
    error,
    mutate: updateRegistration,
  } = useSWR<Registration>(
    () =>
      user?.id && event.id
        ? `/users/${user.id}/registrations/${event.id}`
        : false,
    fetchFromPeoplyApiJson,
  );

  const [countdown, setCountdown] = useState<string>();
  const [foodPreferenceModalOpen, setFoodPreferenceModalOpen] = useState(false);
  const [unregisterModalOpen, setUnregisterModalOpen] = useState(false);
  const [isCountdown, setIsCountdown] = useState<boolean>();
  const router = useRouter();
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();

  useEffect(() => {
    const int = setInterval(() => {
      const now = new Date();
      const regStart = event.regStart && new Date(event.regStart);

      if (regStart && regStart > now) {
        setIsCountdown(true);
        const diff = regStart.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setCountdown(
          `${days ? days + "d " : ""} ${hours ? hours + "t " : ""} ${
            minutes ? minutes + "m " : ""
          } ${days === 0 ? seconds + "s" : ""}`,
        );
      } else {
        setIsCountdown(false);
        setCountdown(undefined);

        // clear the interval when the countdown is over
        clearInterval(int);
      }
    }, 1000);
    return () => clearInterval(int);
  }, [event.regStart]);

  const loading = (!myRegistration && !error) || isCountdown === undefined;

  const eventFinished = (() => {
    const endDate = event.endDate && new Date(event.endDate);
    const now = new Date();

    if (endDate && now > endDate) {
      return true;
    }
    return false;
  })();

  const regClosed = (() => {
    const regEnd = event.regEnd && new Date(event.regEnd);
    const now = new Date();

    if (regEnd && now > regEnd) {
      return true;
    }
    return false;
  })();

  const buttonText = (() => {
    if (eventFinished) {
      return eventFinishedText;
    }

    if (regClosed) {
      return regClosedText;
    }

    if (isCountdown) {
      return countdownText + " " + countdown;
    }

    const freeSpace =
      event?.registrations &&
      event?.capacity &&
      event.registrations?.filter((r) => r.regStatus === RegStatus.GOING)
        ?.length < event.capacity;

    switch (myRegistration?.regStatus) {
      case RegStatus.GOING:
        return joinedText;
      case RegStatus.NOT_GOING:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
      case RegStatus.WAITLISTED:
        return joinedWaitlistText;
      case RegStatus.INVITED:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
      default:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
    }
  })();

  const buttonDisabled = (() => {
    if (eventFinished || isCountdown || regClosed) {
      return true;
    }

    return false;
  })();

  const buttonType = (() => {
    if (
      myRegistration?.regStatus === RegStatus.GOING ||
      myRegistration?.regStatus === RegStatus.WAITLISTED
    ) {
      return ButtonType.DANGER;
    }
    return ButtonType.PRIMARY;
  })();

  async function registerForEvent() {
    if (user) {
      if (!regClosed && !eventFinished) {
        /* force user to update food prefs if food is served */
        if (event.hasFood && !user.foodPreference) {
          return setFoodPreferenceModalOpen(true);
        }
        let newRegistration: Registration | undefined;
        try {
          newRegistration = await registerUser(
            user.id,
            event.id,
            RegStatus.GOING,
          );
        } catch (e) {
          newRegistration = undefined;
        }

        if (newRegistration) {
          updateRegistration();
          updateOnChange && updateOnChange();
          if (newRegistration.regStatus === RegStatus.GOING) {
            addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
          } else if (newRegistration.regStatus === RegStatus.WAITLISTED) {
            addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
          }
        } else {
          addSnack("En feil skjedde under påmelding", SnackTypes.ERROR);
        }
        return newRegistration;
      } else {
        addSnack("Dette arrangementet er ferdig.", SnackTypes.ERROR);
      }
    } else {
      redirectToLogin();
    }
  }

  async function updateRegistrationStatus(status: RegStatus) {
    if (user) {
      /* force user to update food prefs if food is served */
      if (status === RegStatus.GOING && event.hasFood && !user.foodPreference) {
        return setFoodPreferenceModalOpen(true);
      }
      let success = undefined;
      try {
        success = (await updateRegistrationUser(
          user.id,
          event.id,
          status,
        )) as Registration;
      } catch (e) {}
      if (success) {
        updateRegistration();
        updateOnChange && updateOnChange();
        if (success.regStatus === RegStatus.GOING) {
          addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.WAITLISTED) {
          addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
        } else if (success.regStatus === RegStatus.NOT_GOING) {
          addSnack("Du er nå meldt av arrangementet", SnackTypes.SUCCESS);
        }
      } else {
        addSnack("En feil skjedde under oppdatering", SnackTypes.ERROR);
      }
      return success;
    } else {
      redirectToLogin();
    }
  }

  async function acceptInvitation() {
    /* force user to update food prefs if food is served */
    if (event.hasFood && !user?.foodPreference) {
      return setFoodPreferenceModalOpen(true);
    }
    try {
      await fetchFromPeoplyApi(`/events/${event?.id}/invitations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          status: InvitationStatus.ACCEPTED,
        }),
      });
      updateRegistration();
      updateOnChange && updateOnChange();
      addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  }

  const buttonFunction = (() => {
    if (eventFinished) {
      return undefined;
    }

    if (isCountdown) {
      return undefined;
    }

    switch (myRegistration?.regStatus) {
      case RegStatus.GOING:
        return () => {
          if (useUnregisterModal) {
            setUnregisterModalOpen(true);
          } else {
            updateRegistrationStatus(RegStatus.NOT_GOING);
          }
        };
      case RegStatus.NOT_GOING:
        return () => {
          updateRegistrationStatus(RegStatus.GOING);
        };
      case RegStatus.WAITLISTED:
        return () => {
          if (useUnregisterModal) {
            setUnregisterModalOpen(true);
          } else {
            updateRegistrationStatus(RegStatus.NOT_GOING);
          }
        };
      case RegStatus.INVITED:
        return () => {
          acceptInvitation();
        };
      default:
        return () => {
          registerForEvent();
        };
    }
  })();

  return (
    <>
      {foodPreferenceModalOpen && (
        <Modal
          label={`Arrangementet har matservering`}
          description="For å melde deg på arrangementet må du fylle ut matpreferanser på profilen din."
          buttonText={`Rediger matpreferanser`}
          secondaryButtonText="Lukk"
          buttonOnClick={() => router.push("/me/edit")}
          secondaryButtonOnClick={() => setFoodPreferenceModalOpen(false)}
          closeButtonOnClick={() => setFoodPreferenceModalOpen(false)}
        />
      )}
      {useUnregisterModal && unregisterModalOpen && (
        <Modal
          label="Meld deg av arrangementet"
          description={`Er du sikker på at du vil melde deg av ${event.title}?`}
          buttonText="Meld deg av"
          secondaryButtonText="Forbli påmeldt"
          danger
          buttonOnClick={() => {
            updateRegistrationStatus(RegStatus.NOT_GOING);
            setUnregisterModalOpen(false);
          }}
          secondaryButtonOnClick={() => setUnregisterModalOpen(false)}
          closeButtonOnClick={() => setUnregisterModalOpen(false)}
        />
      )}
      <Button
        type={buttonType}
        text={buttonText}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          if (buttonFunction) buttonFunction();
        }}
        loading={loading}
        disabled={buttonDisabled}
        small={small}
        noShadow={noShadow}
      />
    </>
  );
}
