import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * `next/link` with viewport prefetching turned off.
 *
 * Next prefetches a route's whole chunk graph the moment a link scrolls into
 * view. The front page links to twelve distinct routes across the navbar,
 * footer and every event and organization card, so it was pulling down 63
 * requests and 378 kB of route JS after first paint - measured on production,
 * arriving between 500 ms and 1100 ms, which is exactly the window where the
 * page is still waiting for its own data and Swiper chunk. LCP was 2.2 s on a
 * desktop connection.
 *
 * In the Pages Router `prefetch={false}` only disables the *viewport* trigger.
 * Hover and touchstart still prefetch, so a link the user is actually heading
 * for is still warm by the time they commit to it.
 *
 * Props are spread after the default so a call site that genuinely wants eager
 * prefetching can still pass `prefetch`.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink prefetch={false} {...props} />;
}
