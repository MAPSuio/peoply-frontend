import styles from "../styles/InputHeader.module.scss";

interface InputHeaderProps {
  title: string;
  children: React.ReactNode;
}

const InputHeader = ({ title, children }: InputHeaderProps) => {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
};

export default InputHeader;
