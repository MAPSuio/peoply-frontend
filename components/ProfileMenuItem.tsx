import styles from "../styles/ProfileMenuItem.module.scss";

interface ProfileMenuItemProps {
  text: string;
  Icon: React.FunctionComponent;
  ActionIcon: React.FunctionComponent;
  danger?: "true";
  onClick: () => void;
}

export default function ProfileMenuItem({
  text,
  Icon,
  ActionIcon,
  danger,
  onClick,
}: ProfileMenuItemProps) {
  return (
    <div onClick={onClick} className={styles.container}>
      <div className={styles.left}>
        <Icon />
        <p className={danger ? styles.danger : ""}>{text}</p>
      </div>
      <ActionIcon />
    </div>
  );
}
