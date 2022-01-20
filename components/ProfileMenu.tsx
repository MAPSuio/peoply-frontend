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

export default function ProfileMenu() {
  return (
    <div className={styles.container}>
      <ProfileMenuItem
        text="Rediger profil"
        Icon={UserIcon}
        ActionIcon={ChevronRightIcon}
        onClick={() => ""}
      />
      <ProfileMenuItem
        text="Instillinger"
        Icon={SettingsIcon}
        ActionIcon={ChevronRightIcon}
        onClick={() => ""}
      />
      <ProfileMenuItem
        text="Betalingsinformasjon"
        Icon={CreditCardIcon}
        ActionIcon={ChevronRightIcon}
        onClick={() => ""}
      />
      <ProfileMenuItem
        text="Organisasjoner"
        Icon={BriefcaseIcon}
        ActionIcon={ChevronRightIcon}
        onClick={() => ""}
      />
      <span className={styles.divider} />
      <ProfileMenuItem
        text="Kontakt oss"
        Icon={MailIcon}
        ActionIcon={ChevronRightIcon}
        onClick={() => ""}
      />
      <ProfileMenuItem
        text="Log ut"
        Icon={LogoutIcon}
        danger="true"
        ActionIcon={CloseIcon}
        onClick={() => ""}
      />
    </div>
  );
}
