/**
 * The two front-page carousels, split out of pages/index.tsx so they land in
 * their own chunk instead of the front page's first load.
 *
 * Both are already gated on SWR data (`futureEvents && futureEvents.length > 0`,
 * and so on), so neither can render before a network round-trip has completed,
 * and neither belongs in the first paint of the 38 of 40 routes that never show
 * a carousel at all.
 *
 * Keeping both in one module is deliberate: two `dynamic()` calls against the
 * same import specifier resolve to the same chunk.
 */
import Link from "./Link";
import type { UrlObject } from "node:url";

import EventCard from "./EventCard";
import OrganizationAvatar from "./OrganizationAvatar";
import ScrollRow from "./ScrollRow";
import type { Event, Organization } from "../types/types";

import styles from "../styles/Home.module.scss";

interface CarouselHeaderProps {
  header: string;
  seeAllUrl: string | UrlObject;
}

const CarouselHeader = ({ header, seeAllUrl }: CarouselHeaderProps) => (
  <div className={styles.carouselHeader}>
    <h1>{header}</h1>
    <Link href={seeAllUrl} className={styles.link}>
      Se alle
    </Link>
  </div>
);

export interface EventCarouselProps {
  header: string;
  seeAllUrl: string | UrlObject;
  events: Event[];
  error: Error | null;
}

export const EventCarousel = ({
  header,
  seeAllUrl,
  events,
}: EventCarouselProps) => {
  return (
    <div className={styles.carousel}>
      <CarouselHeader header={header} seeAllUrl={seeAllUrl} />
      <ScrollRow>
        {events?.map((event) => (
          <div key={event.urlId} className={styles.eventSlide}>
            <Link
              href={{
                pathname: "/events/[eventId]",
                query: { eventId: event.urlId },
              }}
            >
              <EventCard event={event} />
            </Link>
          </div>
        ))}
      </ScrollRow>
    </div>
  );
};

export interface OrganizationCarouselProps {
  header: string;
  seeAllUrl: string | UrlObject;
  organizations: Organization[];
  error: Error | null;
}

export const OrganizationCarousel = ({
  header,
  seeAllUrl,
  organizations,
}: OrganizationCarouselProps) => {
  return (
    <div className={styles.carousel}>
      <CarouselHeader header={header} seeAllUrl={seeAllUrl} />
      <ScrollRow>
        {organizations?.map((organization) => (
          <div key={organization.id} className={styles.organizationSlide}>
            <Link href={`/orgs/${organization.urlId ?? organization.id}`}>
              <OrganizationAvatar organization={organization} />
            </Link>
          </div>
        ))}
      </ScrollRow>
    </div>
  );
};
