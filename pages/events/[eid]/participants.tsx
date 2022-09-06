import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import HeadComponent from "../../../components/HeadComponent";
import MemberCard from "../../../components/MemberCard";
import SearchField from "../../../components/SearchField";
import MailIcon from "../../../components/svgs/MailIcon";
import UserCheck from "../../../components/svgs/UserCheck";
import UserCross from "../../../components/svgs/UserCross";
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
  InvitationStatus,
  User,
} from "../../../types/types";
import {
  calculateEditDistance,
  formatDateRange,
} from "../../../utils/functions";
import { getFormattedName } from "../../../utils/user";

enum TabOption {
  PARTICIPANTS = "PARTICIPANTS",
  INVITATIONS = "INVITATIONS",
  NOT_GOING = "NOT_GOING",
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
  const { data: event, error: eventError } = useSWR<Event>(
    () => (eid ? `/events/${eid}` : false),
    fetchFromPeoplyApiJson,
  );

  const { data: registrations, error: registrationsError } = useSWR<
    Registration[]
  >(
    () =>
      event?.id ? `/events/${event.id}/registrations?includeUsers=true` : false,
    fetchFromPeoplyApiJson,
  );

  const { data: invitations, error: invitationsError } = useSWR<
    EventInvitation[]
  >(
    () => (event?.id ? `/events/${event.id}/invitations` : false),
    fetchFromPeoplyApiJson,
  );

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
      case TabOption.INVITATIONS:
        return "Invitasjoner";
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

        const filteredGoing = going
          .filter((registration) => searchFilter(registration.user))
          .sort((regA, regB) => sortByEditDistance(regA.user, regB.user));

        return (
          <>
            {going.length > 0 && (
              <div className={styles.searchContainer}>
                <SearchField
                  search={search}
                  loading={false}
                  setSearch={setSearch}
                />
              </div>
            )}
            {filteredGoing.map((registration) => (
              <MemberCard
                key={registration.userId}
                user={registration.user}
                description={`Meldte seg på ${formatDateRange(
                  new Date(registration.updatedAt),
                )}`}
                link={`/users/${registration.userId}`}
              />
            ))}
          </>
        );

      case TabOption.INVITATIONS:
        const pending = invitations?.filter(
          (invitation) =>
            invitation.invitationStatus === InvitationStatus.PENDING,
        );

        if (!pending?.length) {
          return (
            <p className={styles.notFound}>Ingen invitasjoner er avventende</p>
          );
        }

        const filteredPending = pending
          .filter(
            (invitation) =>
              invitation.toUser && searchFilter(invitation.toUser),
          )
          .sort((invA, invB) => sortByEditDistance(invA.toUser, invB.toUser));

        return (
          <>
            {pending.length && (
              <div className={styles.searchContainer}>
                <SearchField
                  search={search}
                  loading={false}
                  setSearch={setSearch}
                />
              </div>
            )}
            {filteredPending?.map(
              (invitation) =>
                invitation.toUser && (
                  <MemberCard
                    key={invitation.id}
                    user={invitation.toUser}
                    description={`Invitert av ${
                      invitation.fromUser?.firstName
                    } ${invitation.fromUser?.lastName} ${formatDateRange(
                      new Date(invitation.createdAt),
                    )}`}
                    link={`/users/${invitation.toUser?.id}`}
                  />
                ),
            )}
          </>
        );

      case TabOption.NOT_GOING:
        const notGoing = registrations?.filter(
          (registration) => registration.regStatus === RegStatus.NOT_GOING,
        );

        if (!notGoing?.length) {
          return (
            <p className={styles.notFound}>
              Ingen deltakere har meldt seg på enda
            </p>
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
                description={`Meldte seg av ${formatDateRange(
                  new Date(registration.updatedAt),
                )}`}
                link={`/users/${registration.userId}`}
              />
            ))}
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
              label: convertTabOptionToLabel(TabOption.INVITATIONS),
              value: TabOption.INVITATIONS,
              icon: <MailIcon />,
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
