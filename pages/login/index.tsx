import type { NextPage } from "next";
import { useRouter } from "next/router";
import CheckCircle from "../../components/CheckCircle";
import Button from "../../components/Button";
import BackButton from "../../components/BackButton";
import useUser from "../../hooks/useUser";
import styles from "../../styles/Login.module.scss";
import MobileLoginIllustration from "../../components/svgs/MobileLoginIllustration";
import ContinueWithVippsButton from "../../components/svgs/ContinueWithVippsButton";
import GoogleLogo from "../../components/svgs/GoogleLogo";
import Link from "../../components/Link";
import HeadComponent from "../../components/HeadComponent";
import { API_URL } from "../../constants/urls";
import { useEffect, useState } from "react";
import { toSafeRedirectPath } from "../../utils/redirect";

const Login: NextPage = () => {
  const { user, loading } = useUser();
  const router = useRouter();
  const [redirectURL, setRedirectURL] = useState<string>("/");

  useEffect(() => {
    const redirectUrlFromLocalStorage = localStorage.getItem("redirectURL");
    if (redirectUrlFromLocalStorage) {
      setRedirectURL(toSafeRedirectPath(redirectUrlFromLocalStorage));
      localStorage.removeItem("redirectURL");
    }
  }, []);

  useEffect(() => {
    if (router.query.redirect) {
      // Never leaves this page as anything but a path on this site: it is
      // stashed in localStorage and handed to router.push after the OAuth hop,
      // where a scheme would become a hard navigation.
      setRedirectURL(toSafeRedirectPath(router.query.redirect));
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
              <p>Dette er brukeren din</p>
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
              {/* Google supplies neither, so accounts created there leave
                  both empty until a Vipps identity is linked. */}
              {user.phone && (
                <div className={styles.cardSection}>
                  <p className={styles.sectionName}>Telefonnummer</p>
                  <p className={styles.sectionData}>{user.phone}</p>
                </div>
              )}
              {user.birthDate && (
                <div className={styles.cardSection}>
                  <p className={styles.sectionName}>Fødselsdato</p>
                  <p className={styles.sectionData}>
                    {formatDate(new Date(user.birthDate))}
                  </p>
                </div>
              )}
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
              <a
                className={styles.providerButton}
                href={`${API_URL}/auth/login/google`}
                onClick={() => {
                  if (redirectURL) {
                    localStorage.setItem("redirectURL", redirectURL);
                  }
                  return true;
                }}
              >
                <GoogleLogo />
                <span className={styles.providerButtonText}>
                  Fortsett med Google
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
