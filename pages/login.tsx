import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import CheckCircle from "../components/CheckCircle";
import ConfirmButton from "../components/ConfirmButton";
import BackButton from "../components/BackButton";
import useUser from "../hooks/useUser";
import styles from "../styles/Login.module.scss";

const Login: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  /* formats date to fit card format (DD. Month YYYY) */
  const formatDate = (date: Date) => {
    return `${date.getDate()}. ${date.toLocaleString("no", {
      month: "long",
    })} ${date.getFullYear()}`;
  };

  if (user) {
    return (
      <div className={styles.loginWrapper}>
        <div className={styles.loginContainer}>
          <div className={styles.loginHeaderContainer}>
            <h1>Du er logget inn</h1>
            <p>Vi har hentet dataene dine fra Vipps</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardSection}>
              <p className={styles.sectionName}>Navn</p>
              <p
                className={styles.sectionData}
              >{`${user.first_name} ${user.last_name}`}</p>
            </div>
            <div className={styles.cardSection}>
              <p className={styles.sectionName}>Email</p>
              <p className={styles.sectionData}>{user.email}</p>
            </div>
            <div className={styles.cardSection}>
              <p className={styles.sectionName}>Telefonnummer</p>
              <p className={styles.sectionData}>{user.phone}</p>
            </div>
            <div className={styles.cardSection}>
              <p className={styles.sectionName}>Fødselsdato</p>
              <p className={styles.sectionData}>
                {formatDate(new Date(user.birth_date))}
              </p>
            </div>
            <div className={styles.checkContainer}>
              <CheckCircle />
            </div>
          </div>
          <ConfirmButton
            onClick={() => {
              router.push("/");
            }}
            text="Fortsett til appen"
            className={styles.confirmButton}
          />
        </div>
      </div>
    );
  }
  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginContainer}>
        <BackButton onClick={() => router.push("/", {})} />
        <div className={styles.loginHeaderContainer}>
          <h1>Logg inn</h1>
          <p>Logg inn eller opprett en bruker</p>
        </div>
        <Image
          src={"/assets/undraw_mobile_login.svg"}
          height={350}
          width={350}
          alt="Logg inn med Vipps"
        />
        <div className={styles.loginButtonContainer}>
          <a href={`${process.env.API_URL}/auth/login`}>
            <Image
              src={"/assets/continue_with_vipps_rect_250_NO.svg"}
              height={50}
              width={250}
              alt="Logg inn med Vipps"
            />
          </a>
          <p className={styles.loginButtonText}>
            Hvis du har logget inn før, vil du bli tatt til din gamle bruker.
            Hvis ikke vil en ny bruker bli opprettet
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
