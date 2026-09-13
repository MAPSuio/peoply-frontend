import { useEffect, useState } from "react";

import { fetchFromPeoplyApiJson } from "../services/fetchers";
import { type FoodPreference, SnackTypes, type User } from "../types/types";
import useSnack from "./useSnack";
import useUser from "./useUser";

function changedFromStored(stored: string | undefined, current: string) {
  return !(!stored && current === "") && stored !== current;
}

export default function useProfileEdit(user: User) {
  const { reload } = useUser();
  const { addSnack } = useSnack();
  const [description, setDescription] = useState("");
  const [foodPreference, setFoodPreference] = useState<FoodPreference | null>(
    null,
  );
  const [activeAllergens, setActiveAllergens] = useState<number[]>([]);

  useEffect(() => {
    setDescription(user.description ?? "");
    setFoodPreference(user.foodPreference ?? null);
    setActiveAllergens(
      (user.userAllergens ?? []).map((allergen) => allergen.allergenId),
    );
  }, [user]);

  const save = async () => {
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

  return {
    description,
    setDescription,
    foodPreference,
    setFoodPreference,
    activeAllergens,
    toggleAllergen: (allergenId: number) =>
      setActiveAllergens((current) =>
        current.includes(allergenId)
          ? current.filter((allergen) => allergen !== allergenId)
          : [...current, allergenId],
      ),
    validEdit: Boolean(
      changedFromStored(user.description, description) ||
        (foodPreference && user.foodPreference !== foodPreference) ||
        activeAllergens.length !== user.userAllergens?.length,
    ),
    reload,
    save,
  };
}
