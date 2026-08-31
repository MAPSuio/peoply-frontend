// Components.
import ImageInput from "../inputs/ImageInput";
import InputPage from "../InputPage";

// Utils.
import { getInputPageData } from "../../utils/functions";

// Types.
import { InputPages } from "../../types/types";
import type { EventObjectProps } from "../../hooks/useCreateEventForm";

interface ImageStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  eventImageProcessing: boolean;
  buttonOnClick: (step: number) => void;
  setEventImageValid: (eventImageValid: boolean) => void;
  setEventImageProcessing: (eventImageProcessing: boolean) => void;
  updateEventImage: (eventImage: File) => void;
}

const ImageStep = ({
  eventObject,
  stepCount,
  validDataMap,
  eventImageProcessing,
  buttonOnClick,
  setEventImageValid,
  setEventImageProcessing,
  updateEventImage,
}: ImageStepProps) => {
  const step = 4;
  const { title, subTitle, buttonText } = getInputPageData(step);

  return (
    <InputPage
      step={step}
      title={title}
      subTitle={subTitle}
      currentStep={eventObject.currentStep}
      reachedStep={eventObject.reachedStep}
      stepCount={stepCount}
      buttonText={buttonText}
      validDataMap={validDataMap}
      page={InputPages.IMAGE_PAGE}
      setEventImageValid={setEventImageValid}
      /* The crop is encoded asynchronously, so without this a user could reach
         the summary and submit before the framed image exists. */
      nextDisabled={eventImageProcessing}
      buttonOnClick={buttonOnClick}
    >
      <ImageInput
        value={eventObject.eventImage}
        inputId="image"
        inputName="eventImage"
        label="Last opp et bilde til arrangementet"
        buttonLabel="Endre bilde"
        errorMessage="Bildet kan ikke være så stort."
        onImageChange={updateEventImage}
        onProcessingChange={setEventImageProcessing}
        imageCached={eventObject.imageCached}
      />
    </InputPage>
  );
};

export default ImageStep;
