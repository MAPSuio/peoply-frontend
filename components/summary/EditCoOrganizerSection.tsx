import type { Dispatch, SetStateAction } from "react";

/* Components */
import SummaryCard from "../SummaryCard";
import IconCircle from "../IconCircle";
import InfoIconSummary from "../svgs/InfoIconSummary";

/* Styles */
import styles from "../../styles/SummaryPage.module.scss";
import createStyles from "../../styles/CreateEvent.module.scss";

interface CoOrganizerOption {
  id: string;
  label: string;
}

interface EditCoOrganizerSectionProps {
  editOpen: boolean;
  editButtonOnClick: () => void;
  onCheck: () => void;
  onCross: () => void;
  coOrganizerSearch: string;
  setCoOrganizerSearch: Dispatch<SetStateAction<string>>;
  tempCoOrganizerOrganizationIds: string[];
  coOrganizerOptions: CoOrganizerOption[];
  visibleCoOrganizerOptions: CoOrganizerOption[];
  toggleCoOrganizerOrganization: (organizationId: string) => void;
  selectedCoOrganizerNames: string[];
}

/* Editable co-organizer card used by EditSummaryPage (event editing). */
const EditCoOrganizerSection = ({
  editOpen,
  editButtonOnClick,
  onCheck,
  onCross,
  coOrganizerSearch,
  setCoOrganizerSearch,
  tempCoOrganizerOrganizationIds,
  coOrganizerOptions,
  visibleCoOrganizerOptions,
  toggleCoOrganizerOrganization,
  selectedCoOrganizerNames,
}: EditCoOrganizerSectionProps) => {
  return (
    <SummaryCard
      onCheck={onCheck}
      onCross={onCross}
      inputId={1}
      Icon={
        <IconCircle Icon={InfoIconSummary} iconClassName={styles.summaryIcon} />
      }
      editButtonVisible
      editButtonDisabled={editOpen}
      editButtonOnClick={editButtonOnClick}
      inputComponent={
        <div className={styles.coOrganizerEditor}>
          <div className={styles.coOrganizerHeader}>
            <h2>Medarrangører</h2>
            <p>
              Legg til eller fjern foreninger som samarbeider om arrangementet.
            </p>
          </div>
          <input
            id="coOrganizerSearch"
            className={createStyles.coOrganizerSearchInput}
            type="text"
            value={coOrganizerSearch}
            onChange={(event) => setCoOrganizerSearch(event.target.value)}
            placeholder="Søk etter forening"
          />
          {tempCoOrganizerOrganizationIds.length > 0 && (
            <div className={createStyles.coOrganizerTags}>
              {coOrganizerOptions
                .filter((organization) =>
                  tempCoOrganizerOrganizationIds.includes(organization.id),
                )
                .map((organization) => (
                  <span
                    key={organization.id}
                    className={createStyles.coOrganizerTag}
                  >
                    {organization.label}
                  </span>
                ))}
            </div>
          )}
          <div className={createStyles.coOrganizerOptionList}>
            {visibleCoOrganizerOptions.map((organization) => (
              <button
                key={organization.id}
                type="button"
                className={`${createStyles.coOrganizerOptionButton} ${
                  tempCoOrganizerOrganizationIds.includes(organization.id)
                    ? createStyles.coOrganizerOptionButtonSelected
                    : ""
                }`}
                onClick={() => toggleCoOrganizerOrganization(organization.id)}
              >
                <span>{organization.label}</span>
              </button>
            ))}
            {visibleCoOrganizerOptions.length === 0 && (
              <p className={createStyles.coOrganizerEmptyText}>
                Ingen foreninger matcher søket.
              </p>
            )}
          </div>
        </div>
      }
    >
      <div className={styles.dataContainer}>
        <p className={styles.categoryLabel}>Medarrangører</p>
        <p className={styles.titleText}>
          {selectedCoOrganizerNames.length > 0
            ? selectedCoOrganizerNames.join(" · ")
            : "Ingen medarrangører"}
        </p>
      </div>
    </SummaryCard>
  );
};

export default EditCoOrganizerSection;
