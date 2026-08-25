import { useEffect, useState } from "react";
import useSWR from "swr";
import useRedirectToLogin from "../hooks/useRedirectToLogin";
import useRegistrationCountdown from "../hooks/useRegistrationCountdown";
import useSnack from "../hooks/useSnack";
import useUser from "../hooks/useUser";
import { registerUser, updateRegistrationUser } from "../services/events";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../services/fetchers";
import {
  ButtonSize,
  ButtonType,
  type Event,
  EventRegistrationMode,
  type FoodPreference,
  InvitationStatus,
  type Registration,
  RegStatus,
  SnackTypes,
  UserSeenUpdateType,
} from "../types/types";
import Button from "./Button";
import SmallCheckIcon from "./svgs/SmallCheckIcon";
import FoodPreferenceModal from "./FoodPreferenceModal";
import FormQuestionModal from "./FormQuestionModal";
import UnregisterConfirmationModal from "./UnregisterConfirmationModal";
import styles from "../styles/JoinButton.module.scss";
import { getSafeExternalUrl } from "../utils/event";

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
  bannedText?: string;
  /* SWR mutators to revalidate after the registration changes - see
     EventActions for why these aren't typed as KeyedMutator<T>. */
  updateOnChange?: Array<() => unknown>;
  useUnregisterModal?: boolean;
  small?: boolean;
  /** Overrides `small` when set. */
  size?: ButtonSize;
  noShadow?: boolean;
}

