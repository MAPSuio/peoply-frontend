import { useRouter } from "next/router";

import ProgressBar from "./ProgressBar";
import PrimaryButton from "./PrimaryButton";

import styles from "../styles/InputPage.module.scss";
import BackButton from "./BackButton";

interface InputPageProps {
  step: number;
  title: string;
  subTitle: string;
  currentStep: number;
  stepCount: number;
  buttonText: string;
  validData: boolean;
  firstPage?: boolean;
  buttonOnClick: (step: number) => void;
  children: React.ReactNode;
}

const InputPage = ({
  step,
  title,
  subTitle,
  currentStep,
  stepCount,
  buttonText,
  validData,
  firstPage,
  buttonOnClick,
  children,
}: InputPageProps) => {
  const router = useRouter();

  const goBack = () => {
    if (firstPage) {
      router.push("/");
    } else {
      buttonOnClick(step - 1);
    }
  };

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} className={styles.marginBottomMedium} />
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
        <ProgressBar currentStep={currentStep} stepCount={stepCount} />
      </div>
      <div className={styles.inputContainer}>{children}</div>
      <PrimaryButton
        onClick={() => buttonOnClick(step + 1)}
        text={buttonText}
        className={styles.primaryButton}
        disabled={!validData}
      />
    </div>
  );
};

export default InputPage;
