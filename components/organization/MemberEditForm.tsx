import { useRouter } from "next/router";
import { useState } from "react";

import Avatar from "../Avatar";
import BackButton from "../BackButton";
import Button from "../Button";
import Dropdown from "../Dropdown";
import TextInput from "../inputs/TextInput";
import Modal from "../Modal";
import ModalButton from "../ModalButton";
import SettingsButton from "../SettingsButton";
import useSnack from "../../hooks/useSnack";
import {
  removeOrganizationMember,
  saveMemberEdit,
  transferOrganizationOwnership,
} from "../../services/organizations";
import styles from "../../styles/EditOrganizationUser.module.scss";
import {
  ButtonType,
  type Organization,
  type OrganizationRole,
  SettingTypes,
  SnackTypes,
  type UserOrganizationRoles,
} from "../../types/types";
import cx from "../../utils/cx";
import { getOrganizationRolePrivilege } from "../../utils/functions";
import { organizationPath } from "../../utils/organization";
import {
  hasUnsavedMemberEdit,
  roleOptionsFor,
} from "../../utils/organizationMemberEdit";

type AddSnack = (label: string, type?: SnackTypes) => void;

/** Which irreversible action is waiting for confirmation, if any. */
type DangerModal = "remove" | "transferOwnership" | null;

/** The editable half of a membership, as the form holds it while you type. */
interface MemberEditDraft {
  roleDescription: string;
  role?: OrganizationRole;
}

/**
 * Runs a membership change and says how it went, moving on only once it has
 * actually succeeded. Every one of these calls can fail, and a page that
 * navigates away regardless leaves the user believing a change landed that
 * did not.
 */
async function runAndReport(
  addSnack: AddSnack,
  action: () => Promise<unknown>,
  success: string,
  onDone: () => void,
) {
  try {
    await action();
  } catch {
    addSnack("Noe gikk galt", SnackTypes.ERROR);
    return;
  }

  addSnack(success, SnackTypes.SUCCESS);
  onDone();
}

interface DangerActions {
  onRemove: () => void;
  onTransferOwnership: () => void;
}

interface DangerButtonsProps extends DangerActions {
  mayRemoveMember: boolean;
  isOwner?: boolean;
  isEditingSelf: boolean;
}

/** The irreversible options, shown only to whoever is allowed to take them. */
function MemberDangerButtons({
  mayRemoveMember,
  isOwner,
  isEditingSelf,
  onRemove,
  onTransferOwnership,
}: DangerButtonsProps) {
  return (
    <>
      {mayRemoveMember && (
        <SettingsButton
          text="Fjern bruker fra organisasjonen"
          type={SettingTypes.DANGER}
          onClick={onRemove}
        />
      )}
      {isOwner && !isEditingSelf && (
        <SettingsButton
          text="Gjør brukeren til eier"
          type={SettingTypes.DANGER}
          onClick={onTransferOwnership}
        />
      )}
      {isEditingSelf && !isOwner && (
        <SettingsButton
          text="Fjern meg fra organisasjonen"
          type={SettingTypes.DANGER}
          onClick={onRemove}
        />
      )}
    </>
  );
}

interface DangerModalsProps extends DangerActions {
  openModal: DangerModal;
  onClose: () => void;
}

/** The confirmations for the irreversible options. */
function MemberDangerModals({
  openModal,
  onRemove,
  onTransferOwnership,
  onClose,
}: DangerModalsProps) {
  return (
    <>
      {openModal === "remove" && (
        <Modal
          label="Vil du fjerne brukeren?"
          description="Dette vil fjerne brukeren fra organisasjonen. Brukeren må inviteres på nytt for å bli medlem igjen."
          closeButtonOnClick={onClose}
        >
          <ModalButton
            text="Fjern bruker"
            onClick={onRemove}
            type={ButtonType.DANGERSOFT}
          />
          <ModalButton
            text="Lukk"
            onClick={onClose}
            type={ButtonType.SECONDARY}
          />
        </Modal>
      )}
      {openModal === "transferOwnership" && (
        <Modal
          label="Vil du gjøre brukeren til eier?"
          description="Dette vil gjøre brukeren til eier og fjerne deg som eier."
          closeButtonOnClick={onClose}
        >
          <ModalButton
            text="Gjør til eier"
            onClick={onTransferOwnership}
            type={ButtonType.DANGERSOFT}
          />
          <ModalButton
            text="Lukk"
            onClick={onClose}
            type={ButtonType.SECONDARY}
          />
        </Modal>
      )}
    </>
  );
}

interface MemberEditFieldsProps {
  member: UserOrganizationRoles;
  viewer: ViewerStanding;
  isEditingSelf: boolean;
  edit: MemberEditDraft;
  onChange: (edit: MemberEditDraft) => void;
}

