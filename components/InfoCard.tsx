import useSWR from "swr";
import { ApiError } from "../services/apiError";
import styles from "../styles/admin.module.scss";

interface InfoCardProps {
  title: string;
  info?: string;
  endpoint: string;
}

const InfoCard = ({ title, info, endpoint }: InfoCardProps) => {
  const { data, error, isLoading } = useSWR<number>(endpoint);

  return (
    <div className={styles.card}>
      <h1 className={styles.h1}>{title}</h1>
      {info && <p>{info}</p>}
      {error ? (
        <p className={styles.errorText}>
          {error instanceof ApiError && error.status === 403
            ? "Du mangler tilgang til dette tallet"
            : "Kunne ikke hente tallet"}
        </p>
      ) : (
        <h2 className={styles.numberText}>{isLoading ? "…" : `+ ${data}`}</h2>
      )}
    </div>
  );
};

export default InfoCard;
