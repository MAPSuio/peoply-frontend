import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { useRouter } from "next/router";
import CheckCircle from "../components/CheckCircle";
import PrimaryButton from "../components/PrimaryButton";
import BackButton from "../components/BackButton";
import useUser from "../hooks/useUser";
import styles from "../styles/Login.module.scss";
import MobileLoginIllustration from "../components/svgs/MobileLoginIllustration";
import ContinueWithVippsButton from "../components/svgs/ContinueWithVippsButton";
import Link from "next/link";
import HeadComponent from "../components/HeadComponent";

const Login: NextPage = ({
  baseUrl,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { user } = useUser();
  const router = useRouter();

  /* formats date to fit card format (DD. Month YYYY) */
  const formatDate = (date: Date) => {
    return `${date.getDate()}. ${date.toLocaleString("no", {
      month: "long",
    })} ${date.getFullYear()}`;
  };

  return (
    <>
      <HeadComponent
        title="Peoply - Home"
        description="Home page of Peoply"
        url={`${baseUrl}${router.asPath}`}
      />
      {user ? (
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
                >{`${user.firstName} ${user.lastName}`}</p>
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
                  {formatDate(new Date(user.birthDate))}
                </p>
              </div>
              <div className={styles.checkContainer}>
                <CheckCircle />
              </div>
            </div>
            <Link href="/" passHref>
              <PrimaryButton
                isLink
                text="Fortsett til appen"
                className={styles.primaryButton}
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.loginWrapper}>
          <div className={styles.loginContainer}>
            <BackButton onClick={() => router.push("/")} />
            <div className={styles.loginHeaderContainer}>
              <h1>Logg inn</h1>
              <p>Logg inn eller opprett en bruker</p>
            </div>
            <div className={styles.loginIllustration}>
              <MobileLoginIllustration />
            </div>
            <div className={styles.loginButtonContainer}>
              <a href={`${process.env.NEXT_PUBLIC_API_URL}/auth/login`}>
                <ContinueWithVippsButton />
              </a>
              <p className={styles.loginButtonText}>
                Hvis du har logget inn før, vil du bli tatt til din gamle
                bruker. Hvis ikke vil en ny bruker bli opprettet
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  return {
    props: {
      baseUrl,
    },
  };
};

export default Login;
