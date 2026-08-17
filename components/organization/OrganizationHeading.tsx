import useBack from "../../hooks/useBack";
import useOrganizationReport from "../../hooks/useOrganizationReport";
import type { Organization } from "../../types/types";
import { organizationPath } from "../../utils/organization";
import BackButton from "../BackButton";
import Link from "../Link";
import FlagIcon from "../svgs/FlagIcon";
import SettingsIcon from "../svgs/SettingsIcon";
import styles from "../../styles/Organization.module.scss";

export interface OrganizationHeadingProps {
  organization: Organization;
  isAdminOrOwner?: boolean;
}

/** Back, report and (for admins) settings, above the organization's profile. */
export default function OrganizationHeading({
  organization,
  isAdminOrOwner,
}: OrganizationHeadingProps) {
  const goBack = useBack();
  const { report, reporting, remainingSeconds } = useOrganizationReport(
    organization.id,
  );

  return (
    <div className={styles.heading}>
      <BackButton onClick={goBack} className={styles.marginBottomMedium} />
      <div className={styles.headingActions}>
        <button
          type="button"
          className={styles.headingActionButton}
          aria-label="rapporter forening"
          title="Rapporter forening"
          onClick={report}
          disabled={reporting || remainingSeconds > 0}
        >
          <FlagIcon className={styles.settingsIcon} />
        </button>
        {isAdminOrOwner && (
          <Link
            href={organizationPath(organization, "/settings")}
            aria-label="innstillinger"
            className={styles.headingActionButton}
          >
            <SettingsIcon className={styles.settingsIcon} />
          </Link>
        )}
      </div>
    </div>
  );
}
