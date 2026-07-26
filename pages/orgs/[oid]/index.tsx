// Next.js.
import Link from "next/link";
import type { GetStaticProps } from "next";
import useSWR from "swr";
import { useRouter } from "next/router";

// React.
import { useEffect, useRef, useState } from "react";

// Components.
import HeadComponent from "../../../components/HeadComponent";
import BackButton from "../../../components/BackButton";
import LargeEventCard from "../../../components/LargeEventCard";
import Layout from "../../../components/Layout";
import CalendarIconCard from "../../../components/svgs/CalendarIconCard";
import SmallCheckCircle from "../../../components/SmallCheckCircle";
import SettingsIcon from "../../../components/svgs/SettingsIcon";
import UsersIconCard from "../../../components/svgs/UsersIconCard";
import FollowIcon from "../../../components/svgs/FollowIcon";
import FlagIcon from "../../../components/svgs/FlagIcon";
import LinkIcon from "../../../components/svgs/LinkIcon";
import Avatar from "../../../components/Avatar";
import Button from "../../../components/Button";

// Hooks.
import useBack from "../../../hooks/useBack";
import useSnack from "../../../hooks/useSnack";
import useOrganization from "../../../hooks/useOrganization";
import useUser from "../../../hooks/useUser";
import useRedirectToLogin from "../../../hooks/useRedirectToLogin";
import useFollowArranger from "../../../hooks/useFollowArranger";

// Services.
import { ApiError } from "../../../services/apiError";
import { getOrganization } from "../../../services/organizations";
import {
  type ArrangerFollower,
  ButtonSize,
  ButtonType,
  type Event,
  /* Type-only: shadowed by the `Organization` component below - see the same
     note in pages/events/[eid]/index.tsx. */
  type Organization,
  type OrganizationReportStatus,
  SnackTypes,
} from "../../../types/types";
import {
  fetchFromPeoplyApi,
  fetchFromPeoplyApiJson,
} from "../../../services/fetchers";

// Assets.
import type { ParsedUrlQuery } from "node:querystring";

// Styles.
import styles from "../../../styles/Organization.module.scss";
import { injectLink } from "../../../utils/functions";
import { getOrganizationCalendarLinks } from "../../../utils/ics";
import { getOrganizationSocialLinks } from "../../../utils/socialLinks";

interface OrganizationProps {
  organization: Organization;
}