export default function JoinButton({
  event,
  className,
  joinText = "Meld deg på arrangementet",
  joinedText = "Du er påmeldt arrangementet",
  joinWaitlistText = "Meld deg på venteliste",
  joinedWaitlistText,
  eventFinishedText = "Arrangementet er ferdig",
  countdownText = "Påmelding åpner om",
  regClosedText = "Påmeldingen er stengt",
  bannedText = "Du er utestengt fra arrangementet",
  updateOnChange,
  useUnregisterModal = false,
  small = false,
  size,
  noShadow = false,
}: JoinButtonProps) {
  const { user, loading: userLoading, reload: reloadUser } = useUser();
  const {
    data: myRegistration,
    isLoading: registrationLoading,
    mutate: updateRegistration,
  } = useSWR<Registration>(
    () =>
      user?.id && event.id
        ? `/users/${user.id}/registrations/${event.id}`
        : false,
    /* One of these mounts per card in a feed, and my own registration only
       changes through this button's mutate() - focus revalidation just
       refired every card on every app switch. */
    { revalidateOnFocus: false },
  );

  const { data: waitlistPosition } = useSWR<number>(
    () =>
      user?.id && event.id && myRegistration?.regStatus === RegStatus.WAITLISTED
        ? `/users/${user.id}/registrations/${event.id}/waitlist-position`
        : false,
    { revalidateOnFocus: false },
  );

  const { data: allergens } = useSWR<{ id: number; name: string }[]>(
    "/allergens",
    /* Reference data that changes by deploy, not by the minute. Mount
       revalidation stays on so a deploy's new allergen still arrives; only
       the refetch-per-app-switch goes. */
    { revalidateOnFocus: false },
  );

  const [foodPreferenceModalOpen, setFoodPreferenceModalOpen] = useState(false);
  const [foodPreference, setFoodPreference] = useState<FoodPreference>();
  const [formQuestionModalOpen, setFormQuestionModalOpen] = useState(false);
  const [formQuestionAnswer, setFormQuestionAnswer] = useState("");
  const [unregisterModalOpen, setUnregisterModalOpen] = useState(false);
  const [activeAllergens, setActiveAllergens] = useState<number[]>([]);
  const { addSnack } = useSnack();
  const redirectToLogin = useRedirectToLogin();
  const { countdown, isCountdown } = useRegistrationCountdown(event.regStart);

  useEffect(() => {
    if (user) {
      if (user.foodPreference) {
        setFoodPreference(user.foodPreference);
      }
      if (user.userAllergens && user.userAllergens.length > 0) {
        setActiveAllergens(user.userAllergens.map((a) => a.allergenId));
        fetchFromPeoplyApiJson(
          `/users/me/seenUpdate/${UserSeenUpdateType.HAS_SET_ALLERGENS}`,
          {
            method: "POST",
          },
        );
      }
      if (localStorage.getItem("hasSetAllergens") === "true") {
        localStorage.removeItem("hasSetAllergens");
        fetchFromPeoplyApiJson(
          `/users/me/seenUpdate/${UserSeenUpdateType.HAS_SET_ALLERGENS}`,
        ).then((res) => {
          if (!res) {
            fetchFromPeoplyApiJson(
              `/users/me/seenUpdate/${UserSeenUpdateType.HAS_SET_ALLERGENS}`,
              {
                method: "POST",
              },
            );
          }
        });
      }
    }
  }, [user]);

  const runUpdate = () => {
    updateOnChange?.forEach((mutate) => {
      mutate();
    });
  };

  const hasSeenUpdate = (update: UserSeenUpdateType) => {
    return user?.userSeenUpdates?.some((u) => u.update === update);
  };

  const userHasSeenUpdateLive = async (update: UserSeenUpdateType) => {
    return fetchFromPeoplyApiJson(`/users/me/seenUpdate/${update}`);
  };

  /* Not being registered is a normal state, not a pending one - asking SWR
     whether the request is still in flight is the only thing that separates
     the two. Deriving it from `!myRegistration && !error` meant the button
     could only stop spinning by the request *failing*. */
  const loading =
    userLoading || registrationLoading || isCountdown === undefined;

  const notLoggedIn = !user && !userLoading;

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
      return `${countdownText} ${countdown}`;
    }

    /* `goingCount` comes straight from the database. The registrations
       fallback is only for a client that loaded before the backend started
       sending it. Both may be absent on list payloads (e.g. the homescreen
       feed), so `goingCount` can legitimately be `undefined`. */
    const goingCount =
      event?.goingCount ??
      event?.registrations?.filter((r) => r.regStatus === RegStatus.GOING)
        .length;

    /* Tri-state: `false` only when we KNOW the event is full. An unknown count
       or unlimited capacity stays `undefined` so the label falls through to
       "Meld på" rather than wrongly reading "Venteliste". */
    const freeSpace =
      goingCount === undefined || !event?.capacity
        ? undefined
        : goingCount < event.capacity;

    switch (myRegistration?.regStatus) {
      case RegStatus.GOING:
        return joinedText;
      case RegStatus.NOT_GOING:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
      case RegStatus.WAITLISTED:
        return (
          joinedWaitlistText ?? `Du er nr. ${waitlistPosition} på ventelisten`
        );
      case RegStatus.INVITED:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
      case RegStatus.BANNED:
        return bannedText;
      default:
        if (freeSpace === false) {
          return joinWaitlistText;
        }
        return joinText;
    }
  })();

  const buttonDisabled = (() => {
    if (
      eventFinished ||
      isCountdown ||
      regClosed ||
      myRegistration?.regStatus === RegStatus.BANNED
    ) {
      return true;
    }

    return false;
  })();

  const buttonType = (() => {
    if (
      myRegistration?.regStatus === RegStatus.GOING ||
      myRegistration?.regStatus === RegStatus.WAITLISTED
    ) {
      return ButtonType.CONFIRMED;
    }
    return ButtonType.PRIMARY;
  })();

  const showJoinedCheck =
    !eventFinished &&
    !isCountdown &&
    !regClosed &&
    myRegistration?.regStatus === RegStatus.GOING;

  const externalUrl =
    event.registrationMode === EventRegistrationMode.EXTERNAL
      ? getSafeExternalUrl(event)
      : undefined;

  const shouldHideButton =
    (event.registrationMode === EventRegistrationMode.EXTERNAL &&
      !externalUrl) ||
    event.registrationMode === EventRegistrationMode.NONE;

  if (shouldHideButton) {
    return null;
  }

  if (externalUrl) {
    /* Cards are wrapped in a <Link>, so a nested anchor is invalid HTML -
       open the external registration page from a regular button instead. */
    return (
      <Button
        type={ButtonType.PRIMARY}
        text={joinText}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          window.open(externalUrl, "_blank", "noopener,noreferrer");
        }}
        size={size ?? (small ? ButtonSize.SMALL : ButtonSize.MEDIUM)}
        noShadow={noShadow}
      />
    );
  }

  async function createNewRegistration() {
    if (!user) {
      return;
    }

    let newRegistration: Registration | undefined;
    try {
      newRegistration = await registerUser(
        user.id,
        event.id,
        RegStatus.GOING,
        formQuestionAnswer,
      );
    } catch {
      newRegistration = undefined;
    }

    if (newRegistration) {
      updateRegistration();
      runUpdate();
      if (newRegistration.regStatus === RegStatus.GOING) {
        addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
      } else if (newRegistration.regStatus === RegStatus.WAITLISTED) {
        addSnack("Du er nå på venteliste", SnackTypes.SUCCESS);
      }
    } else {
      addSnack("En feil skjedde under påmelding", SnackTypes.ERROR);
    }
    return newRegistration;
  }

  async function registerForEvent() {
    if (user) {
      if (!regClosed && !eventFinished) {
        /* force user to update food prefs if food is served */
        const hasSeenAllergenUpdate = await userHasSeenUpdateLive(
          UserSeenUpdateType.HAS_SET_ALLERGENS,
        );

        if (event.hasFood && (!user.foodPreference || !hasSeenAllergenUpdate)) {
          return setFoodPreferenceModalOpen(true);
        }

        if (event.formQuestion) {
          return setFormQuestionModalOpen(true);
        }

        const create = await createNewRegistration();
        if (!create) {
          await updateRegistrationStatus(RegStatus.GOING);
        }
      }
    } else {
      redirectToLogin();
    }
  }

  async function updateRegistrationStatus(status: RegStatus) {
    if (user) {
      /* force user to update food prefs if food is served */
      const hasSeenAllergenUpdate = await userHasSeenUpdateLive(
        UserSeenUpdateType.HAS_SET_ALLERGENS,
      );

      if (
        status === RegStatus.GOING &&
        event.hasFood &&
        (!user.foodPreference || !hasSeenAllergenUpdate)
      ) {
        return setFoodPreferenceModalOpen(true);
      }

      if (status === RegStatus.GOING && event.formQuestion) {
        return setFormQuestionModalOpen(true); // flow is resumed in answerFormQuestion()
      }

      let success: Registration | undefined;
      try {
        success = (await updateRegistrationUser(
          user.id,
          event.id,
          status,
        )) as Registration;
      } catch {
        /* Falls through to the error snack below; `success` stays undefined. */
      }
      if (success) {
        updateRegistration();
        runUpdate();
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

  /* called when answer to form question is submitted (Not very DRY code...) */
  async function answerFormQuestion() {
    if (!user) {
      return;
    }

    /* assume food has already been set here */
    switch (myRegistration?.regStatus) {
      case RegStatus.NOT_GOING: {
        let success: Registration | undefined;
        try {
          success = (await updateRegistrationUser(
            user.id,
            event.id,
            RegStatus.GOING,
            formQuestionAnswer,
          )) as Registration;
        } catch {
          /* Falls through to the error snack below. */
        }
        if (success) {
          updateRegistration();
          runUpdate();
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
        break;
      }
      case RegStatus.INVITED:
        try {
          await fetchFromPeoplyApi(`/events/${event?.id}/invitations`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify({
              status: InvitationStatus.ACCEPTED,
              formAnswer: formQuestionAnswer,
            }),
          });
          updateRegistration();
          runUpdate();
          addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
        } catch {
          addSnack("Noe gikk galt", SnackTypes.ERROR);
        }
        break;
      default:
        createNewRegistration();
    }
  }

  async function acceptInvitation() {
    /* force user to update food prefs if food is served */
    const hasSeenAllergenUpdate = await userHasSeenUpdateLive(
      UserSeenUpdateType.HAS_SET_ALLERGENS,
    );

    if (event.hasFood && (!user?.foodPreference || !hasSeenAllergenUpdate)) {
      return setFoodPreferenceModalOpen(true);
    }

    if (event.formQuestion) {
      return setFormQuestionModalOpen(true);
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
      runUpdate();
      addSnack("Du er nå meldt på arrangementet", SnackTypes.SUCCESS);
    } catch {
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

  const changeFoodPreference = async (foodPreference?: FoodPreference) => {
    if (foodPreference === undefined) {
      return;
    }
    setFoodPreference(foodPreference);
    await fetchFromPeoplyApi("/users/me", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        foodPreference,
      }),
    });
    reloadUser();
  };

  return (
    <>
      {foodPreferenceModalOpen && (
        <FoodPreferenceModal
          foodPreference={foodPreference}
          onFoodPreferenceChange={changeFoodPreference}
          allergens={allergens}
          showAllergenInput={
            !hasSeenUpdate(UserSeenUpdateType.HAS_SET_ALLERGENS)
          }
          activeAllergens={activeAllergens}
          onToggleAllergen={(id) =>
            setActiveAllergens((prev) => {
              if (activeAllergens.includes(id)) {
                return prev.filter((allergen) => allergen !== id);
              }
              return [...prev, id];
            })
          }
          saveDisabled={user?.foodPreference === null}
          onSave={async () => {
            if (!hasSeenUpdate(UserSeenUpdateType.HAS_SET_ALLERGENS)) {
              await fetchFromPeoplyApi("/users/me", {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({
                  allergens: activeAllergens,
                }),
              });
              await fetchFromPeoplyApiJson(
                `/users/me/seenUpdate/${UserSeenUpdateType.HAS_SET_ALLERGENS}`,
                {
                  method: "POST",
                },
              );
            }
            reloadUser();
            await registerForEvent();
            setFoodPreferenceModalOpen(false);
          }}
          onClose={() => setFoodPreferenceModalOpen(false)}
        />
      )}
      {formQuestionModalOpen && (
        <FormQuestionModal
          formAnswer={formQuestionAnswer}
          formQuestion={event.formQuestion ?? ""}
          setFormAnswer={setFormQuestionAnswer}
          setModalOpen={setFormQuestionModalOpen}
          onSubmit={answerFormQuestion}
        />
      )}
      {useUnregisterModal && unregisterModalOpen && (
        <UnregisterConfirmationModal
          eventTitle={event.title}
          onConfirm={() => {
            updateRegistrationStatus(RegStatus.NOT_GOING);
            setUnregisterModalOpen(false);
          }}
          onClose={() => setUnregisterModalOpen(false)}
        />
      )}
      <Button
        type={buttonType}
        text={buttonText}
        icon={
          showJoinedCheck ? (
            <SmallCheckIcon className={styles.joinedIcon} />
          ) : undefined
        }
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (buttonFunction) buttonFunction();
        }}
        loading={notLoggedIn ? false : loading}
        disabled={buttonDisabled}
        size={size ?? (small ? ButtonSize.SMALL : ButtonSize.MEDIUM)}
        noShadow={noShadow}
      />
    </>
  );
}
