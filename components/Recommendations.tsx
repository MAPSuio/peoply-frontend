/**
 * The recommendation feed on /find: a mobile-first vertical feed of
 * recommended events with a horizontal strip of suggested organizations
 * interleaved after the first few cards, social-media style. On desktop the
 * feed widens into a 2–3 column card grid; the org strip keeps spanning the
 * full width as a break in the feed.
 *
 * Backed by GET /recommendations/events and /recommendations/organizations,
 * which personalize from the session cookie when one is present and fall back
 * to a popularity ranking for anonymous visitors — so this component needs no
 * user gating of its own.
 */
// Next.js.
import Link from "next/link";

// Hooks.
import useSWR from "swr";

// Components.
import EventCard from "./EventCard";
import OrganizationAvatar from "./OrganizationAvatar";

// Types.
import type { Event, Organization } from "../types/types";

// Styles.
import styles from "../styles/Recommendations.module.scss";

const RECOMMENDED_EVENT_COUNT = 20;
const RECOMMENDED_ORG_COUNT = 10;
/* How many event cards the visitor scrolls past before the organization
 * suggestions break up the feed. */
const ORG_STRIP_POSITION = 3;

const Recommendations = () => {
  const { data: events } = useSWR<Event[]>(
    `/recommendations/events?take=${RECOMMENDED_EVENT_COUNT}`,
  );
  const { data: organizations } = useSWR<Organization[]>(
    `/recommendations/organizations?take=${RECOMMENDED_ORG_COUNT}`,
  );

  if (!events?.length && !organizations?.length) {
    return null;
  }

  const eventItem = (event: Event) => (
    <Link
      key={event.urlId}
      href={{ pathname: "/events/[eventId]", query: { eventId: event.urlId } }}
      className={styles.eventLink}
    >
      <EventCard event={event} />
    </Link>
  );

  return (
    <section className={styles.feed} aria-label="Anbefalinger">
      {events && events.length > 0 && (
        <h2 className={styles.heading}>Anbefalt for deg</h2>
      )}
      {events?.slice(0, ORG_STRIP_POSITION).map(eventItem)}
      {organizations && organizations.length > 0 && (
        <div className={styles.orgSuggestions}>
          <h2 className={styles.heading}>Foreninger du kanskje liker</h2>
          <div className={styles.orgStrip}>
            {organizations.map((organization) => (
              <Link
                key={organization.id}
                href={`/orgs/${organization.urlId ?? organization.id}`}
                className={styles.orgLink}
              >
                <OrganizationAvatar organization={organization} />
              </Link>
            ))}
          </div>
        </div>
      )}
      {events?.slice(ORG_STRIP_POSITION).map(eventItem)}
    </section>
  );
};

export default Recommendations;
