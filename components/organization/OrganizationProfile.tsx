import { ButtonSize, type Organization } from "../../types/types";
import { getOrganizationCalendarLinks } from "../../utils/ics";
import { getOrganizationSocialLinks } from "../../utils/socialLinks";
import Avatar from "../Avatar";
import CalendarLinksButton from "../CalendarLinksButton";
import DescriptionText from "../DescriptionText";
import SmallCheckCircle from "../SmallCheckCircle";
import LinkIcon from "../svgs/LinkIcon";
import OrganizationFollowButton from "./OrganizationFollowButton";
import styles from "../../styles/Organization.module.scss";

export interface OrganizationProfileProps {
  organization: Organization;
}

/** Avatar, name, description and everything you can do to the organization. */
export default function OrganizationProfile({
  organization,
}: OrganizationProfileProps) {
  const calendarLinks = getOrganizationCalendarLinks(organization);
  const socialLinks = getOrganizationSocialLinks(organization);

  return (
    <div className={styles.headerContainer}>
      <div className={styles.avatarContainer}>
        <Avatar org={organization} size="large" />
      </div>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>{organization.name}</h1>
        {organization.orgNr && <SmallCheckCircle purple placeRight small />}
      </div>
      <DescriptionText
        text={organization.description}
        className={styles.description}
        paragraphClassName={styles.descText}
      />
      <OrganizationFollowButton organization={organization} />
      <div className={styles.calendarActions}>
        <CalendarLinksButton
          links={calendarLinks.links}
          buttonText="Abonner på kalender"
          title={`Abonner på ${organization.name}`}
          dialogLabel="Abonner på organisasjonens kalender"
          size={ButtonSize.TINYWITHTEXT}
          footer={
            <a
              href={calendarLinks.downloadHref}
              target="_blank"
              rel="noreferrer"
            >
              Last ned kalenderfilen (.ics)
            </a>
          }
        />
      </div>
      {socialLinks.length > 0 && (
        <div className={styles.socialLinks}>
          {socialLinks.map((socialLink) => (
            <a
              key={socialLink.key}
              href={socialLink.url}
              className={styles.socialLink}
              target="_blank"
              rel="noreferrer"
            >
              <LinkIcon className={styles.socialLinkIcon} />
              <span>{socialLink.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
