// Next.js.
import { useRouter } from "next/router";

// Components.
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import BackButton from "./BackButton";

// Assets.
import { InputPages } from "../types/types";

// Styles.
import styles from "../styles/InputPage.module.scss";

interface InputPageProps {
  step: number;
  title: string;
  subTitle: string;
  currentStep: number;
  reachedStep: number;
  stepCount: number;
  buttonText: string;
  placeButtonStatic?: boolean;
  validDataMap: Map<InputPages, boolean>;
  page: InputPages;
  setEventImageValid?: (eventImageValid: boolean) => void;
  setEventExtraInfoValid?: (eventExtraInfoValid: boolean) => void;
  firstPage?: boolean;
  padding?: boolean;
  buttonOnClick: (step: number) => void;
  children: React.ReactNode;
}

const InputPage = ({
  step,
  title,
  subTitle,
  currentStep,
  reachedStep,
  stepCount,
  buttonText,
  placeButtonStatic,
  validDataMap,
  page,
  setEventImageValid,
  setEventExtraInfoValid,
  firstPage,
  padding,
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
    <div className={`${styles.container} ${padding && styles.padding}`}>
      <BackButton onClick={goBack} className={styles.marginBottomMedium} />
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
      </div>
      <div className={styles.inputContainer}>
        <div className={styles.progressBarContainer}>
          <ProgressBar
            currentStep={currentStep}
            reachedStep={reachedStep}
            stepCount={stepCount}
            validDataMap={validDataMap}
            changeStep={buttonOnClick}
          />
        </div>
        <div className={styles.childrenContainer}>{children}</div>
      </div>
      <Button
        onClick={() => buttonOnClick(step + 1)}
        text={buttonText}
        className={buttonStyles}
        disabled={!validData}
      />
    </div>
  );
};

export default InputPage;
