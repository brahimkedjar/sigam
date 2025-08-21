// components/ui/ProgressStepper.tsx
import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { useRouter } from 'next/router';
import styles from './ProgressStepper.module.css';

interface Props {
  steps: string[];
  currentStep: number;
}

const ProgressStepper: React.FC<Props> = ({ steps, currentStep }) => {
  const router = useRouter();

  const handleStepClick = (index: number) => {
    const stepNum = index + 1;

    // take current path (e.g. /demande/step4/page4)
    let basePath = router.asPath.split('/step')[0]; 

    // preserve query params if any (?id=8, etc.)
    const query = router.asPath.includes('?') ? router.asPath.split('?')[1] : '';

    // build new url
    const newUrl = `${basePath}/step${stepNum}/page${stepNum}${query ? `?${query}` : ''}`;

    router.push(newUrl);
  };

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressSteps}>
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLastStep = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div
                className={`${styles.stepContainer} ${styles.clickable}`}
                onClick={() => handleStepClick(index)}
              >
                <div
                  className={`
                    ${styles.stepContent}
                    ${isActive ? styles.activeStep : ''}
                    ${isCompleted ? styles.completedStep : ''}
                  `}
                >
                  <div className={styles.stepCircle}>
                    {isCompleted ? <FiCheck className={styles.stepIcon} /> : index + 1}
                  </div>
                  <div className={styles.stepLabel}>{label}</div>
                </div>
                {!isLastStep && (
                  <div
                    className={`
                      ${styles.stepConnector}
                      ${isCompleted ? styles.completedConnector : ''}
                    `}
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressStepper;
