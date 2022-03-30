import ProgressCircle from "./ProgressCircle";
import ProgressConnector from "./ProgressConnector";

import {
  arrayFromRange,
  getInputPageName,
  getProgressCircleLabel,
} from "../utils/functions";
import styles from "../styles/ProgressBar.module.scss";

interface ProgressBarProps {
  currentStep: number;
  reachedStep: number;
  stepCount: number;
  validDataMap: Map<string, boolean>;
  changeStep: (step: number) => void;
}

const ProgressBar = ({
  currentStep,
  reachedStep,
  stepCount,
  validDataMap,
  changeStep,
}: ProgressBarProps) => {
  const steps = arrayFromRange(stepCount);

  return (
    <div className={styles.progressBarContainer}>
      {steps.map((step) => {
        const pageName = getInputPageName(step);
        const pageNameNext = getInputPageName(step + 1);
        const label = getProgressCircleLabel(step);
        const active = step === currentStep;
        const success = validDataMap.get(pageName);
        const nextSuccess = validDataMap.get(pageNameNext);
        const last = step === stepCount - 1;

        return (
          <>
            <ProgressCircle
              key={step}
              success={success}
              active={active}
              label={label}
              step={step}
              reachedStep={reachedStep}
              changeStep={changeStep}
            />
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
