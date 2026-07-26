/* Hooks. */
import useUser from "../../hooks/useUser";
import useBack from "../../hooks/useBack";
import { useTheme } from "next-themes";

/* Components. */
import BackButton from "../../components/BackButton";
import SettingsButton from "../../components/SettingsButton";
import RadioInputSmall from "../../components/inputs/RadioInputSmall";

import SunsetIcon from "../../components/svgs/SunsetIcon";
import NightIcon from "../../components/svgs/NightIcon";
import SunIcon from "../../components/svgs/SunIcon";

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
import Button from "../../components/Button";
import CheckboxInput from "../../components/inputs/CheckboxInput";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import useSnack from "../../hooks/useSnack";
import {
  getBackgroundPatternEnabled,
  setBackgroundPatternEnabled,
} from "../../utils/backgroundPattern";

const Settings = () => {
  const [allowEmailNotifications, setAllowEmailNotifications] = useState(true);
  const [allowEmailFromArranger, setAllowEmailFromArranger] = useState(true);
  const [allowEmailPromotions, setAllowEmailPromotions] = useState(true);
  const [backgroundPatternEnabled, setBackgroundPatternPreference] = useState(
    () => getBackgroundPatternEnabled(),
  );
  const { theme, setTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
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
      setEmail(user?.email ?? "");
    }
  }, [allowEmailFromArranger, allowEmailPromotions, user?.email]);

  if (loading) {
    /* TODO: Create actual loading skeleton. */
    return <h1>Loading...</h1>;
  } else if (!user && !loading) {
    router.push("/");
  }

  const updateTheme = (id: number) => {
    if (id === 1) {
      setTheme("dark");
    } else if (id === 2) {
      setTheme("night");
    } else if (id === 3) {
      setTheme("light");
    }
  };

  const toggleBackgroundPattern = () => {
    const nextValue = !backgroundPatternEnabled;

    setBackgroundPatternPreference(nextValue);
    setBackgroundPatternEnabled(nextValue);
  };

  const validAllowEmailFromArrangerEdit =
    allowEmailFromArranger !== user?.allowEmailFromArranger;
  const validAllowEmailPromotionsEdit =
    allowEmailPromotions !== user?.allowEmailPromotions;
  const validEdit =
    validAllowEmailFromArrangerEdit ||
    validAllowEmailPromotionsEdit ||
    email !== user?.email;

  const handleConfirm = async () => {
    try {
      const body = {
        ...(validAllowEmailFromArrangerEdit && {
          allowEmailFromArranger,
          allowEmailOnWaitlist: allowEmailFromArranger,
        }),
        ...(validAllowEmailPromotionsEdit && { allowEmailPromotions }),
      };

      await fetchFromPeoplyApiJson("/users/me", {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      addSnack("Innstillinger oppdatert", SnackTypes.SUCCESS);
      reload();
      goBack();
    } catch {
      addSnack("Kunne ikke oppdatere innstillinger", SnackTypes.ERROR);
    }
  };

  return (
    <>
      <HeadComponent
        title="Innstillinger"
        description="Her kan du endre innstillinger for din bruker."
        path="/me/settings"
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
              <h2 className={styles.inputHeader}>Visning/tema</h2>
              <RadioInputSmall
                optionsAndIcons={[
                  {
                    id: 1,
                    text: "Skumring",
                    icon: SunsetIcon,
                    active: theme === "dark",
                  },
                  {
                    id: 2,
                    text: "Natt",
                    icon: NightIcon,
                    active: theme === "night",
                  },
                  {
                    id: 3,
                    text: "Dag",
                    icon: SunIcon,
                    active: theme === "light",
                  },
                ]}
                onClick={updateTheme}
              />
              <SwitchInput
                label="Vis bakgrunnsmønster"
                checked={backgroundPatternEnabled}
                onClick={toggleBackgroundPattern}
              />
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Epost</h2>
              <SwitchInput
                label="Tillat oppdateringer på epost"
                checked={allowEmailNotifications}
                onClick={() => {
                  if (allowEmailNotifications) {
                    setAllowEmailFromArranger(false);
                    setAllowEmailPromotions(false);
                    setEmail(user?.email ?? "");
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
                </div>
              )}
            </div>
            <div className={styles.section}>
              <h2 className={styles.inputHeader}>Min bruker</h2>
              <div className={styles.userContainer}>
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
        </Modal>
      )}
    </>
  );
};

export default Settings;
