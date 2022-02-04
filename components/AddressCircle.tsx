import AddressIcon from "./svgs/AddressIcon";

import styles from "../styles/AddressCircle.module.scss";

interface AddressCircleProps {
  className?: string;
}

const AddressCircle = ({ className }: AddressCircleProps) => {
  return (
    <div className={styles.container}>
      <AddressIcon className={className} />
    </div>
  );
};

export default AddressCircle;
