import ProgressCircle from "./ProgressCircle";
import ProgressConnector from "./ProgressConnector";

import { arrayFromRange, getInputPageName } from "../utils/functions";
import styles from "../styles/ProgressBar.module.scss";

interface ProgressBarProps {
  currentStep: number;
  stepCount: number;
  validDataMap: Map<string, boolean>;
}

const ProgressBar = ({
  currentStep,
  stepCount,
  validDataMap,
}: ProgressBarProps) => {
  const steps = arrayFromRange(stepCount);

  return (
    <div className={styles.progressBarContainer}>
      {steps.map((step) => {
        const pageName = getInputPageName(step);
        const pageNameNext = getInputPageName(step + 1);
        const active = step === currentStep;
        const success = validDataMap.get(pageName);
        const nextSuccess = validDataMap.get(pageNameNext);
        const last = step === stepCount - 1;

        return (
          <>
            <ProgressCircle key={step} success={success} active={active} />
            {!last && (
              <ProgressConnector
                key={step}
                success={success}
                nextSuccess={nextSuccess}
              />
            )}
          </>
        );
      })}
    </div>
  );
};

export default ProgressBar;
