import Image from "next/image";
import { ReactNode } from "react";

import { getPrimaryEventArranger } from "../utils/eventArrangers";
import { Event } from "../types/types";

interface ArrangerAvatarProps {
  event: Event;
  /* Each call site owns its own CSS module, so the classes come from outside. */
  classNames: {
    image: string;
    iconContainer: string;
    icon: string;
  };
  /* Fallback when the arranger has no image. */
  fallbackIcon: ReactNode;
  /* Event detail renders nothing at all when an event has no arrangers, while
     the cards show the fallback icon. */
  hideWhenNoArranger?: boolean;
}

/**
 * The primary arranger's avatar, or a fallback icon.
 *
 * This was three copies of the same nested if/else - one per card - that had
 * already drifted apart on which Next Image API they used.
 */
const ArrangerAvatar = ({
  event,
  classNames,
  fallbackIcon,
  hideWhenNoArranger,
}: ArrangerAvatarProps) => {
  const arranger = getPrimaryEventArranger(event);
  const imageSrc = arranger?.user
    ? arranger.user.image
    : arranger?.organization?.image;

  if (!arranger && hideWhenNoArranger) {
    return null;
  }

  if (!imageSrc) {
    return <div className={classNames.iconContainer}>{fallbackIcon}</div>;
  }

  return (
    <div className={classNames.image}>
      <Image
        src={imageSrc}
        alt="Arrangøren av arrangementet"
        fill
        sizes="5vw"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
};

export default ArrangerAvatar;