const Organization = ({ organization }: OrganizationProps) => {
  const goBack = useBack();
  const { addSnack } = useSnack();
  const router = useRouter();
  const { oid } = router.query;
  const today = useRef(new Date().toISOString());
  const { user } = useUser();
  const redirectToLogin = useRedirectToLogin();
  const setFollowingArranger = useFollowArranger();
  const [reporting, setReporting] = useState(false);
  const [now, setNow] = useState(Date.now());

  const {
    organization: orgData,
    organizationUsers: orgMembers,
    isAdminOrOwner,
    loading: orgLoading,
    error: orgError,
  } = useOrganization(oid as string);

  const { data: orgEvents, error: orgEventsError } = useSWR<Event[]>(
    () =>
      orgData?.id
        ? `/events?afterDate=${today.current}&organizationId=${orgData?.id}`
        : false,
    fetchFromPeoplyApiJson,
    {
      fallbackData: [],
    },
  );

  const {
    data: followedArrangers,
    isLoading: followedArrangersLoading,
    mutate: mutateFollowedArrangers,
  } = useSWR<ArrangerFollower[]>(user ? `/users/${user.id}/following` : false);

  const { data: followers, mutate: mutateFollowers } = useSWR<
    ArrangerFollower[]
  >(
    user && isAdminOrOwner && orgData
      ? `/organizations/${orgData.id}/followers`
      : null,
  );

  const { data: reportStatus, mutate: mutateReportStatus } =
    useSWR<OrganizationReportStatus>(
      user && orgData ? `/organizations/${orgData.id}/report-status` : null,
    );

  useEffect(() => {
    if (!reportStatus?.nextReportAt) {
      return;
    }

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [reportStatus?.nextReportAt]);

  if (orgLoading) {
    return <></>;
  }

  if (!organization && (!orgData || orgError || orgEventsError)) {
    addSnack("Kunne ikke hente organisasjonsdata", SnackTypes.ERROR);
    return <></>;
  }

  /* use either fresh or fallback data */
  const org = orgData ?? organization;

  const following = (() => {
    const arrangers = followedArrangers?.map((arranger) => arranger.arrangerId);
    return arrangers?.includes(org.arrangerId);
  })();

  const followButtonFunction = async () => {
    const changed = await setFollowingArranger(org.arrangerId, !following);

    if (changed) {
      mutateFollowedArrangers();
      mutateFollowers();
    }
  };

  const followButtonText = (() => {
    return following ? "Følger" : "Følg";
  })();

  const followButtonType = (() => {
    return following ? ButtonType.CONFIRMED : ButtonType.PRIMARY;
  })();

  const organizationCalendarLinks = getOrganizationCalendarLinks(org);
  const socialLinks = getOrganizationSocialLinks(org);

  const remainingReportSeconds = (() => {
    if (!reportStatus?.nextReportAt || reportStatus.canReport) {
      return 0;
    }

    return Math.max(
      0,
      Math.ceil((new Date(reportStatus.nextReportAt).getTime() - now) / 1000),
    );
  })();

  const reportCountdown = (() => {
    if (!remainingReportSeconds) {
      return null;
    }

    const hours = Math.floor(remainingReportSeconds / 3600);
    const minutes = Math.floor((remainingReportSeconds % 3600) / 60);
    const seconds = remainingReportSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  })();

  const reportOrganization = async () => {
    if (!user) {
      redirectToLogin();
      return;
    }

    if (reporting || (reportStatus && !reportStatus.canReport)) {
      if (reportCountdown) {
        addSnack(
          `Du kan rapportere igjen om ${reportCountdown}`,
          SnackTypes.ERROR,
        );
      }
      return;
    }

    try {
      setReporting(true);
      const response = await fetchFromPeoplyApi(
        `/organizations/${org.id}/report`,
        {
          method: "POST",
        },
      );
      const nextStatus = await response.json();
      mutateReportStatus(
        {
          canReport: false,
          nextReportAt: nextStatus.nextReportAt,
          remainingSeconds: nextStatus.remainingSeconds ?? 0,
        },
        false,
      );
      addSnack("Foreningen er rapportert", SnackTypes.SUCCESS);
    } catch (e) {
      if (e instanceof ApiError && e.status === 429) {
        const nextStatus = e.body as OrganizationReportStatus;
        const retryInSeconds = nextStatus.remainingSeconds ?? 0;
        const retryCountdown = (() => {
          const hours = Math.floor(retryInSeconds / 3600);
          const minutes = Math.floor((retryInSeconds % 3600) / 60);
          const seconds = retryInSeconds % 60;

          if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`;
          }

          return `${minutes}:${seconds.toString().padStart(2, "0")}`;
        })();

        mutateReportStatus(
          {
            canReport: false,
            nextReportAt: nextStatus.nextReportAt,
            remainingSeconds: retryInSeconds,
          },
          false,
        );
        addSnack(
          retryInSeconds > 0
            ? `Du kan rapportere igjen om ${retryCountdown}`
            : "Du kan bare rapportere en gang i timen",
          SnackTypes.ERROR,
        );
        return;
      }
      addSnack("Kunne ikke rapportere foreningen", SnackTypes.ERROR);
    } finally {
      setReporting(false);
    }
  };

  return (
    <>
      <HeadComponent
        title={org.name}
        description={
          org.description
            ? org.description
            : `Organisasjonssiden til ${org.name}`
        }
        path={`/orgs/${org.urlId ?? org.id}`}
        imageUrl={org.image}
      />
      <Layout>
        <div className={styles.heading}>
          <BackButton onClick={goBack} className={styles.marginBottomMedium} />
          <div className={styles.headingActions}>
            <button
              type="button"
              className={styles.headingActionButton}
              aria-label="rapporter forening"
              title="Rapporter forening"
              onClick={reportOrganization}
              disabled={reporting || remainingReportSeconds > 0}
            >
              <FlagIcon className={styles.settingsIcon} />
            </button>
            {isAdminOrOwner && (
              <Link
                href={`/orgs/${org.urlId ?? org.id}/settings`}
                aria-label="innstillinger"
                className={styles.headingActionButton}
              >
                <SettingsIcon className={styles.settingsIcon} />
              </Link>
            )}
          </div>
        </div>
        <div className={styles.headerContainer}>
          <div className={styles.avatarContainer}>
            <Avatar org={org} size="large" />
          </div>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>{org.name}</h1>
            {org.orgNr && <SmallCheckCircle purple placeRight small />}
          </div>
          <div className={styles.description}>
            {org.description?.split("\n").map((str) => (
              <p key={str} className={styles.descText}>
                {injectLink(str)}
                <br></br>
              </p>
            ))}
          </div>
          <Button
            text={followButtonText}
            size={ButtonSize.TINYWITHTEXT}
            type={followButtonType}
            noShadow
            onClick={followButtonFunction}
            /* Absence of data is not the same as a request in flight: if
               /following fails, the data never arrives and the button used to
               spin forever. 401/403 are suppressed on purpose, so that failure
               was silent - a permanent spinner and no error. Ask SWR whether
               the request is actually running instead. */
            loading={followedArrangersLoading}
          />
          {organizationCalendarLinks.downloadHref && (
            <div className={styles.calendarActions}>
              {organizationCalendarLinks.subscribeHref && (
                <a
                  href={organizationCalendarLinks.subscribeHref}
                  className={styles.calendarLink}
                >
                  Abonner på kalender
                </a>
              )}
              <a
                href={organizationCalendarLinks.downloadHref}
                className={styles.calendarSecondaryLink}
                target="_blank"
                rel="noreferrer"
              >
                Last ned kalender
              </a>
            </div>
          )}
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
        <div className={styles.dataContainer}>
          {orgMembers && (
            <Link
              href={`/orgs/${org.urlId ?? org.id}/members`}
              className={styles.iconContainer}
            >
              <UsersIconCard className={`${styles.icon} ${styles.usersIcon}`} />
              <p className={styles.data}>{orgMembers.length}</p>
              <p className={styles.dataDescription}>Medlemmer</p>
            </Link>
          )}
          {isAdminOrOwner && followers && (
            <Link
              href={`/orgs/${org.urlId ?? org.id}/followers`}
              className={styles.iconContainer}
            >
              <FollowIcon className={`${styles.icon} ${styles.followIcon}`} />
              <p className={styles.data}>{followers.length}</p>
              <p className={styles.dataDescription}>Følgere</p>
            </Link>
          )}
          <Link
            href={`/orgs/${org.urlId ?? org.id}/events`}
            className={styles.iconContainer}
          >
            <CalendarIconCard className={styles.icon} />
            <p className={styles.data}>{orgEvents?.length}</p>
            <p className={styles.dataDescription}>Arrangementer</p>
          </Link>
        </div>
        <div className={styles.eventWrapper}>
          <div className={styles.eventHeaderContainer}>
            <h2 className={styles.eventHeader}>Kommende arrangementer</h2>
            <Link
              href={`/orgs/${org.urlId ?? org.id}/events`}
              className={styles.link}
            >
              Se alle
            </Link>
          </div>
          <div className={styles.eventContainer}>
            {orgEvents?.map((event: Event) => (
              <LargeEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </Layout>
    </>
  );
};

interface IParams extends ParsedUrlQuery {
  oid: string;
}

// Get the data for the organization in question.
export const getStaticProps: GetStaticProps = async (context) => {
  const { oid } = context.params as IParams;

  try {
    const organization = await getOrganization(oid);

    if (!organization) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        organization,
      },
      revalidate: 60 * 30, // 30 minutes
    };
  } catch {
    return {
      props: {
        organization: null,
      },
      revalidate: 60 * 30, // 30 minutes
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
};

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}

export default Organization;
