import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import ExpandableCard from "../../../components/ExpandableCard";
import FoodPreferenceDisplay from "../../../components/FoodPreferenceDisplay";
import HeadComponent from "../../../components/HeadComponent";
import MemberCard from "../../../components/MemberCard";
import Modal from "../../../components/Modal";
import ModalButton from "../../../components/ModalButton";
import SearchField from "../../../components/SearchField";
import ExitIcon from "../../../components/svgs/ExitIcon";
import UserCheck from "../../../components/svgs/UserCheck";
import UserCross from "../../../components/svgs/UserCross";
import WaitlistIcon from "../../../components/svgs/WaitlistIcon";
import TabSelection from "../../../components/TabSelection";
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import { fetchFromPeoplyApiJson } from "../../../services/fetchers";

import styles from "../../../styles/Participants.module.scss";
import {
  Registration,
  SnackTypes,
  Event,
  RegStatus,
  EventInvitation,
  User,
  FoodPreference,
  ButtonType,
} from "../../../types/types";
import {
  calculateEditDistance,
  formatDateRange,
} from "../../../utils/functions";
import { getFormattedName } from "../../../utils/user";

enum TabOption {
  PARTICIPANTS = "PARTICIPANTS",
  NOT_GOING = "NOT_GOING",
  WAITLIST = "WAITLIST",
}

