import { describe, expect, it } from "vitest";

import {
  hasUnsavedMemberEdit,
  roleOptionsFor,
} from "../utils/organizationMemberEdit";
import { OrganizationRole } from "../types/types";

const { OWNER, ADMIN, MEMBER } = OrganizationRole;

describe("roleOptionsFor", () => {
  it("offers an owner editing themselves nothing but owner", () => {
    expect(
      roleOptionsFor({ isOwner: true, isAdmin: false, isEditingSelf: true }),
    ).toEqual([{ value: OWNER, label: "Eier" }]);
  });

  it("lets an owner make someone an admin or a plain member", () => {
    expect(
      roleOptionsFor({ isOwner: true, isAdmin: false, isEditingSelf: false }),
    ).toEqual([
      { value: ADMIN, label: "Administrator" },
      { value: MEMBER, label: "Medlem" },
    ]);
  });

  it("lets an admin promote a member", () => {
    expect(
      roleOptionsFor({
        isOwner: false,
        isAdmin: true,
        isEditingSelf: false,
        roleBeingEdited: MEMBER,
      }),
    ).toEqual([
      { value: MEMBER, label: "Medlem" },
      { value: ADMIN, label: "Administrator" },
    ]);
  });

  it("offers an admin nothing for another admin", () => {
    expect(
      roleOptionsFor({
        isOwner: false,
        isAdmin: true,
        isEditingSelf: false,
        roleBeingEdited: ADMIN,
      }),
    ).toEqual([]);
  });

  it("offers a plain member nothing", () => {
    expect(
      roleOptionsFor({ isOwner: false, isAdmin: false, isEditingSelf: true }),
    ).toEqual([]);
  });
});

describe("hasUnsavedMemberEdit", () => {
  const saved = { role: MEMBER, roleDescription: "Medlem" };

  it("is false while nothing has changed", () => {
    expect(
      hasUnsavedMemberEdit({
        isEditingSelf: true,
        savedRole: saved.role,
        savedRoleDescription: saved.roleDescription,
        roleDescription: "Medlem",
        role: MEMBER,
      }),
    ).toBe(false);
  });

  it("is true when you retitle yourself", () => {
    expect(
      hasUnsavedMemberEdit({
        isEditingSelf: true,
        savedRole: saved.role,
        savedRoleDescription: saved.roleDescription,
        roleDescription: "Leder",
        role: MEMBER,
      }),
    ).toBe(true);
  });

  it("is true when the role changes", () => {
    expect(
      hasUnsavedMemberEdit({
        isEditingSelf: false,
        savedRole: saved.role,
        savedRoleDescription: saved.roleDescription,
        roleDescription: "Medlem",
        role: ADMIN,
      }),
    ).toBe(true);
  });

  it("ignores a retitle when you are not editing yourself", () => {
    expect(
      hasUnsavedMemberEdit({
        isEditingSelf: false,
        savedRole: saved.role,
        savedRoleDescription: saved.roleDescription,
        roleDescription: "Noe annet",
        role: MEMBER,
      }),
    ).toBe(false);
  });
});
