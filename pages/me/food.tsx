import type { NextPage } from "next";
import { useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import useBack from "../../hooks/useBack";
import RequireUser from "../../components/RequireUser";
import useSnack from "../../hooks/useSnack";
import useUser from "../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import styles from "../../styles/EditFoodPreference.module.scss";
import { type FoodPreference, SnackTypes, type User } from "../../types/types";
import Dropdown from "../../components/Dropdown";
import { foodPreferenceOptions } from "../../utils/foodPreference";

const EditFoodPreference = ({ user }: { user: User }) => {
  const goBack = useBack();
  const { reload } = useUser();
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(
    null,
  );

  const { addSnack } = useSnack();
  useEffect(() => {
    if (user.foodPreference) {
      setFoodPreference(user.foodPreference);
    }
  }, [user]);

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

  const validFoodPreferenceEdit =
    foodPreference && user.foodPreference !== foodPreference;

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <Avatar user={user} size="large" />
      <Dropdown
        label="Matpreferanse"
        options={foodPreferenceOptions()}
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

const FoodPreferences: NextPage = () => (
  <RequireUser>{(user) => <EditFoodPreference user={user} />}</RequireUser>
);

export default FoodPreferences;
