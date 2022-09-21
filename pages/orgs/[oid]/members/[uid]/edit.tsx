import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Avatar from "../../../../../components/Avatar";
import BackButton from "../../../../../components/BackButton";
import Button from "../../../../../components/Button";
import Dropdown from "../../../../../components/Dropdown";
import HeadComponent from "../../../../../components/HeadComponent";
import TextInput from "../../../../../components/inputs/TextInput";
import Modal from "../../../../../components/Modal";
import SettingsButton from "../../../../../components/SettingsButton";
import useBack from "../../../../../hooks/useBack";
import useOrganization from "../../../../../hooks/useOrganization";
import useSnack from "../../../../../hooks/useSnack";
import useUser from "../../../../../hooks/useUser";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../../../services/fetchers";
import styles from "../../../../../styles/EditOrganizationUser.module.scss";
import {
  OrganizationRole,
  SettingTypes,
  SnackTypes,
  UserOrganizationRoles,
} from "../../../../../types/types";
import { getOrganizationRolePrivilege } from "../../../../../utils/functions";

export default function EditOrganizationUser() {
  const goBack = useBack();
  const { user, loading } = useUser();
  const { addSnack } = useSnack();
  const router = useRouter();
  const { oid, uid } = router.query;
  const [roleDescription, setRoleDescription] = useState("");
  const [roleValue, setRoleValue] = useState<OrganizationRole>();
  const [modalOpen, setModalOpen] = useState(false);
  const {
    organization,
    organizationUsers,
    isAdminOrOwner,
    isOwner,
    isAdmin,
    loading: loadingOrganization,
    error: organizationError,
    organizationUser,
  } = useOrganization(oid as string);

  /* fill form with data from the user to be edited */
  useEffect(() => {
    if (organizationUsers) {
      const userToEdit = organizationUsers.find((u) => u.user.id === uid);

      if (userToEdit?.role) {
        setRoleValue(userToEdit.role);
      }

      if (userToEdit?.roleDescription) {
        setRoleDescription(userToEdit.roleDescription);
      }
    }
  }, [organizationUsers, user, uid]);

  if (loading || loadingOrganization) {
    return <></>;
  }

  if (organizationError) {
    addSnack("Noe gikk galt", SnackTypes.ERROR);
    router.push(`/orgs/${oid}/members`);
  }

  const userToEdit = organizationUsers?.find((user) => user.userId === uid);
  const isEditingSelf = user?.id === userToEdit?.userId;
  const canEdit = isAdminOrOwner || isEditingSelf;

  if (!canEdit) {
    addSnack("Du har ikke rettigheter til dette", SnackTypes.ERROR);
    router.push(`/orgs/${oid}/members`);
  }

  if (!userToEdit) {
    addSnack(
      "Denne brukeren er ikke medlem i organisasjonen",
      SnackTypes.ERROR,
    );
    router.push(`/orgs/${oid}/members`);
  }

  /* the edit is valid if the description or role has changed */
  const validEdit = (() => {
    if (isEditingSelf && userToEdit?.roleDescription !== roleDescription) {
      return true;
    } else if (userToEdit?.role !== roleValue) {
      return true;
    }
    return false;
  })();

  const deleteUser = async (uid: string) => {
    try {
      await fetchFromPeoplyApi(`/organizations/${oid}/members/${uid}`, {
        method: "DELETE",
      });
      addSnack("Medlem fjernet", SnackTypes.SUCCESS);
      router.back();
    } catch (e) {
      addSnack("Noe gikk galt", SnackTypes.ERROR);
    }
  };

  async function handleConfirm() {
    try {
      if (isEditingSelf && userToEdit?.roleDescription !== roleDescription) {
        await fetchFromPeoplyApiJson(
          `/organizations/${oid}/roleDescription/${user?.id}`,
          {
            method: "PATCH",
            body: JSON.stringify({ description: roleDescription }),
            headers: { "Content-Type": "application/json; charset=utf-8" },
          },
        );
      }
      if (userToEdit?.role !== roleValue) {
        await fetchFromPeoplyApiJson(`/organizations/${oid}/roles`, {
          method: "PATCH",
          body: JSON.stringify({ role: roleValue, userId: userToEdit?.userId }),
          headers: { "Content-Type": "application/json; charset=utf-8" },
        });
      }
      addSnack("Bruker oppdatert", SnackTypes.SUCCESS);
    } catch (error) {
      addSnack("Klarte ikke å oppdatere profilen", SnackTypes.ERROR);
    } finally {
      router.push(`/orgs/${oid}/members`);
    }
  }

  /* generates roles for the dropdown based on your role and the user you are editing */
  function generateRoleOptions(userToEdit: UserOrganizationRoles) {
    const ownerOption = {
      value: OrganizationRole.OWNER,
      label: "Eier",
    };
    const adminOption = {
      value: OrganizationRole.ADMIN,
      label: "Administrator",
    };
    const memberOption = {
      value: OrganizationRole.MEMBER,
      label: "Medlem",
    };

    if (isOwner) {
      if (isEditingSelf) {
        return [ownerOption];
      } else {
        return [adminOption, memberOption];
      }
    } else if (isAdmin) {
      if (userToEdit?.role === OrganizationRole.MEMBER || isEditingSelf) {
        return [memberOption, adminOption];
      }
    }
    return [];
  }

  if (user && organizationUsers && organization && userToEdit) {
    return (
      <>
        <HeadComponent
          title={`${organization?.name} - Inviter medlemmer`}
          description="Inviter medlemmer til din organisasjon"
        />
        <div className={styles.container}>
          <BackButton onClick={goBack} />
          <div className={styles.profile}>
            <Avatar user={userToEdit?.user} size="large" />
            <h1
              className={styles.name}
            >{`${userToEdit?.user.firstName} ${userToEdit?.user.lastName}`}</h1>
            <p className={styles.roleDescription}>
              {userToEdit.roleDescription}
            </p>
          </div>
          <div className={styles.form}>
            {isAdminOrOwner && (
              <Dropdown
                label="Rolle"
                value={roleValue}
                setValue={setRoleValue}
                inputId="role"
                options={generateRoleOptions(userToEdit)}
              />
            )}
            {isEditingSelf && (
              <TextInput
                value={roleDescription}
                handleChange={(e) => setRoleDescription(e.target.value)}
                inputId="roleDescription"
                inputName="roleDescription"
                label="Tittel i organisajsonen"
                maxLength={35}
              />
            )}
            {
              /* ((isAdminOrOwner && userToEdit.role === OrganizationRole.MEMBER) ||
              (isOwner && userToEdit.role === OrganizationRole.ADMIN))  */
              organizationUser &&
                getOrganizationRolePrivilege(organizationUser?.role) >
                  getOrganizationRolePrivilege(userToEdit.role) && (
                  <SettingsButton
                    text="Fjern bruker fra organisasjonen"
                    type={SettingTypes.DANGER}
                    onClick={() => setModalOpen(true)}
                  />
                )
            }
            {isEditingSelf && !isOwner && (
              <SettingsButton
                text="Fjern meg fra organisasjonen"
                type={SettingTypes.DANGER}
                onClick={() => setModalOpen(true)}
              />
            )}
          </div>
          <div className={`${styles.confirm} ${validEdit ? styles.show : ""}`}>
            <Button
              disabled={!validEdit}
              text="Lagre endringer"
              onClick={handleConfirm}
            />
          </div>
        </div>
        {modalOpen && (
          <Modal
            label={`Vil du fjerne ${user?.firstName} ${user?.lastName}?`}
            description="Dette vil fjerne brukeren fra organisasjonen. Brukeren må inviteres på nytt for å bli medlem igjen."
            buttonText={`Fjern bruker`}
            secondaryButtonText="Lukk"
            buttonOnClick={() => deleteUser(userToEdit?.userId)}
            secondaryButtonOnClick={() => setModalOpen(false)}
            closeButtonOnClick={() => setModalOpen(false)}
            danger
          />
        )}
      </>
    );
  }
  return <></>;
}
