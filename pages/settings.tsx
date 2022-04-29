/* Next. */
import Link from "next/link";

/* React. */
import { useState } from "react";

/* Hooks. */
import useUser from "../hooks/useUser";
import useBack from "../hooks/useBack";

/* Components. */
import BackButton from "../components/BackButton";
import SwitchInput from "../components/inputs/SwitchInput";
import CheckboxInput from "../components/inputs/CheckboxInput";
import RadioInputSmall from "../components/inputs/RadioInputSmall";
import SettingsButton from "../components/SettingsButton";

/* Assets. */
import SunsetIcon from "../components/svgs/SunsetIcon";
import NightIcon from "../components/svgs/NightIcon";
import SunIcon from "../components/svgs/SunIcon";

/* Types. */
import { SettingTypes } from "../types/types";

/* Styles. */
import styles from "../styles/Settings.module.scss";
import useRedirectToLogin from "../hooks/useRedirectToLogin";
import HeadComponent from "../components/HeadComponent";

interface SettingsProps {
  baseUrl: string;
}

const Settings = ({ baseUrl }: SettingsProps) => {
  /* TODO: Fetch and update most of these from API. */
  const [locationAccess, setLocationAccess] = useState(false);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [allowSMSNotifications, setAlllowSMSNotifications] = useState(true);
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [activeTheme, setActiveTheme] = useState(1);

  const { user, loading } = useUser();
  const goBack = useBack();
  const redirectToLogin = useRedirectToLogin();

  if (loading) {
    /* TODO: Create actual loading skeleton. */
    return <h1>Loading...</h1>;
  } else if (!user) {
    redirectToLogin();
  }

  const updateTheme = (id: number) => {
    setActiveTheme(id);
  };

  return (
    <>
      <HeadComponent
        title="Innstillinger"
        description="Her kan du endre innstillinger for din bruker."
        url={`${baseUrl}/settings`}
      />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton onClick={goBack} className={styles.marginBottomMedium} />
          <h1 className={styles.title}>Innstillinger</h1>
          <p className={styles.subTitle}>
            Tilpass appen etter dine ønsker og behov
          </p>
          <div className={styles.contentContainer}>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Posisjonsdata</h2>
              <SwitchInput
                label="Bruk posisjonen min"
                checked={locationAccess}
                onClick={() => setLocationAccess(!locationAccess)}
              />
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Varslinger</h2>
              <div className={styles.notificationContainer}>
                <CheckboxInput
                  label="Motta varsler"
                  checked={allowNotifications}
                  checkboxId="allowNotifications"
                  checkboxName="allowNotifications"
                  onChange={() => setAllowNotifications(!allowNotifications)}
                />
                <CheckboxInput
                  label="Motta SMS varsler"
                  checked={allowNotifications && allowSMSNotifications}
                  checkboxId="allowSMSNotifications"
                  checkboxName="allowSMSNotifications"
                  disabled={!allowNotifications}
                  className={styles.marginLeftMedium}
                  onChange={() =>
                    setAlllowSMSNotifications(!allowSMSNotifications)
                  }
                />
                <CheckboxInput
                  label="Motta email varsler"
                  checked={allowNotifications && allowEmailNotifications}
                  disabled={!allowNotifications}
                  checkboxId="allowEmailNotifications"
                  checkboxName="allowEmailNotifications"
                  className={styles.marginLeftMedium}
                  onChange={() =>
                    setAllowEmailNotifications(!allowEmailNotifications)
                  }
                />
              </div>
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Visning/tema</h2>
              <RadioInputSmall
                optionsAndIcons={[
                  {
                    id: 1,
                    text: "Skumring",
                    icon: SunsetIcon,
                    active: activeTheme === 1,
                  },
                  {
                    id: 2,
                    text: "Natt",
                    icon: NightIcon,
                    active: activeTheme === 2,
                  },
                  {
                    id: 3,
                    text: "Lys",
                    icon: SunIcon,
                    active: activeTheme === 3,
                  },
                ]}
                onClick={updateTheme}
              />
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Posisjonsdata</h2>
              <div className={styles.userContainer}>
                <Link href="/me/data">
                  <a>
                    <SettingsButton text="Se dataene dine" isLink />
                  </a>
                </Link>
                <SettingsButton
                  text="Slett min bruker"
                  type={SettingTypes.DANGER}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const getStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Settings;
