import { FoodPreference } from "../types/types";
import styles from "../styles/FoodPreferenceDisplay.module.scss";

interface FoodPreferenceDisplayProps {
  foodPreferenceMap: Map<FoodPreference, Map<string, number>>;
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
    <div className={styles.outerContainer}>
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
          .map(([preference, allergensMap]) => {
            return (
              <div key={preference} className={styles.foodPreference}>
                <span className={styles.emoji}>
                  {valueToEmoji(preference)}{" "}
                </span>
                <span className={styles.count}>
                  {Array.from(allergensMap.values()).reduce(
                    (acc, curr) => acc + curr,
                    0,
                  )}
                </span>
              </div>
            );
          })}
      </div>
      <div className={styles.outerAllergenContainer}>
        <h4>Allergen-kombinasjoner</h4>
        <span>
          Under følger en oversikt over hva slags allergen-kombinasjoner som
          finnes blant deltakerne og hvor mange som har hver kombinasjon.
        </span>
        <div className={styles.allergenContainer}>
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
            .map(([preference, allergensMap]) => {
              return (
                <div key={preference} className={styles.foodPreference}>
                  <span className={styles.emoji}>
                    {valueToEmoji(preference)}{" "}
                  </span>
                  <ul className={styles.count}>
                    {Array.from(allergensMap.entries())
                      .sort((a, b) => b[1] - a[1])
                      .map(([allergen, count]) => {
                        if (allergen !== "") {
                          return (
                            <li key={allergen}>
                              <span className={styles.allergen}>
                                {allergen} ({count})
                              </span>
                            </li>
                          );
                        } else {
                          return (
                            <li key={allergen}>
                              <span className={styles.allergen}>
                                Ingen allergier ({count})
                              </span>
                            </li>
                          );
                        }
                      })}
                  </ul>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
