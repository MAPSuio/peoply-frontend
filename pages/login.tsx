import { NextPage } from "next";
import Image from "next/image";
import styles from "../styles/Login.module.scss";

const Login: NextPage = () => {
  return (
    <div className={styles.loginContainer}>
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
        <a href="http://localhost:3000/auth/login">
          <Image
            src={"/assets/continue_with_vipps_rect_250_NO.svg"}
            height={50}
            width={250}
            alt="Logg inn med Vipps"
          />
        </a>
        <p className={styles.loginButtonText}>
          Hvis du har logget inn før, vil du bli tatt til din gamle bruker. Hvis
          ikke vil en ny bruker bli opprettet
        </p>
      </div>
    </div>
  );
};

export default Login;
