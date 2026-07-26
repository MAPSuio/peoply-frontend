import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import BackButton from "../../../components/BackButton";
import Button from "../../../components/Button";
import Dropdown from "../../../components/Dropdown";
import ExpandableCard from "../../../components/ExpandableCard";
import HeadComponent from "../../../components/HeadComponent";
import CloseIcon from "../../../components/svgs/CloseIcon";
import PlusIcon from "../../../components/svgs/PlusIcon";
import UserSelect from "../../../components/UserSelect";
import useBack from "../../../hooks/useBack";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useSnack from "../../../hooks/useSnack";
import useUser from "../../../hooks/useUser";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";
import styles from "../../../styles/InviteMembersToOrg.module.scss";
import {
  SnackTypes,
  type User,
  type Event,
  OrganizationRole,
  ButtonType,
  ButtonSize,
} from "../../../types/types";
import { getOrganizationRolePrivilege } from "../../../utils/functions";

export default function InviteUsersToEvent() {
  const goBack = useBack();
  const { user, loading, orgs } = useUser();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { addSnack } = useSnack();
  const router = useRouter();
  const { eid } = router.query;
  const { data: event, error: eventError } = useSWR<Event>(() =>
    eid ? `/events/${eid}` : false,
  );
  const redirectToLogin = useRedirectToLogin();
  const [orgArrangerId, setOrgArrangerId] = useState<string | undefined>(
    undefined,
  );

  const validArrangersOptions = (() => {
    if (!user) return [];
    const validArrangers = orgs?.filter((org) => {
      const userRoleInOrganization = org.organizationRoles.find((userRole) => {
        return (
          userRole.userId === user?.id &&
          getOrganizationRolePrivilege(userRole.role) >
            getOrganizationRolePrivilege(OrganizationRole.MEMBER)
        );
      });
      return userRoleInOrganization !== undefined;
    });

    const orgOptions = validArrangers?.map((org) => ({
      label: org.name,
      value: org.arrangerId,
    }));
    return orgOptions ? [...orgOptions] : [];
  })();

  // set initial value of orgArrangerId
  useEffect(() => {
    if (validArrangersOptions.length > 0 && !orgArrangerId) {
      setOrgArrangerId(validArrangersOptions[0].value);
    }
  }, [validArrangersOptions, orgArrangerId]);

  const onUserSelect = (user: User) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const onUserRemove = (user: User) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
  };

  async function inviteOrgMembers() {
    if (!event || !user || !orgArrangerId) return;

    const org = orgs?.find((org) => org.arrangerId === orgArrangerId);
    const members = await fetchFromPeoplyApiJson(
      `/organizations/${org?.id}/members`,
    );

    const memberUsers: User[] = [];
    members.forEach((member: { user: User }) => {
      //if member already selected or the user itself, don't add
      if (
        !selectedUsers.find((selected) => selected.id === member.user.id) &&
        member.user.id !== user.id
      ) {
        memberUsers.push(member.user);
      }
    });

    setSelectedUsers([...selectedUsers, ...memberUsers]);
  }

  if (loading) {
    return <></>;
  }

  if (eventError) {
    addSnack("Kunne ikke hente arrangementet", SnackTypes.ERROR);
    router.push(`/events/${eid}`);
  }

  const onSubmit = async () => {
    if (selectedUsers.length) {
      const invitations: string[] = selectedUsers.map(({ id }) => id);

      try {
        await fetchFromPeoplyApi(`/events/${event?.id}/invitations`, {
          method: "POST",
          body: JSON.stringify(invitations),
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
        addSnack("Invitasjoner sendt!", SnackTypes.SUCCESS);
      } catch {
        addSnack("Noe gikk galt", SnackTypes.ERROR);
      }
      goBack();
    }
  };

  if (!user) {
    redirectToLogin();
    return <></>;
  }

  if (user && event) {
    return (
      <>
        <HeadComponent
          title={`${event.title} - Inviter`}
          description="Inviter brukere til arrangementet"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.contentContainer}>
            <div className={styles.header}>
              <h1>Inviter brukere</h1>
              <p>
                Inviter andre til å bli med på <span>{event.title}</span>
              </p>
            </div>
            {validArrangersOptions.length >= 1 && (
              <ExpandableCard title={"Inviter medlemmer fra din organisasjon"}>
                <div className={styles.inviteOrgContainer}>
                  <Dropdown
                    options={validArrangersOptions}
                    value={orgArrangerId}
                    inputId="arrangerInput"
                    className={styles.arrangerInput}
                    setValue={setOrgArrangerId}
                    card
                  />

                  <Button
                    icon={<PlusIcon className={styles.addIcon} />}
                    size={ButtonSize.TINY}
                    type={ButtonType.PRIMARY}
                    text={""}
                    onClick={inviteOrgMembers}
                  ></Button>
                </div>
              </ExpandableCard>
            )}
            <div className={styles.selected}>
              {selectedUsers.length !== 0 && <p>Valgte brukere: </p>}
              {selectedUsers.map((user) => (
                <button
                  type="button"
                  className={styles.selectedUser}
                  key={user.id}
                  onClick={() => onUserRemove(user)}
                >
                  {`${user.firstName.slice(0, 1).toUpperCase()}. ${
                    user.lastName
                  }`}
                  <CloseIcon className={styles.closeIcon} />
                </button>
              ))}
            </div>
            <UserSelect
              selectedUsers={selectedUsers}
              onUserRemove={onUserRemove}
              onUserSelect={onUserSelect}
            />
          </div>
          {selectedUsers.length !== 0 && (
            <Button
              className={styles.primaryButton}
              text="Send invitasjoner"
              onClick={onSubmit}
            />
          )}
        </div>
      </>
    );
  }
  return <></>;
}
