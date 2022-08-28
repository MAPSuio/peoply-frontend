import styles from "../styles/Layout.module.scss";
import { Alignment } from "../types/types";

interface LayoutProps {
  children: React.ReactNode;
  align?: Alignment;
}

const Layout = ({ children, align }: LayoutProps) => {
  const containerStyles = (() => {
    switch (align) {
      case Alignment.LEFT:
        return `${styles.container} ${styles.left}`;
      case Alignment.CENTER:
        return `${styles.container} ${styles.center}`;
      case Alignment.RIGHT:
        return `${styles.container} ${styles.right}`;
      default:
        return styles.container;
    }
  })();

  return (
    <div className={styles.wrapper}>
      <div className={containerStyles}>{children}</div>
    </div>
  );
};

export default Layout;
