// Next.js.
import Image from "next/image";
// Components.
import Avatar from "./Avatar";

// Types.
import { Organization } from "../types/types";

// Styles.
import styles from "../styles/OrganizationAvatar.module.scss";

interface OrganizationAvatarProps {
  organization: Organization;
}

const OrganizationAvatar = ({ organization }: OrganizationAvatarProps) => {
  return (
    <div className={styles.container}>
      <Avatar org={organization} size="large" />
      <span className={styles.name}>{organization.name}</span>
    </div>
  );
};

export default OrganizationAvatar;
