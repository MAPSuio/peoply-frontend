import { ChangeEvent, Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import PlaceIconSummary from "../svgs/PlaceIconSummary";
import TextInput from "../inputs/TextInput";
import TextInputLocationSelect from "../inputs/TextInputLocationSelect";

/* Types */
import { IpInfo } from "../../types/types";
import { AzureMapsSearchFuzzyResult } from "../../types/azureMaps";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";

interface EditPlaceSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  validLocationName: boolean;
  setValidLocationName: Dispatch<SetStateAction<boolean>>;
  tempLocationName: string;
  onLocationNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  location: AzureMapsSearchFuzzyResult | undefined;
  setLocation: Dispatch<SetStateAction<AzureMapsSearchFuzzyResult | undefined>>;
  ipInfo: IpInfo | undefined;
  displayLocationName: string;
  mapsHref: string | undefined;
  displayFreeformAddress: string | undefined;
}

/* Editable place card used by EditSummaryPage (event editing). */
const EditPlaceSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  validLocationName,
  setValidLocationName,
  tempLocationName,
  onLocationNameChange,
  location,
  setLocation,
  ipInfo,
  displayLocationName,
  mapsHref,
  displayFreeformAddress,
}: EditPlaceSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      editButtonOnClick={editButtonOnClick}
      editButtonDisabled={editOpen}
      inputId={3}
      Icon={
        <IconCircle
          Icon={PlaceIconSummary}
          iconClassName={styles.summaryIcon}
        />
      }
      editButtonVisible
      valid={validLocationName}
      inputComponent={
        <>
          <TextInput
            value={tempLocationName}
            inputId="locationName"
            inputName="eventLocationName"
            label="Kallenavn på stedet"
            placeholder="F.eks. Bliss"
            maxLength={100}
            minLength={1}
            errorMessage="Du må oppgi et kallenavn på stedet."
            required
            handleChange={onLocationNameChange}
            setValid={setValidLocationName}
            valid={validLocationName}
            validate
            noExtraInfo
            card
          />

          <TextInputLocationSelect
            inputId="Location"
            inputName="eventLocation"
            placeholder="F.eks. Gaustadalléen 23B"
            onLocationSelect={setLocation}
            selectedLocation={location}
            card
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
        </>
      }
    >
      <p className={styles.titleText}>{displayLocationName}</p>
      <a
        className={styles.placeText}
        href={mapsHref}
        target="_blank"
        rel="noreferrer"
      >
        {displayFreeformAddress}
      </a>
    </SummaryCard>
  );
};

export default EditPlaceSection;
