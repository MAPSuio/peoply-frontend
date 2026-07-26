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
  ButtonSize,
  ButtonType,
  Event,
  EventRegistrationMode,
  FoodPreference,
  InvitationStatus,
  Registration,
  RegStatus,
  SnackTypes,
  UserSeenUpdateType,
} from "../types/types";
import Button from "./Button";
import Dropdown from "./Dropdown";
import SmallCheckIcon from "./svgs/SmallCheckIcon";
import FormQuestionModal from "./FormQuestionModal";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import styles from "../styles/JoinButton.module.scss";
import CategoryInput from "./inputs/CategoryInput";

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
  updateOnChange?: KeyedMutator<any>[];
  useUnregisterModal?: boolean;
  small?: boolean;
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
  noShadow = false,
}: JoinButtonProps) {
  const { user, loading: userLoading, reload: reloadUser } = useUser();
  const {
    data: myRegistration,
    isLoading: registrationLoading,
    mutate: updateRegistration,
  } = useSWR<Registration>(() =>
    user?.id && event.id
      ? `/users/${user.id}/registrations/${event.id}`
      : false,
  );

  const { data: waitlistPosition } = useSWR<number>(() =>
    user?.id && event.id && myRegistration?.regStatus === RegStatus.WAITLISTED
      ? `/users/${user.id}/registrations/${event.id}/waitlist-position`
      : false,
  );

  const { data: allergens } =
    useSWR<{ id: number; name: string }[]>("/allergens");

  const [countdown, setCountdown] = useState<string>();
  const [foodPreferenceModalOpen, setFoodPreferenceModalOpen] = useState(false);
  const [foodPreference, setFoodPreference] = useState<FoodPreference>();
  const [formQuestionModalOpen, setFormQuestionModalOpen] = useState(false);
  const [formQuestionAnswer, setFormQuestionAnswer] = useState("");
  const [unregisterModalOpen, setUnregisterModalOpen] = useState(false);
  const [isCountdown, setIsCountdown] = useState<boolean>();
  const [activeAllergens, setActiveAllergens] = useState<number[]>([]);
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
    updateOnChange?.forEach((mutate) => mutate());
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

  const shouldHideButton =
    event.registrationMode === EventRegistrationMode.EXTERNAL ||
    event.registrationMode === EventRegistrationMode.NONE;

  if (shouldHideButton) {
    return null;
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

      let success = undefined;
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
      case RegStatus.NOT_GOING:
        let success = undefined;
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
        <Modal
          label={`Arrangementet har matservering`}
          description="For å melde deg på arrangementet må du fylle ut matpreferanser på profilen din. Dette kan endres på profilen din senere."
          closeButtonOnClick={() => setFoodPreferenceModalOpen(false)}
        >
          <div className={styles.modal}>
            <Dropdown
              className={styles.foodPreferenceDropdown}
              options={[
                {
                  value: undefined,
                  label: "Velg matpreferanse",
                  isDefault: foodPreference !== undefined,
                },
                {
                  value: FoodPreference.NO_PREFERENCE,
                  label: "Ingen preferanse",
                },
                { value: FoodPreference.VEGETARIAN, label: "Vegetar" },
                { value: FoodPreference.VEGAN, label: "Veganer" },
                { value: FoodPreference.PESCETARIAN, label: "Pescetar" },
              ]}
              setValue={changeFoodPreference}
              value={foodPreference}
              label="Matpreferanse"
              inputId="food-preference"
            />
            {!hasSeenUpdate(UserSeenUpdateType.HAS_SET_ALLERGENS) &&
              allergens && (
                <CategoryInput
                  title="Allergen(er)"
                  activeCategories={activeAllergens}
                  onClick={(id: number) =>
                    setActiveAllergens((prev) => {
                      if (activeAllergens.includes(id)) {
                        return prev.filter((allergen) => allergen !== id);
                      }
                      return [...prev, id];
                    })
                  }
                  categories={allergens}
                  errorMessage=""
                />
              )}
            <ModalButton
              text="Lagre"
              onClick={async () => {
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
              disabled={user?.foodPreference === null}
            />
            <ModalButton
              text="Lukk"
              onClick={() => setFoodPreferenceModalOpen(false)}
              type={ButtonType.SECONDARY}
            />
          </div>
        </Modal>
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
        <Modal
          label="Meld deg av arrangementet"
          description={`Er du sikker på at du vil melde deg av ${event.title}?`}
          closeButtonOnClick={() => setUnregisterModalOpen(false)}
        >
          <>
            <ModalButton
              text="Meld deg av"
              onClick={() => {
                updateRegistrationStatus(RegStatus.NOT_GOING);
                setUnregisterModalOpen(false);
              }}
              type={ButtonType.DANGER}
            />
            <ModalButton
              text="Forbli påmeldt"
              onClick={() => setUnregisterModalOpen(false)}
              type={ButtonType.SECONDARY}
            />
          </>
        </Modal>
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
        size={small ? ButtonSize.SMALL : ButtonSize.MEDIUM}
        noShadow={noShadow}
      />
    </>
  );
}
