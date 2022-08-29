import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import HeadComponent from "../../../components/HeadComponent";
import MemberCard from "../../../components/MemberCard";
import MailIcon from "../../../components/svgs/MailIcon";
import UserCheck from "../../../components/svgs/UserCheck";
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
} from "../../../types/types";
import { formatDateRange } from "../../../utils/functions";

enum TabOption {
  PARTICIPANTS = "PARTICIPANTS",
  INVITATIONS = "INVITATIONS",
}

const Participants = () => {
  const goBack = useBack();
  const router = useRouter();
  const { addSnack } = useSnack();
  const { eid } = router.query;
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
    }
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

        return registrations
          ?.filter((registration) => registration.regStatus === RegStatus.GOING)
          .map((registration) => (
            <MemberCard
              key={registration.userId}
              user={registration.user}
              description={`Meldte seg på ${formatDateRange(
                new Date(registration.createdAt),
              )}`}
              link={`/users/${registration.userId}`}
            />
          ));

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

        return pending?.map(
          (invitation) =>
            invitation.toUser && (
              <MemberCard
                key={invitation.id}
                user={invitation.toUser}
                description={`Invitert av ${invitation.fromUser?.firstName} ${
                  invitation.fromUser?.lastName
                } ${formatDateRange(new Date(invitation.createdAt))}`}
                link={`/users/${invitation.toUser?.id}`}
              />
            ),
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
          ]}
        />
        <div className={styles.content}>{renderTab(selectedTab)}</div>
      </div>
    </>
  );
};

export default Participants;
