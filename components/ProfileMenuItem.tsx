import Link from "next/link";
import styles from "../styles/ProfileMenuItem.module.scss";

interface ProfileMenuItemProps {
  text: string;
  Icon: React.FunctionComponent;
  ActionIcon: React.FunctionComponent;
  danger?: boolean;
  linkOrOnclick: string | (() => void);
}

export default function ProfileMenuItem({
  text,
  Icon,
  ActionIcon,
  danger,
  linkOrOnclick,
}: ProfileMenuItemProps) {
  if (typeof linkOrOnclick === "string") {
    return (
      <Link href={linkOrOnclick} passHref>
        <a className={styles.container}>
          <div className={styles.left}>
            <Icon />
            <p className={danger ? styles.danger : ""}>{text}</p>
          </div>
          <ActionIcon />
        </a>
      </Link>
    );
  }
  return (
    <button onClick={linkOrOnclick} className={styles.container}>
      <div className={styles.left}>
        <Icon />
        <p className={danger ? styles.danger : ""}>{text}</p>
      </div>
      <ActionIcon />
    </button>
  );
}
