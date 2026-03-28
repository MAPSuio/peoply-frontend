// Components.
import ProfileMenuItem from "./ProfileMenuItem";

// Hooks.
import useUser from "../hooks/useUser";
import { MAPS_ORG_ID } from "../constants/organizations";

// Assets.
import UserIcon from "./svgs/UserIcon";
import ChevronRightIcon from "./svgs/ChevronRightIcon";
import SettingsIcon from "./svgs/SettingsIcon";
import BriefcaseIcon from "./svgs/BriefcaseIcon";
import MailIcon from "./svgs/MailIcon";
import LogoutIcon from "./svgs/LogoutIcon";
import CloseIcon from "./svgs/CloseIcon";
import UsersIcon from "./svgs/UsersIcon";

// Styles.
import styles from "../styles/ProfileMenu.module.scss";

export default function ProfileMenu() {
  const { logout, orgs } = useUser();
  const isMapsMember = orgs?.some((org) => org.id === MAPS_ORG_ID);

  return (
    <div className={styles.container}>
      <ProfileMenuItem
        text="Rediger profil"
        Icon={UserIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick="/me/edit"
      />
      {/* <ProfileMenuItem
        text="Betalingsinformasjon"
        Icon={CreditCardIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={() => ""}
      /> */}
      <ProfileMenuItem
        text="Organisasjoner"
        Icon={BriefcaseIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={"/me/orgs"}
      />
      <ProfileMenuItem
        text="Følger"
        Icon={UsersIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick={"/me/following"}
      />
      {isMapsMember && (
        <ProfileMenuItem
          text="Admin: foreninger"
          Icon={BriefcaseIcon}
          ActionIcon={ChevronRightIcon}
          linkOrOnClick="/me/admin/orgs"
        />
      )}
      <ProfileMenuItem
        text="Innstillinger"
        Icon={SettingsIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick="/me/settings"
      />
      <span className={styles.divider} />
      <ProfileMenuItem
        text="Spørsmål og kontakt"
        Icon={MailIcon}
        ActionIcon={ChevronRightIcon}
        linkOrOnClick="/faq"
      />
      <ProfileMenuItem
        text="Logg ut"
        Icon={LogoutIcon}
        danger
        ActionIcon={CloseIcon}
        linkOrOnClick={logout}
      />
    </div>
  );
}
