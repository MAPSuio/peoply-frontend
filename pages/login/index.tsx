import type { NextPage } from "next";
import { useRouter } from "next/router";
import CheckCircle from "../../components/CheckCircle";
import Button from "../../components/Button";
import BackButton from "../../components/BackButton";
import useUser from "../../hooks/useUser";
import styles from "../../styles/Login.module.scss";
import MobileLoginIllustration from "../../components/svgs/MobileLoginIllustration";
import ContinueWithVippsButton from "../../components/svgs/ContinueWithVippsButton";
import Link from "next/link";
import HeadComponent from "../../components/HeadComponent";
import { API_URL } from "../../constants/urls";
import { useEffect, useState } from "react";

const Login: NextPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [redirectURL, setRedirectURL] = useState<string>("/");

  useEffect(() => {
    const redirectUrlFromLocalStorage = localStorage.getItem("redirectURL");
    if (redirectUrlFromLocalStorage) {
      setRedirectURL(redirectUrlFromLocalStorage);
      localStorage.removeItem("redirectURL");
    }
  }, []);

  useEffect(() => {
    if (router.query.redirect) {
      const redURL = router.query.redirect as string;
      setRedirectURL(redURL);
    }
  }, [router.query.redirect]);

  /* formats date to fit card format (DD. Month YYYY) */
  const formatDate = (date: Date) => {
    return `${date.getDate()}. ${date.toLocaleString("no", {
      month: "long",
    })} ${date.getFullYear()}`;
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <>
      <HeadComponent
        title="Logg inn"
        description="Logg inn på Peoply"
        path="/login"
      />
      {loading ? null : user ? (
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
                <CheckCircle className={styles.checkIcon} />
              </div>
            </div>
            <Link href={redirectURL}>
              <Button
                text="Fortsett til appen"
                className={styles.primaryButton}
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.loginWrapper}>
          <div className={styles.loginContainer}>
            <BackButton onClick={handleBack} />
            <div className={styles.loginHeaderContainer}>
              <h1>Logg inn</h1>
              <p>Logg inn eller opprett en bruker</p>
            </div>
            <div className={styles.loginIllustration}>
              <MobileLoginIllustration />
            </div>
            <div className={styles.loginButtonContainer}>
              <a
                href={`${API_URL}/auth/login`}
                onClick={() => {
                  if (redirectURL) {
                    localStorage.setItem("redirectURL", redirectURL);
                  }
                  return true;
                }}
              >
                <ContinueWithVippsButton />
              </a>
              <p className={styles.loginButtonText}>
                Hvis du har logget inn før, vil du bli tatt til din gamle
                bruker. Hvis ikke vil en ny bruker bli opprettet
              </p>
              <p className={styles.loginButtonText}>
                <a
                  href={`${API_URL}/auth/login/google`}
                  onClick={() => {
                    if (redirectURL) {
                      localStorage.setItem("redirectURL", redirectURL);
                    }
                    return true;
                  }}
                >
                  Har du ikke Vipps?
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
