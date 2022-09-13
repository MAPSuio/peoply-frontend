import { FoodPreference } from "../types/types";
import styles from "../styles/FoodPreferenceDisplay.module.scss";

interface FoodPreferenceDisplayProps {
  foodPreferenceMap: Map<FoodPreference, number>;
}

export default function FoodPreferenceDisplay({
  foodPreferenceMap,
}: FoodPreferenceDisplayProps) {
  function valueToEmoji(preference: FoodPreference) {
    switch (preference) {
      case FoodPreference.VEGAN:
        return "🌱 vegan:";
      case FoodPreference.VEGETARIAN:
        return "🧀 vegetar:";
      case FoodPreference.PESCETARIAN:
        return "🐟 pescetar:";
      default:
        return "🤷 ingen preferanser:";
    }
  }

  return (
    <div className={styles.container}>
      {Array.from(foodPreferenceMap.entries())
        .sort((a, b) => {
          const getOrder = (preference: FoodPreference) => {
            switch (preference) {
              case FoodPreference.VEGAN:
                return 3;
              case FoodPreference.VEGETARIAN:
                return 2;
              case FoodPreference.PESCETARIAN:
                return 1;
              default:
                return 0;
            }
          };
          return getOrder(a[0]) - getOrder(b[0]);
        })
        .map(([preference, count]) => {
          return (
            <div key={preference} className={styles.foodPreference}>
              <span className={styles.emoji}>{valueToEmoji(preference)}</span>
              <span className={styles.count}>{count}</span>
            </div>
          );
        })}
    </div>
  );
}
