import type { NextPage } from "next";
import useSWR from "swr";

import BackButton from "../../components/BackButton";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import EditableAvatar from "../../components/EditableAvatar";
import RequireUser from "../../components/RequireUser";
import CategoryInput from "../../components/inputs/CategoryInput";
import TextInputLong from "../../components/inputs/TextInputLong";
import useBack from "../../hooks/useBack";
import useProfileEdit from "../../hooks/useProfileEdit";
import type { User } from "../../types/types";
import { foodPreferenceOptions } from "../../utils/foodPreference";

import styles from "../../styles/EditProfile.module.scss";

const EditProfileForm = ({ user }: { user: User }) => {
  const goBack = useBack();
  const profile = useProfileEdit(user);
  const { data: allergens } =
    useSWR<{ id: number; name: string }[]>("/allergens");

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} />
      <EditableAvatar
        user={user}
        endpoint="/users/me"
        formDataKey="profileImage"
        onImageChanged={profile.reload}
      />
      <TextInputLong
        value={profile.description}
        handleChange={(e) => profile.setDescription(e.target.value)}
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
        options={foodPreferenceOptions()}
        value={profile.foodPreference ?? ""}
        inputId="foodPreference"
        setValue={profile.setFoodPreference}
        className={styles.foodPreference}
      />
      {allergens && (
        <CategoryInput
          title="Allergen(er)"
          activeCategories={profile.activeAllergens}
          onClick={profile.toggleAllergen}
          categories={allergens}
          errorMessage=""
        />
      )}
      {profile.validEdit && (
        <Button
          text="Lagre endringer"
          onClick={profile.save}
          className={styles.confirm}
        />
      )}
    </div>
  );
};

const EditProfile: NextPage = () => (
  <RequireUser>{(user) => <EditProfileForm user={user} />}</RequireUser>
);

export default EditProfile;