const Participants = () => {
  const goBack = useBack();
  const router = useRouter();
  const { addSnack } = useSnack();
  const { eid } = router.query;
  const [search, setSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabOption>(
    TabOption.PARTICIPANTS,
  );
  const [banUserId, setBanUserId] = useState<string | undefined>(undefined);
  const [unBanUserId, setUnBanUserId] = useState<string | undefined>(undefined);

  const { data: event, error: eventError } = useSWR<Event>(() =>
    eid ? `/events/${eid}` : false,
  );

  const {
    data: registrations,
    error: registrationsError,
    mutate: mutateRegistrations,
  } = useSWR<Registration[]>(() =>
    event?.id
      ? `/events/${event.id}/registrations?includeUsers=true&take=1000`
      : false,
  );

  const { data: invitations, error: invitationsError } = useSWR<
    EventInvitation[]
  >(() => (event?.id ? `/events/${event.id}/invitations` : false));

  if (registrationsError || eventError || invitationsError) {
    addSnack("Kunne ikke laste inn data for arrangementet.", SnackTypes.ERROR);
    router.push(`/events/${eid}`);
  }

  if (!registrations || !event) {
    return <></>;
  }

  function convertTabOptionToLabel(tabOption: TabOption): string {
    switch (tabOption) {
      case TabOption.PARTICIPANTS:
        return "Deltakere";
      case TabOption.WAITLIST:
        return "Venteliste";
      case TabOption.NOT_GOING:
        return "Kommer ikke";
    }
  }

  /* filter results based on search term */
  function searchFilter(user: User) {
    if (!search.trim().length) {
      return true;
    }

    const searchTokens = search.trim().toLowerCase().split(" ");
    const firstNameTokens = user.firstName.toLowerCase().split(" ");

    const editDistanceLastName = calculateEditDistance(
      user.lastName.toLowerCase(),
      searchTokens[searchTokens.length - 1],
    );

    /* if all search tokens matches on of the first name tokens */
    if (
      searchTokens.every((token) =>
        firstNameTokens.some(
          (firstNameToken) =>
            calculateEditDistance(firstNameToken, token) <= 2 ||
            firstNameToken.startsWith(token),
        ),
      )
    ) {
      return true;
    }

    /* if there are multiple search words for the first name, make sure all are matches */
    if (
      firstNameTokens
        .slice(0, searchTokens.length)
        .every((token) =>
          searchTokens.some(
            (searchToken) =>
              calculateEditDistance(searchToken, token) <= 2 ||
              token.startsWith(searchToken),
          ),
        )
    ) {
      return true;
    }

    if (
      editDistanceLastName <= 2 ||
      user.lastName
        .toLocaleLowerCase()
        .startsWith(searchTokens[searchTokens.length - 1])
    ) {
      return true;
    }

    return getFormattedName(user).toLowerCase().includes(search.toLowerCase());
  }

  function sortByEditDistance(userA?: User, userB?: User) {
    if (!userA || !userB) {
      return 0;
    }

    return (
      calculateEditDistance(getFormattedName(userA), search) -
      calculateEditDistance(getFormattedName(userB), search)
    );
  }

  async function banUser() {
    try {
      if (event) {
        await fetchFromPeoplyApiJson(
          `/events/${event.id}/registrations/${banUserId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              eventId: event.id,
              regStatus: RegStatus.BANNED,
            }),
            headers: { "Content-Type": "application/json; charset=utf-8" },
          },
        );
        addSnack("Brukeren ble utestengt", SnackTypes.SUCCESS);
        mutateRegistrations();
      }
    } catch (e) {
      addSnack(
        "Det skjedde en feil under utestenging av bruker",
        SnackTypes.ERROR,
      );
    }
    setBanUserId(undefined);
  }

  async function unBanUser() {
    try {
      await fetchFromPeoplyApiJson(
        `/events/${event?.id}/registrations/${unBanUserId}`,
        {
          method: "DELETE",
        },
      );
      addSnack("Fjernet utestenging", SnackTypes.SUCCESS);
      mutateRegistrations();
    } catch (e) {
      addSnack(
        "Det skjedde en feil under fjerning av utestenging",
        SnackTypes.ERROR,
      );
    }
    setUnBanUserId(undefined);
  }

  async function unregisterUser() {
    try {
      if (event) {
        await fetchFromPeoplyApiJson(
          `/events/${event.id}/registrations/${banUserId}`,
          {
            method: "PATCH",
            body: JSON.stringify({
              eventId: event.id,
              regStatus: RegStatus.NOT_GOING,
            }),
            headers: { "Content-Type": "application/json; charset=utf-8" },
          },
        );
        addSnack("Brukeren ble meldt av arrangementet", SnackTypes.SUCCESS);
        mutateRegistrations();
      }
    } catch (e) {
      addSnack(
        "Det skjedde en feil under avregistrering av bruker",
        SnackTypes.ERROR,
      );
    }
    setBanUserId(undefined);
  }

  function renderBanModal() {
    return (
      <Modal
        label="Fjern bruker"
        description="Er du sikker på at du vil fjerne brukeren fra dette arrangementet?

        Avmeldte brukere kan melde seg på igjen.
        Utestengte brukere kan ikke melde seg på arrangementet igjen, men utestengingen kan fjernes under 'kommer ikke' fanen.
        "
        closeButtonOnClick={() => setBanUserId(undefined)}
      >
        <>
          <ModalButton
            text="Meld av"
            onClick={unregisterUser}
            type={ButtonType.WARNINGSOFT}
            noShadow
          />
          <ModalButton
            text="Utesteng"
            onClick={banUser}
            type={ButtonType.DANGERSOFT}
            noShadow
          />
          <ModalButton
            text="Avbryt"
            onClick={() => setBanUserId(undefined)}
            type={ButtonType.SECONDARY}
            noShadow
          />
        </>
      </Modal>
    );
  }

  function renderTab(tab: TabOption) {
    switch (tab) {
      case TabOption.PARTICIPANTS:
        const going = registrations?.filter(
          (registration) => registration.regStatus === RegStatus.GOING,
        );

        if (!going?.length) {
          return (
            <p className={styles.notFound}>
              Ingen deltakere har meldt seg på enda
            </p>
          );
        }

        const foodPreferenceMap: Map<
          FoodPreference,
          Map<string, number>
        > = going.reduce((map, { user }) => {
          if (user.foodPreference) {
            if (!map.has(user.foodPreference)) {
              map.set(user.foodPreference, new Map<string, number>());
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const mapKey = user
              .userAllergens!.sort((a, b) => a.allergenId - b.allergenId)
              .map((a) => a.allergen.name)
              .join(", ");

            if (map.get(user.foodPreference)?.has(mapKey)) {
              map.get(user.foodPreference)?.set(
                mapKey,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                map.get(user.foodPreference)!.get(mapKey)! + 1,
              );
            } else {
              map.get(user.foodPreference)?.set(mapKey, 1);
            }
          }
          return map;
        }, new Map<FoodPreference, Map<string, number>>());

        const filteredGoing = going
          .filter((registration) => searchFilter(registration.user))
          .sort((regA, regB) => sortByEditDistance(regA.user, regB.user));

        return (
          <>
            {going.length > 0 && (
              <>
                {event?.hasFood && (
                  <ExpandableCard
                    title="Matpreferanser"
                    className={styles.foodPreferenceDisplay}
                  >
                    <FoodPreferenceDisplay
                      foodPreferenceMap={foodPreferenceMap}
                    />
                  </ExpandableCard>
                )}
                {event?.formQuestion && (
                  <ExpandableCard
                    title="Spørsmål til deltakere"
                    className={styles.formQuestionDisplay}
                  >
                    {event.formQuestion.split("\n").map((str) => (
                      <p key={str}>
                        {str}
                        <br></br>
                      </p>
                    ))}
                  </ExpandableCard>
                )}
                <div className={styles.searchContainer}>
                  <SearchField
                    search={search}
                    loading={false}
                    setSearch={setSearch}
                  />
                </div>
              </>
            )}
            {filteredGoing.map((registration) => (
              <MemberCard
                key={registration.userId}
                user={registration.user}
                description={`Meldte seg på ${formatDateRange(
                  new Date(registration.updatedAt),
                )}`}
                icon={<ExitIcon />}
                iconOnClick={() => setBanUserId(registration.userId)}
                comment={registration.formAnswer}
              />
            ))}
            {banUserId && renderBanModal()}
          </>
        );

      case TabOption.WAITLIST:
        const waitlisted = registrations?.filter(
          ({ regStatus }) => regStatus === RegStatus.WAITLISTED,
        );

        if (!waitlisted?.length) {
          return <p className={styles.notFound}>Ventelisten er tom</p>;
        }

        const filteredWaitlisted = waitlisted
          .filter((registration) => searchFilter(registration.user))
          .sort((regA, regB) => sortByEditDistance(regA.user, regB.user))
          .sort(
            (regA, regB) =>
              new Date(regA.updatedAt).getTime() -
              new Date(regB.updatedAt).getTime(),
          );

        return (
          <>
            {event?.formQuestion && (
              <ExpandableCard
                title="Spørsmål til deltakere"
                className={styles.formQuestionDisplay}
              >
                {event.formQuestion.split("\n").map((str) => (
                  <p key={str}>
                    {str}
                    <br></br>
                  </p>
                ))}
              </ExpandableCard>
            )}
            {waitlisted.length && (
              <div className={styles.searchContainer}>
                <SearchField
                  search={search}
                  loading={false}
                  setSearch={setSearch}
                />
              </div>
            )}
            {filteredWaitlisted?.map((registration) => (
              <MemberCard
                key={registration.userId}
                user={registration.user}
                description={`Meldte seg på ${formatDateRange(
                  new Date(registration.updatedAt),
                )}`}
                icon={<ExitIcon />}
                iconOnClick={() => setBanUserId(registration.userId)}
                comment={registration.formAnswer}
              />
            ))}
            {banUserId && renderBanModal()}
          </>
        );

      case TabOption.NOT_GOING:
        const notGoing = registrations?.filter(
          (registration) =>
            registration.regStatus === RegStatus.NOT_GOING ||
            registration.regStatus === RegStatus.BANNED,
        );

        if (!notGoing?.length) {
          return (
            <p className={styles.notFound}>Ingen deltakere har meldt seg av</p>
          );
        }

        const filteredNotGoing = notGoing
          .filter((registration) => searchFilter(registration.user))
          .sort((regA, regB) => sortByEditDistance(regA.user, regB.user));

        return (
          <>
            {notGoing.length && (
              <div className={styles.searchContainer}>
                <SearchField
                  search={search}
                  loading={false}
                  setSearch={setSearch}
                />
              </div>
            )}
            {filteredNotGoing.map((registration) => (
              <MemberCard
                key={registration.userId}
                user={registration.user}
                description={
                  registration.regStatus === RegStatus.BANNED
                    ? "Utestengt"
                    : `Meldte seg av ${formatDateRange(
                        new Date(registration.updatedAt),
                      )}`
                }
                icon={
                  registration.regStatus === RegStatus.BANNED ? (
                    <button
                      className={styles.unbanButton}
                      onClick={() => setUnBanUserId(registration.userId)}
                    >
                      {"fjern utestenging"}
                    </button>
                  ) : (
                    <></>
                  )
                }
              />
            ))}
            {unBanUserId && (
              <>
                <Modal
                  label="Fjern utestenging"
                  description="Er du sikker på at du vil fjerne utestengingen av brukeren?"
                  closeButtonOnClick={() => setUnBanUserId(undefined)}
                >
                  <>
                    <ModalButton
                      text={"Fjern utestenging"}
                      type={ButtonType.DANGER}
                      onClick={unBanUser}
                    />
                    <ModalButton
                      text={"avbryt"}
                      onClick={() => setUnBanUserId(undefined)}
                      type={ButtonType.SECONDARY}
                    />
                  </>
                </Modal>
              </>
            )}
          </>
        );
    }
  }

  return (
    <>
      <HeadComponent
        title={`Deltakere - ${event.title}`}
        description="Inviter medlemmer til din organisasjon"
      />
      <div className={styles.container}>
        <BackButton className={styles.backButton} onClick={goBack} />
        <div className={styles.header}>
          <h1>Deltakere</h1>
          <p>Se invitasjoner og deltakere for {event.title}</p>
        </div>
        <TabSelection
          selected={selectedTab}
          setSelected={setSelectedTab}
          options={[
            {
              label: convertTabOptionToLabel(TabOption.PARTICIPANTS),
              value: TabOption.PARTICIPANTS,
              icon: <UserCheck />,
            },
            {
              label: convertTabOptionToLabel(TabOption.WAITLIST),
              value: TabOption.WAITLIST,
              icon: (
                <WaitlistIcon
                  amount={
                    registrations?.filter(
                      ({ regStatus }) => regStatus === RegStatus.WAITLISTED,
                    ).length
                  }
                />
              ),
            },
            {
              label: convertTabOptionToLabel(TabOption.NOT_GOING),
              value: TabOption.NOT_GOING,
              icon: <UserCross />,
            },
          ]}
        />
        <div className={styles.content}>{renderTab(selectedTab)}</div>
      </div>
    </>
  );
};

export default Participants;
