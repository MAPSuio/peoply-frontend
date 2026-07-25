import { NextPage } from "next";
import { ChangeEvent, useEffect, useState } from "react";
import Avatar from "../../components/Avatar";
import BackButton from "../../components/BackButton";
import EditProfileImageMenu from "../../components/EditProfileImageMenu";
import TextInputLong from "../../components/inputs/TextInputLong";
import MenuModal from "../../components/MenuModal";
import Button from "../../components/Button";
import useBack from "../../hooks/useBack";
import useRedirectToLogin from "../../hooks/useRedirectToLogin";
import useSnack from "../../hooks/useSnack";
import useUser from "../../hooks/useUser";
import { fetchFromPeoplyApiJson } from "../../services/fetchers";
import styles from "../../styles/EditProfile.module.scss";
import { FoodPreference, SnackTypes } from "../../types/types";
import Dropdown from "../../components/Dropdown";
import CategoryInput from "../../components/inputs/CategoryInput";
import useSWR from "swr";

const EditProfile: NextPage = () => {
  const goBack = useBack();
  const [editImage, setEditImage] = useState(false);
  const { user, loading, reload } = useUser();
  const [description, setDescription] = useState("");
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(
    null,
  );
  const [activeAllergens, setActiveAllergens] = useState<number[]>([]);
  const redirectToLogin = useRedirectToLogin();

  const { data: allergens } =
    useSWR<{ id: number; name: string }[]>("/allergens");

  const { addSnack } = useSnack();
  useEffect(() => {
    if (user?.description) {
      setDescription(user.description);
    }
    if (user?.foodPreference) {
      setFoodPreference(user.foodPreference);
    }
    if (user?.userAllergens && user?.userAllergens?.length > 0) {
      setActiveAllergens(
        user?.userAllergens?.map((allergen) => allergen.allergenId),
      );
    }
  }, [user]);

  if (!loading && !user) {
    redirectToLogin();
  }

  if (!user) return <></>;

  const handleEditImageModalClose = () => {
    setEditImage(false);
    reload();
  };

  const updateUserDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  };

  const handleConfirm = async () => {
    try {
      await fetchFromPeoplyApiJson("/users/me", {
        method: "PATCH",
        body: JSON.stringify({
          description,
          foodPreference,
          allergens: activeAllergens,
        }),
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
      reload();
      addSnack("Profil oppdatert", SnackTypes.SUCCESS);
    } catch {
      addSnack("Klarte ikke å oppdatere profilen", SnackTypes.ERROR);
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

  const validDescriptionEdit =
    !(!user?.description && description === "") && // user.desc might be null if user has not edited yet - meaning we should not show confirm button
    user?.description !== description;
  const validFoodPreferenceEdit =
    foodPreference && user?.foodPreference !== foodPreference;
  const validAllergenEdit =
    activeAllergens.length !== user?.userAllergens?.length;
  const validEdit =
    validDescriptionEdit || validFoodPreferenceEdit || validAllergenEdit;

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <button
        className={styles.editImageButton}
        onClick={() => setEditImage(true)}
      >
        <Avatar user={user} size="large" edit />
      </button>
      <TextInputLong
        value={description}
        handleChange={updateUserDescription}
        inputName="userDescription"
        inputId="userDescription"
        rows={5}
        label="Beskrivelse"
        placeholder=""
        maxLength={120}
        errorMessage=""
        className={styles.description}
      />
      <Dropdown
        label="Matpreferanse"
        options={generateFoodPreferenceOptions()}
        value={foodPreference ?? ""}
        inputId="foodPreference"
        setValue={setFoodPreference}
        className={styles.foodPreference}
      />
      {allergens && (
        <CategoryInput
          title="Allergen(er)"
          activeCategories={activeAllergens}
          onClick={(id: number) =>
            setActiveAllergens((prev) => {
              if (activeAllergens.includes(id)) {
                return prev.filter((allergen) => allergen !== id);
              }
              return [...prev, id];
            })
          }
          categories={allergens}
          errorMessage=""
        />
      )}
      {validEdit && (
        <Button
          disabled={!validEdit}
          text="Lagre endringer"
          onClick={handleConfirm}
          className={styles.confirm}
        />
      )}
      {editImage && (
        <MenuModal label="Endre bilde" onClose={handleEditImageModalClose}>
          <EditProfileImageMenu
            onClose={handleEditImageModalClose}
            endpoint="/users/me"
            formDataKey="profileImage"
          />
        </MenuModal>
      )}
    </div>
  );
};

export default EditProfile;
