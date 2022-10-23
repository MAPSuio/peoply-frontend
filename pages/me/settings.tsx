/* Next. */
// import Link from "next/link";

/* Hooks. */
import useUser from "../../hooks/useUser";
import useBack from "../../hooks/useBack";

/* Components. */
import BackButton from "../../components/BackButton";
// import SwitchInput from "../../components/inputs/SwitchInput";
// import CheckboxInput from "../../components/inputs/CheckboxInput";
// import RadioInputSmall from "../../components/inputs/RadioInputSmall";
import SettingsButton from "../../components/SettingsButton";

/* Assets. */
// import SunsetIcon from "../../components/svgs/SunsetIcon";
// import NightIcon from "../../components/svgs/NightIcon";
// import SunIcon from "../../components/svgs/SunIcon";

/* Types. */
import { SettingTypes, SnackTypes, ButtonType } from "../../types/types";

/* Styles. */
import styles from "../../styles/Settings.module.scss";
import HeadComponent from "../../components/HeadComponent";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "../../components/Modal";
import ModalButton from "../../components/ModalButton";
import SwitchInput from "../../components/inputs/SwitchInput";
import TextInput from "../../components/inputs/TextInput";
import Button from "../../components/Button";
import CheckboxInput from "../../components/inputs/CheckboxInput";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useSnack from "../../hooks/useSnack";

interface SettingsProps {
  baseUrl: string;
}

