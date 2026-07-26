import { FoodPreference, ButtonType } from "../types/types";
import CategoryInput from "./inputs/CategoryInput";
import Dropdown from "./Dropdown";
import Modal from "./Modal";
import ModalButton from "./ModalButton";
import styles from "../styles/JoinButton.module.scss";

interface FoodPreferenceModalProps {
  foodPreference?: FoodPreference;
  onFoodPreferenceChange: (foodPreference?: FoodPreference) => void;
  allergens?: { id: number; name: string }[];
  showAllergenInput: boolean;
  activeAllergens: number[];
  onToggleAllergen: (id: number) => void;
  saveDisabled: boolean;
  onSave: () => void;
  onClose: () => void;
}

export default function FoodPreferenceModal({
  foodPreference,
  onFoodPreferenceChange,
  allergens,
  showAllergenInput,
  activeAllergens,
  onToggleAllergen,
  saveDisabled,
  onSave,
  onClose,
}: FoodPreferenceModalProps) {
  return (
    <Modal
      label={`Arrangementet har matservering`}
      description="For å melde deg på arrangementet må du fylle ut matpreferanser på profilen din. Dette kan endres på profilen din senere."
      closeButtonOnClick={onClose}
    >
      <div className={styles.modal}>
        <Dropdown
          className={styles.foodPreferenceDropdown}
          options={[
            {
              value: undefined,
              label: "Velg matpreferanse",
              isDefault: foodPreference !== undefined,
            },
            {
              value: FoodPreference.NO_PREFERENCE,
              label: "Ingen preferanse",
            },
            { value: FoodPreference.VEGETARIAN, label: "Vegetar" },
            { value: FoodPreference.VEGAN, label: "Veganer" },
            { value: FoodPreference.PESCETARIAN, label: "Pescetar" },
          ]}
          setValue={onFoodPreferenceChange}
          value={foodPreference}
          label="Matpreferanse"
          inputId="food-preference"
        />
        {showAllergenInput && allergens && (
          <CategoryInput
            title="Allergen(er)"
            activeCategories={activeAllergens}
            onClick={onToggleAllergen}
            categories={allergens}
            errorMessage=""
          />
        )}
        <ModalButton text="Lagre" onClick={onSave} disabled={saveDisabled} />
        <ModalButton
          text="Lukk"
          onClick={onClose}
          type={ButtonType.SECONDARY}
        />
      </div>
    </Modal>
  );
}
