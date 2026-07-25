import useSWR from "swr";
import styles from "../styles/admin.module.scss";

interface InfoCardProps {
  title: string;
  info?: string;
  endpoint: string;
}

const InfoCard = ({ title, info, endpoint }: InfoCardProps) => {
  const { data: registrations } = useSWR<number>(endpoint);

  return (
    <div className={styles.card}>
      <h1 className={styles.h1}>{title}</h1>
      {info && <p>{info}</p>}
      <h2 className={styles.numberText}>+ {registrations}</h2>
    </div>
  );
};

export default InfoCard;
