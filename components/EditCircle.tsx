import styles from "../styles/EditCircle.module.scss";
import EditIcon from "./svgs/EditIcon";

const EditCircle = ({ className }: { className: string }) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <EditIcon />
    </div>
  );
};

export default EditCircle;
