// Next.js.
import { useRouter } from "next/router";

// Components.
import ProgressBar from "./ProgressBar";
import Button from "./Button";
import BackButton from "./BackButton";

// Assets.
import type { InputPages } from "../types/types";

// Styles.
import styles from "../styles/InputPage.module.scss";
import CloseIcon from "./svgs/CloseIcon";
import Link from "./Link";

interface InputPageProps {
  step: number;
  title: string;
  subTitle: string;
  currentStep: number;
  reachedStep: number;
  stepCount: number;
  buttonText: string;
  validDataMap: Map<InputPages, boolean>;
  page: InputPages;
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
  reachedStep,
  stepCount,
  buttonText,
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

  const validData = validDataMap.get(page);

  if (setEventImageValid) {
    setEventImageValid(true);
  }

  if (setEventExtraInfoValid) {
    setEventExtraInfoValid(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.actionContainer}>
        <BackButton onClick={goBack} />
        <Link href="/" className={styles.close}>
          <CloseIcon />
        </Link>
      </div>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subTitle}>{subTitle}</p>
      </div>
      <div className={styles.layout}>
        <aside className={styles.progressRail}>
          <ProgressBar
            currentStep={currentStep}
            reachedStep={reachedStep}
            stepCount={stepCount}
            validDataMap={validDataMap}
            changeStep={buttonOnClick}
          />
        </aside>
        <div className={styles.main}>
          <div className={styles.childrenContainer}>{children}</div>
          <div className={styles.ctaBar}>
            <Button
              onClick={() => buttonOnClick(step + 1)}
              text={buttonText}
              className={styles.primaryButton}
              disabled={!validData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPage;
