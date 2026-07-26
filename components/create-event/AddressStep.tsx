// React.
import type { ChangeEvent, Dispatch, SetStateAction } from "react";

// Components.
import TextInput from "../inputs/TextInput";
import TextInputLocationSelect from "../inputs/TextInputLocationSelect";
import InputPage from "../InputPage";

// Utils.
import { getInputPageData } from "../../utils/functions";
import {
  eventLocationNameMaxLength,
  eventLocationNameMinLength,
} from "../../utils/constants";

// Types.
import { InputPages, type IpInfo } from "../../types/types";
import type { AzureMapsSearchFuzzyResult } from "../../types/azureMaps";
import type { EventObjectProps } from "../../hooks/useCreateEventForm";

// Styles.
import styles from "../../styles/CreateEvent.module.scss";

interface AddressStepProps {
  eventObject: EventObjectProps;
  stepCount: number;
  validDataMap: Map<InputPages, boolean>;
  buttonOnClick: (step: number) => void;
  updateEventLocationName: (e: ChangeEvent<HTMLInputElement>) => void;
  eventAddressValid: boolean;
  setEventAddressValid: Dispatch<SetStateAction<boolean>>;
  updateEventLocation: (loc?: AzureMapsSearchFuzzyResult) => void;
  ipInfo?: IpInfo;
}

const AddressStep = ({
  eventObject,
  stepCount,
  validDataMap,
  buttonOnClick,
  updateEventLocationName,
  eventAddressValid,
  setEventAddressValid,
  updateEventLocation,
  ipInfo,
}: AddressStepProps) => {
  const step = 2;
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
      page={InputPages.ADDRESS_PAGE}
      buttonOnClick={buttonOnClick}
      padding
    >
      <div className={styles.textContainer}>
        <TextInput
          value={eventObject.eventLocationName}
          inputId="locationName"
          inputName="eventLocationName"
          label="Kallenavn på stedet"
          placeholder="F.eks. Bliss"
          maxLength={eventLocationNameMaxLength}
          minLength={eventLocationNameMinLength}
          errorMessage="Du må oppgi et kallenavn på stedet."
          required
          handleChange={updateEventLocationName}
          setValid={setEventAddressValid}
          valid={eventAddressValid}
          validate
        />
        <br />
        <br />
        <TextInputLocationSelect
          inputId="address"
          inputName="eventAddress"
          label="Legg til en adresse"
          placeholder="F.eks. Gaustadalléen 23B"
          onLocationSelect={updateEventLocation}
          selectedLocation={eventObject.eventLocation}
          options={
            ipInfo
              ? {
                  countrySet: [ipInfo.country_code],
                  lat: ipInfo.latitude,
                  lon: ipInfo.longitude,
                }
              : undefined
          }
        />
      </div>
    </InputPage>
  );
};

export default AddressStep;
