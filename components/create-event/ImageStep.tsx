// Components.
import ImageInput from "../inputs/ImageInput";
import InputPage from "../InputPage";

// Utils.
import { getInputPageData } from "../../utils/functions";

// Types.
import { InputPages } from "../../types/types";
import { EventObjectProps } from "../../hooks/useCreateEventForm";

interface ImageStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  setEventImageValid: (eventImageValid: boolean) => void;
  updateEventImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  setEventImageValid,
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
      buttonOnClick={buttonOnClick}
      placeButtonStatic
    >
      <ImageInput
        value={eventObject.eventImage}
        inputId="image"
        inputName="eventImage"
        label="Last opp et bilde til arrangementet"
        buttonLabel="Endre bilde"
        errorMessage="Bildet kan ikke være så stort."
        onChange={updateEventImage}
        imageCached={eventObject.imageCached}
      />
    </InputPage>
  );
};

export default ImageStep;
