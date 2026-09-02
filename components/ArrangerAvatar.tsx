import Image from "next/image";
import type { ReactNode } from "react";

import { getEventArrangerAvatarContent } from "../utils/avatar";
import { getPrimaryEventArranger } from "../utils/eventArrangers";
import type { Event } from "../types/types";

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

const ArrangerAvatar = ({
  event,
  classNames,
  fallbackIcon,
  hideWhenNoArranger,
}: ArrangerAvatarProps) => {
  if (!getPrimaryEventArranger(event) && hideWhenNoArranger) {
    return null;
  }

  const content = getEventArrangerAvatarContent(event);

  if (content?.type !== "image") {
    return <div className={classNames.iconContainer}>{fallbackIcon}</div>;
  }

  return (
    <div className={classNames.image}>
      <Image
        src={content.src}
        alt={content.alt}
        fill
        sizes="5vw"
        style={{ objectFit: "cover" }}
      />
    </div>
  );
};

export default ArrangerAvatar;
