import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import useBack from "../../hooks/useBack";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import useSnack from "../../hooks/useSnack";
import useUser from "../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import styles from "../../styles/EditFoodPreference.module.scss";
import { FoodPreference, SnackTypes } from "../../types/types";
import Dropdown from "../../components/Dropdown";

const FoodPreferences: NextPage = () => {
  const goBack = useBack();
  const { user, loading, reload } = useUser();
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(
    null,
  );
  const redirectToLogin = useRedirectToLogin();

  const { addSnack } = useSnack();
  useEffect(() => {
    if (user?.foodPreference) {
      setFoodPreference(user.foodPreference);
    }
  }, [user]);

  if (!loading && !user) {
    redirectToLogin();
  }

  if (!user) return <></>;

  const handleConfirm = async () => {
    try {
      await fetchFromPeoplyApiJson("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ foodPreference }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      reload();
      addSnack("Matpreferanser oppdatert", SnackTypes.SUCCESS);
    } catch {
      addSnack("Klarte ikke å oppdatere matpreferanser", SnackTypes.ERROR);
    }
  };

  function generateFoodPreferenceOptions() {
    function valueToLabel(preference: FoodPreference) {
      switch (preference) {
        case FoodPreference.VEGAN:
          return "Vegan 🌱";
        case FoodPreference.VEGETARIAN:
          return "Vegetar 🧀";
        case FoodPreference.PESCETARIAN:
          return "Pescetar 🐟";
        case FoodPreference.NO_PREFERENCE:
          return "Ingen preferanse 🤷";
        default:
          return "";
      }
    }

    return [
      { value: null, label: "", isDefault: true },
      ...Object.entries(FoodPreference).map(([key, value]) => {
        return {
          value: key,
          label: valueToLabel(value),
        };
      }),
    ];
  }

  const validFoodPreferenceEdit =
    foodPreference && user?.foodPreference !== foodPreference;

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <Avatar user={user} size="large" />
      <Dropdown
        label="Matpreferanse"
        options={generateFoodPreferenceOptions()}
        value={foodPreference ?? ""}
        inputId="foodPreference"
        setValue={setFoodPreference}
        className={styles.foodPreference}
      />
      {validFoodPreferenceEdit && (
        <Button
          disabled={!validFoodPreferenceEdit}
          text="Lagre endringer"
          onClick={handleConfirm}
          className={styles.confirmButton}
        />
      )}
    </div>
  );
};

export default FoodPreferences;
