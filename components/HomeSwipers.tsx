/**
 * The two front-page carousels, split out of pages/index.tsx so Swiper lands in
 * its own chunk instead of the front page's first load.
 *
 * Both swipers on the front page are already gated on SWR data
 * (`futureEvents && futureEvents.length > 0`, and so on), so neither can render
 * before a network round-trip has completed - yet the ~40 kB of Swiper it takes
 * to render them was downloaded eagerly by every visitor, including the 38 of 40
 * routes that never show a carousel at all.
 *
 * Keeping both in one module is deliberate: two `dynamic()` calls against the
 * same import specifier resolve to the same chunk, so a page showing both
 * carousels fetches Swiper once.
 *
 * `swiper/css` is imported here rather than in the page for the same reason -
 * from the page it would be pulled into the eager CSS regardless of where the
 * JS ended up.
 */
import Link from "next/link";
import { UrlObject } from "url";

import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Mousewheel, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/scrollbar";
import "swiper/css/free-mode";

import EventCard from "./EventCard";
import OrganizationAvatar from "./OrganizationAvatar";
import { Event, Organization } from "../types/types";

import styles from "../styles/Home.module.scss";

/* Shared by both carousels below. Extracted only to keep the two `<Swiper>`
   call sites from drifting apart - they were already identical. */
const swiperProps = {
  className: styles.mySwiper,
  modules: [Mousewheel, FreeMode, Navigation],
  mousewheel: { forceToAxis: true },
  spaceBetween: 16,
  slidesPerView: "auto" as const,
  freeMode: { enabled: true },
};

interface CarouselHeaderProps {
  header: string;
  seeAllUrl: string | UrlObject;
}

const CarouselHeader = ({ header, seeAllUrl }: CarouselHeaderProps) => (
  <div className={styles.swiperHeader}>
    <h1>{header}</h1>
    <Link href={seeAllUrl} className={styles.link}>
      Se alle
    </Link>
  </div>
);

interface EventSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  events: Event[];
  error: Error | null;
}

export const EventSwiper = ({
  header,
  seeAllUrl,
  events,
}: EventSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <CarouselHeader header={header} seeAllUrl={seeAllUrl} />
      <Swiper {...swiperProps}>
        {events?.map((event) => (
          <SwiperSlide key={event.urlId} className={styles.mySwiperSlide}>
            <Link
              href={{
                pathname: "/events/[eventId]",
                query: { eventId: event.urlId },
              }}
            >
              <EventCard event={event} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

interface OrganizationSwiperProps {
  header: string;
  seeAllUrl: string | UrlObject;
  organizations: Organization[];
  error: Error | null;
}

export const OrganizationSwiper = ({
  header,
  seeAllUrl,
  organizations,
}: OrganizationSwiperProps) => {
  return (
    <div className={styles.swiperContainer}>
      <CarouselHeader header={header} seeAllUrl={seeAllUrl} />
      <Swiper {...swiperProps}>
        {organizations?.map((organization) => (
          <SwiperSlide key={organization.id} className={styles.swiperSlideOrg}>
            <Link href={`/orgs/${organization.urlId ?? organization.id}`}>
              <OrganizationAvatar organization={organization} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};
