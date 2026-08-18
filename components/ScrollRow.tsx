import type { ReactNode } from "react";

import styles from "../styles/ScrollRow.module.scss";

export interface ScrollRowProps {
  children: ReactNode;
  className?: string;
}

/**
 * A row you flick through sideways, scrolled by the browser and nothing else.
 *
 * This replaces Swiper for the carousels. Swiper drives the track from
 * JavaScript, and to do that it registers `touchstart`, `touchmove` and
 * `pointermove` on `document` as non-passive listeners - twenty of them across
 * the front page. A non-passive touch listener means the browser cannot start
 * scrolling until that JavaScript has run and decided whether to cancel the
 * gesture, which is felt as stutter whenever a finger passes over a carousel,
 * vertically as much as horizontally. Neither `cssMode` nor `allowTouchMove:
 * false` removes those listeners; only not using Swiper does.
 *
 * A plain overflow container also gets real platform momentum and rubber
 * banding for free, which is what a hand-rolled free mode was approximating.
 */
export default function ScrollRow({ children, className }: ScrollRowProps) {
  return (
    <div
      className={`${styles.row} ${className ?? ""}`}
      /* Each row sits under its own heading, which is what names it; the
         tabindex is here because a scrollable area has to be reachable by
         keyboard, and only Chrome focuses overflow containers on its own. */
      // biome-ignore lint/a11y/noNoninteractiveTabindex: see above
      tabIndex={0}
    >
      {children}
    </div>
  );
}
