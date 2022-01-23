import ProgressCircle from "./ProgressCircle";
import ProgressConnector from "./ProgressConnector";

import { arrayFromRange } from "../utils/functions";
import styles from "../styles/ProgressBar.module.scss";

interface ProgressBarProps {
  currentStep: number;
  stepCount: number;
}

const ProgressBar = ({ currentStep, stepCount }: ProgressBarProps) => {
  const steps = arrayFromRange(stepCount);

  return (
    <div className={styles.progressBarContainer}>
      {steps.map((step) => {
        const active = step === currentStep;
        const success = step < currentStep;
        const nextActive = step === currentStep - 1;
        const last = step === stepCount - 1;

        return (
          <>
            <ProgressCircle key={step} success={success} active={active} />
            {!last && (
              <ProgressConnector
                key={step}
                success={success}
                nextActive={nextActive}
              />
            )}
          </>
        );
      })}
    </div>
  );
};

export default ProgressBar;