/** The two things about a membership that can be edited, each shown to whoever may edit it. */
function MemberEditFields({
  member,
  viewer,
  isEditingSelf,
  edit,
  onChange,
}: MemberEditFieldsProps) {
  return (
    <>
      {viewer.isAdminOrOwner && (
        <Dropdown
          label="Rolle"
          value={edit.role}
          setValue={(role) => onChange({ ...edit, role })}
          inputId="role"
          options={roleOptionsFor({
            isOwner: viewer.isOwner,
            isAdmin: viewer.isAdmin,
            isEditingSelf,
            roleBeingEdited: member.role,
          })}
        />
      )}
      {isEditingSelf && (
        <TextInput
          value={edit.roleDescription}
          handleChange={(event) =>
            onChange({ ...edit, roleDescription: event.target.value })
          }
          inputId="roleDescription"
          inputName="roleDescription"
          label="Tittel i organisajsonen"
          maxLength={35}
        />
      )}
    </>
  );
}

export interface ViewerStanding {
  isOwner?: boolean;
  isAdmin?: boolean;
  isAdminOrOwner?: boolean;
  /** The viewer's own membership, which decides who they outrank. */
  membership?: UserOrganizationRoles;
}

export interface MemberEditFormProps {
  organization: Organization;
  member: UserOrganizationRoles;
  editorId: string;
  viewer: ViewerStanding;
  onBack: () => void;
}

/** One member's role and title, as far as the signed-in editor may change them. */
export default function MemberEditForm({
  organization,
  member,
  editorId,
  viewer,
  onBack,
}: MemberEditFormProps) {
  const router = useRouter();
  const { addSnack } = useSnack();
  const [edit, setEdit] = useState<MemberEditDraft>({
    roleDescription: member.roleDescription ?? "",
    role: member.role,
  });
  const [openModal, setOpenModal] = useState<DangerModal>(null);

  const isEditingSelf = editorId === member.userId;
  const hasChanges = hasUnsavedMemberEdit({
    isEditingSelf,
    savedRole: member.role,
    savedRoleDescription: member.roleDescription,
    ...edit,
  });

  const { remove, transferOwnership, save } = memberActions({
    addSnack,
    organization,
    member,
    editorId,
    isEditingSelf,
    edit,
    onDone: () => router.replace(organizationPath(organization, "/members")),
  });

  return (
    <>
      <div className={styles.container}>
        <BackButton onClick={onBack} />
        <div className={styles.profile}>
          <Avatar user={member.user} size="large" />
          <h1 className={styles.name}>
            {`${member.user.firstName} ${member.user.lastName}`}
          </h1>
          <p className={styles.roleDescription}>{member.roleDescription}</p>
        </div>
        <div className={styles.form}>
          <MemberEditFields
            member={member}
            viewer={viewer}
            isEditingSelf={isEditingSelf}
            edit={edit}
            onChange={setEdit}
          />
          <MemberDangerButtons
            mayRemoveMember={outranks(viewer.membership, member)}
            isOwner={viewer.isOwner}
            isEditingSelf={isEditingSelf}
            onRemove={() => setOpenModal("remove")}
            onTransferOwnership={() => setOpenModal("transferOwnership")}
          />
        </div>
        <div className={cx(styles.confirm, hasChanges && styles.show)}>
          <Button
            disabled={!hasChanges}
            text="Lagre endringer"
            onClick={save}
          />
        </div>
      </div>
      <MemberDangerModals
        openModal={openModal}
        onRemove={remove}
        onTransferOwnership={transferOwnership}
        onClose={() => setOpenModal(null)}
      />
    </>
  );
}

interface MemberActionsInput {
  addSnack: AddSnack;
  organization: Organization;
  member: UserOrganizationRoles;
  editorId: string;
  isEditingSelf: boolean;
  edit: MemberEditDraft;
  onDone: () => void;
}

/** The three membership changes this form can make, each reporting its own outcome. */
function memberActions({
  addSnack,
  organization,
  member,
  editorId,
  isEditingSelf,
  edit,
  onDone,
}: MemberActionsInput) {
  const report = (action: () => Promise<unknown>, success: string) => () =>
    runAndReport(addSnack, action, success, onDone);

  return {
    remove: report(
      () => removeOrganizationMember(organization.id, member.userId),
      "Medlem fjernet",
    ),
    transferOwnership: report(
      () => transferOrganizationOwnership(organization.id, member.userId),
      "Eier endret",
    ),
    save: report(
      () =>
        saveMemberEdit({
          organizationId: organization.id,
          member,
          editorId,
          isEditingSelf,
          ...edit,
        }),
      "Bruker oppdatert",
    ),
  };
}

/** Whether the editor's own role sits above the one they are looking at. */
function outranks(
  editorMembership: UserOrganizationRoles | undefined,
  member: UserOrganizationRoles,
): boolean {
  if (!editorMembership) return false;

  return (
    getOrganizationRolePrivilege(editorMembership.role) >
    getOrganizationRolePrivilege(member.role)
  );
}
