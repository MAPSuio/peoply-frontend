/**
 * The recommendation carousels on /find.
 *
 * Backed by GET /recommendations/events and /recommendations/organizations,
 * which personalize from the session cookie when one is present and fall back
 * to a popularity ranking for anonymous visitors — so this component needs no
 * user gating of its own.
 *
 * Reuses the front page's carousels and their Home.module.scss container, so
 * the two surfaces cannot drift apart visually. The page is responsible for
 * loading this component lazily (Swiper is heavy) and for importing Swiper's
 * CSS eagerly, mirroring pages/index.tsx.
 */
// Hooks.
import useSWR from "swr";

// Components.
import { EventSwiper, OrganizationSwiper } from "./HomeSwipers";

// Types.
import type { Event, Organization } from "../types/types";

// Styles.
import styles from "../styles/Home.module.scss";

const RECOMMENDED_COUNT = 10;

const Recommendations = () => {
  const { data: events, error: eventsError } = useSWR<Event[]>(
    `/recommendations/events?take=${RECOMMENDED_COUNT}`,
  );
  const { data: organizations, error: organizationsError } = useSWR<
    Organization[]
  >(`/recommendations/organizations?take=${RECOMMENDED_COUNT}`);

  if (!events?.length && !organizations?.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      {events && events.length > 0 && (
        <EventSwiper
          header="Anbefalt for deg"
          seeAllUrl="/events"
          events={events}
          error={eventsError ?? null}
        />
      )}
      {organizations && organizations.length > 0 && (
        <OrganizationSwiper
          header="Foreninger du kanskje liker"
          seeAllUrl="/orgs"
          organizations={organizations}
          error={organizationsError ?? null}
        />
      )}
    </div>
  );
};

export default Recommendations;
