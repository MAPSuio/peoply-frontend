import Link from "next/link";
import styles from "../styles/ResultItem.module.scss";

interface ResultItemProps {
  title: string;
  children: React.ReactNode;
  description?: string;
  link: string;
}

/* a more generalized MemberCard component */
export default function ResultItem({
  title,
  link,
  description,
  children,
}: ResultItemProps) {
  return (
    <Link href={link}>
      <div className={styles.container}>
        <div className={styles.info}>
          {children}
          <div className={styles.name}>
            <p>{title}</p>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
}