const Settings = ({ baseUrl }: SettingsProps) => {
  /* TODO: Fetch and update most of these from API. */
  // const [locationAccess, setLocationAccess] = useState(false);
  // const [allowNotifications, setAllowNotifications] = useState(true);
  // const [allowSMSNotifications, setAlllowSMSNotifications] = useState(true);
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [allowEmailFromArranger, setAllowEmailFromArranger] = useState(true);
  const [allowEmailPromotions, setAllowEmailPromotions] = useState(true);
  // const [activeTheme, setActiveTheme] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const { addSnack } = useSnack();

  const { user, loading, deleteMe, reload } = useUser();
  const goBack = useBack();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setAllowEmailFromArranger(user.allowEmailFromArranger);
      setAllowEmailPromotions(user.allowEmailPromotions);

      /* activate the allow email switch if either email toggles are true */
      if (user.allowEmailFromArranger || user.allowEmailPromotions) {
        setAllowEmailNotifications(true);
      }
    }
  }, [user]);

  /* untoggle email switch if both email toggles are false */
  useEffect(() => {
    if (!allowEmailFromArranger && !allowEmailPromotions) {
      setAllowEmailNotifications(false);
    }
  }, [allowEmailFromArranger, allowEmailPromotions]);

  if (loading) {
    /* TODO: Create actual loading skeleton. */
    return <h1>Loading...</h1>;
  } else if (!user && !loading) {
    router.push("/");
  }

  // const updateTheme = (id: number) => {
  //   setActiveTheme(id);
  // };

  const validAllowEmailFromArrangerEdit =
    allowEmailFromArranger !== user?.allowEmailFromArranger;
  const validAllowEmailPromotionsEdit =
    allowEmailPromotions !== user?.allowEmailPromotions;
  const validEmailEdit = emailValid && email !== user?.email;
  const validEdit =
    validEmailEdit ||
    validAllowEmailFromArrangerEdit ||
    validAllowEmailPromotionsEdit;

  const handleConfirm = async () => {
    try {
      const body = {
        ...(validEmailEdit && { email }),
        ...(validAllowEmailFromArrangerEdit && { allowEmailFromArranger }),
        ...(validAllowEmailPromotionsEdit && { allowEmailPromotions }),
      };

      await fetchFromPeoplyApiJson("/users/me", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Innstillinger oppdatert", SnackTypes.SUCCESS);
      reload();
      router.replace("/me");
    } catch (error) {
      addSnack("Kunne ikke oppdatere innstillinger", SnackTypes.ERROR);
    }
  };

  return (
    <>
      <HeadComponent
        title="Innstillinger"
        description="Her kan du endre innstillinger for din bruker."
        url={`${baseUrl}/me/settings`}
      />
      <div className={styles.wrapper}>
        <div className={styles.container}>
          <BackButton onClick={goBack} className={styles.marginBottomMedium} />
          <h1 className={styles.title}>Innstillinger</h1>
          <p className={styles.subTitle}>
            Tilpass appen etter dine ønsker og behov
          </p>
          <div className={styles.contentContainer}>
            {/* <div className={styles.section}>
              <h2 className={styles.inputHeader}>Posisjonsdata</h2>
              <SwitchInput
                label="Bruk posisjonen min"
                checked={locationAccess}
                onClick={() => setLocationAccess(!locationAccess)}
              />
            </div> */}
            {/* <div className={styles.section}>
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
            </div> */}
            {/* <div className={styles.section}>
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
            </div> */}
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Epost</h2>
              <SwitchInput
                label="Tillat oppdateringer på epost"
                checked={allowEmailNotifications}
                onClick={() => {
                  if (allowEmailNotifications) {
                    setAllowEmailFromArranger(false);
                    setAllowEmailPromotions(false);
                  } else {
                    setAllowEmailFromArranger(true);
                    setAllowEmailNotifications(!allowEmailNotifications);
                  }
                }}
              />
              {allowEmailNotifications && (
                <div className={styles.subsection}>
                  <CheckboxInput
                    label="Motta epost fra arrangementer du skal på"
                    checked={allowEmailFromArranger}
                    checkboxId="allowNotifications"
                    checkboxName="allowNotifications"
                    onChange={() =>
                      setAllowEmailFromArranger(!allowEmailFromArranger)
                    }
                  />
                  <CheckboxInput
                    label="Motta epost fra Peoply-teamet"
                    checked={allowEmailPromotions}
                    checkboxId="allowPromotions"
                    checkboxName="allowPromotions"
                    onChange={() =>
                      setAllowEmailPromotions(!allowEmailPromotions)
                    }
                  />
                  <TextInput
                    value={email}
                    inputId="subject"
                    inputName="subject"
                    label="Foretrukket epost"
                    errorMessage={`Eposten må være gyldig.`}
                    placeholder="svar@eksempel.no"
                    maxLength={100}
                    handleChange={(e) => setEmail(e.target.value)}
                    setValid={setEmailValid}
                    valid={emailValid}
                    validate
                    isEmail
                  />
                  {/* <SwitchInput
                    label="Tillat oppdateringer om ventelister"
                    checked={allowEmailNotifications}
                    onClick={() =>
                      setAllowEmailNotifications(!allowEmailNotifications)
                    }
                  />
                  <SwitchInput
                    label="Tillat eposter fra Peoply-teamet"
                    checked={allowEmailNotifications}
                    onClick={() =>
                      setAllowEmailNotifications(!allowEmailNotifications)
                    }
                  /> */}
                </div>
              )}
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Min bruker</h2>
              <div className={styles.userContainer}>
                {/* <Link href="/me/data">
                  <a>
                    <SettingsButton text="Se dataene dine" isLink />
                  </a>
                </Link> */}
                <SettingsButton
                  text="Slett min bruker"
                  type={SettingTypes.DANGER}
                  onClick={() => setModalOpen(true)}
                />
              </div>
            </div>
          </div>
          {validEdit && (
            <Button
              disabled={!validEdit}
              text="Lagre innstillinger"
              onClick={handleConfirm}
              className={styles.confirm}
            />
          )}
        </div>
      </div>
      {modalOpen && (
        <Modal
          label={`Vil du slette ${user?.firstName} ${user?.lastName}?`}
          description="Dette vil slette brukeren og all tilknyttet data. Dette kan ikke reverseres."
          closeButtonOnClick={() => setModalOpen(false)}
        >
          <>
            <ModalButton
              text="Slett meg"
              onClick={deleteMe}
              type={ButtonType.DANGER}
            />
            <ModalButton
              text="Lukk"
              onClick={() => setModalOpen(false)}
              type={ButtonType.SECONDARY}
            />
          </>
        </Modal>
      )}
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
