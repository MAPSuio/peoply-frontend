import Link from "next/link";
import styles from "../styles/ProfileMenuItem.module.scss";

interface ProfileMenuItemProps {
  text: string;
  Icon: React.ElementType;
  ActionIcon: React.ElementType;
  danger?: boolean;
  linkOrOnClick: string | (() => void);
}

export default function ProfileMenuItem({
  text,
  Icon,
  ActionIcon,
  danger,
  linkOrOnClick,
}: ProfileMenuItemProps) {
  if (typeof linkOrOnClick === "string") {
    return (
      <Link href={linkOrOnClick} passHref>
        <a className={`${styles.container} ${danger && styles.danger}`}>
          <div className={styles.left}>
            <Icon />
            <p>{text}</p>
          </div>
          <ActionIcon />
        </a>
      </Link>
    );
  }
  return (
    <button
      onClick={linkOrOnClick}
      className={`${styles.container} ${danger && styles.danger}`}
    >
      <div className={styles.left}>
        <Icon />
        <p>{text}</p>
      </div>
      <ActionIcon className={danger && styles.danger} />
    </button>
  );
}
