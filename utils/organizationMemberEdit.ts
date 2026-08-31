import { OrganizationRole } from "../types/types";

export interface RoleOption {
  value: OrganizationRole;
  label: string;
}

const OWNER_OPTION: RoleOption = {
  value: OrganizationRole.OWNER,
  label: "Eier",
};
const ADMIN_OPTION: RoleOption = {
  value: OrganizationRole.ADMIN,
  label: "Administrator",
};
const MEMBER_OPTION: RoleOption = {
  value: OrganizationRole.MEMBER,
  label: "Medlem",
};

export interface RoleOptionsInput {
  isOwner?: boolean;
  isAdmin?: boolean;
  isEditingSelf: boolean;
  /** The role of the membership being edited. */
  roleBeingEdited?: OrganizationRole;
}

/**
 * The roles the editor is allowed to hand out here.
 *
 * An owner keeps their own role and may make anyone else an admin or a plain
 * member. An admin may only move a plain member up, or change their own
 * standing. Everyone else gets nothing to choose from.
 */
export function roleOptionsFor({
  isOwner,
  isAdmin,
  isEditingSelf,
  roleBeingEdited,
}: RoleOptionsInput): RoleOption[] {
  if (isOwner) {
    return isEditingSelf ? [OWNER_OPTION] : [ADMIN_OPTION, MEMBER_OPTION];
  }

  const adminMayChange =
    roleBeingEdited === OrganizationRole.MEMBER || isEditingSelf;

  if (isAdmin && adminMayChange) {
    return [MEMBER_OPTION, ADMIN_OPTION];
  }

  return [];
}

export interface UnsavedMemberEditInput {
  isEditingSelf: boolean;
  savedRole?: OrganizationRole;
  savedRoleDescription?: string;
  roleDescription: string;
  role?: OrganizationRole;
}

/** Whether the form holds a change worth saving. Only your own title is yours to edit. */
export function hasUnsavedMemberEdit({
  isEditingSelf,
  savedRole,
  savedRoleDescription,
  roleDescription,
  role,
}: UnsavedMemberEditInput): boolean {
  if (isEditingSelf && savedRoleDescription !== roleDescription) {
    return true;
  }

  return savedRole !== role;
}
