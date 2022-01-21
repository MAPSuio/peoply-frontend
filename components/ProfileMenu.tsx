import styles from "../styles/ProfileMenu.module.scss";
import ProfileMenuItem from "./ProfileMenuItem";
import UserIcon from "./svgs/UserIcon";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import SettingsIcon from "./svgs/SettingsIcon";
import CreditCardIcon from "./svgs/CreditCardIcon";
import BriefcaseIcon from "./svgs/BriefcaseIcon";
import MailIcon from "./svgs/MailIcon";
import LogoutIcon from "./svgs/LogoutIcon";
import CloseIcon from "./svgs/CloseIcon";
import { useRouter } from "next/router";
import useUser from "../hooks/useUser";

export default function ProfileMenu() {
  const { logout } = useUser();
  const router = useRouter();
  return (
    <div className={styles.container}>
      <ProfileMenuItem
        text="Rediger profil"
        Icon={UserIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick="/login"
      />
      <ProfileMenuItem
        text="Instillinger"
        Icon={SettingsIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={() => ""}
      />
      <ProfileMenuItem
        text="Betalingsinformasjon"
        Icon={CreditCardIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={() => ""}
      />
      <ProfileMenuItem
        text="Organisasjoner"
        Icon={BriefcaseIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={() => ""}
      />
      <span className={styles.divider} />
      <ProfileMenuItem
        text="Kontakt oss"
        Icon={MailIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={() => ""}
      />
      <ProfileMenuItem
        text="Log ut"
        Icon={LogoutIcon}
        danger
        ActionIcon={CloseIcon}
        linkOrOnClick={() => logout().then(() => router.push("/"))}
      />
    </div>
  );
}
