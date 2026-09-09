import { FoodPreference } from "../types/types";

const FOOD_PREFERENCE_LABELS: Record<FoodPreference, string> = {
  [FoodPreference.VEGAN]: "Vegan 🌱",
  [FoodPreference.VEGETARIAN]: "Vegetar 🧀",
  [FoodPreference.PESCETARIAN]: "Pescetar 🐟",
  [FoodPreference.NO_PREFERENCE]: "Ingen preferanse 🤷",
};

function foodPreferenceLabel(preference: FoodPreference): string {
  return FOOD_PREFERENCE_LABELS[preference] ?? "";
}

export function foodPreferenceOptions() {
  return [
    { value: null, label: "", isDefault: true },
    ...Object.values(FoodPreference).map((value) => ({
      value,
      label: foodPreferenceLabel(value),
    })),
  ];
}
