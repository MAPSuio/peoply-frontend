import { useRouter } from "next/router";

import ProgressBar from "./ProgressBar";
import PrimaryButton from "./PrimaryButton";
import BackButton from "./BackButton";

import styles from "../styles/InputPage.module.scss";

interface InputPageProps {
  step: number;
  title: string;
  subTitle: string;
  currentStep: number;
  stepCount: number;
  buttonText: string;
  placeButtonStatic?: boolean;
  validDataMap: Map<string, boolean>;
  page: string;
  setEventImageValid?: (eventImageValid: boolean) => void;
  setEventExtraInfoValid?: (eventExtraInfoValid: boolean) => void;
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
  placeButtonStatic,
  validDataMap,
  page,
  setEventImageValid,
  setEventExtraInfoValid,
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

  const getButtonStyles = () => {
    if (placeButtonStatic) {
      return `${styles.primaryButton} ${styles.placeStatic}`;
    } else {
      return styles.primaryButton;
    }
  };

  const buttonStyles = getButtonStyles();

  const validData = validDataMap.get(page);

  if (setEventImageValid) {
    setEventImageValid(true);
  }

  if (setEventExtraInfoValid) {
    setEventExtraInfoValid(true);
  }

  return (
    <div className={styles.container}>
      <BackButton onClick={goBack} className={styles.marginBottomMedium} />
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
        <ProgressBar
          currentStep={currentStep}
          stepCount={stepCount}
          validDataMap={validDataMap}
        />
      </div>
      <div className={styles.inputContainer}>{children}</div>
      <PrimaryButton
        onClick={() => buttonOnClick(step + 1)}
        text={buttonText}
        className={buttonStyles}
        disabled={!validData}
      />
    </div>
  );
};

export default InputPage;
