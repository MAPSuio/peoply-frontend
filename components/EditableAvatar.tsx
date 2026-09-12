import { useState } from "react";

import type { Organization, User } from "../types/types";
import Avatar from "./Avatar";
import EditProfileImageMenu from "./EditProfileImageMenu";
import MenuModal from "./MenuModal";

import styles from "../styles/EditProfile.module.scss";

export interface EditableAvatarProps {
  user: User;
  org?: Organization;
  endpoint: string;
  formDataKey: string;
  onImageChanged: () => void;
}

export default function EditableAvatar({
  user,
  org,
  endpoint,
  formDataKey,
  onImageChanged,
}: EditableAvatarProps) {
  const [editing, setEditing] = useState(false);

  const close = () => {
    setEditing(false);
    onImageChanged();
  };

  return (
    <>
      <button
        type="button"
        className={styles.editImageButton}
        onClick={() => setEditing(true)}
      >
        <Avatar user={user} org={org} size="large" edit />
      </button>
      {editing && (
        <MenuModal label="Endre bilde" onClose={close}>
          <EditProfileImageMenu
            onClose={close}
            endpoint={endpoint}
            formDataKey={formDataKey}
          />
        </MenuModal>
      )}
    </>
  );
}
