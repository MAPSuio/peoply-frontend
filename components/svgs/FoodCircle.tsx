import styles from "../../styles/FoodCircle.module.scss";
import FoodIcon from "./FoodIcon";

interface FoodCircleProps {
  className?: string;
}

export default function FoodCircle({ className }: FoodCircleProps) {
  return (
    <div className={`${styles.container} ${className ?? ""}`}>
      <FoodIcon />
    </div>
  );
}
