import { type ChangeEvent, useRef } from "react";

import { ImageCaching } from "../../types/types";
import {
  type EventObjectProps,
  IMAGE_CACHE_LIMIT_BYTES,
  clearStoredImage,
  readStoredImage,
  writeStoredImage,
} from "./eventDraft";
import type { EventDraft } from "./useEventDraft";

function readDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () =>
      resolve(typeof reader.result === "string" ? reader.result : null),
    );
    reader.addEventListener("error", () => resolve(null));
    reader.addEventListener("abort", () => resolve(null));
    reader.readAsDataURL(file);
  });
}

async function fileFromDataUrl(dataUrl: string, name: string): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], name, { type: blob.type, lastModified: Date.now() });
}

export default function useEventImage({
  patchEvent,
  patchEventWithoutStoring,
  replaceEvent,
}: EventDraft) {
  const latestPick = useRef(0);

  const cacheImage = async (file: File) => {
    const pick = latestPick.current;

    if (file.size > IMAGE_CACHE_LIMIT_BYTES) {
      clearStoredImage();
      return ImageCaching.PREEMPTIVE_MESSAGE;
    }

    const dataUrl = await readDataUrl(file);

    if (pick !== latestPick.current) {
      return null;
    }

    if (!dataUrl) {
      clearStoredImage();
      return ImageCaching.PREEMPTIVE_MESSAGE;
    }

    writeStoredImage(dataUrl);
    return ImageCaching.OK;
  };

  const updateEventImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    latestPick.current += 1;
    patchEvent({
      eventImage: file,
      eventImageValid: true,
      imageStorageKey: file.name,
    });

    const imageCached = await cacheImage(file);

    if (imageCached !== null) {
      patchEventWithoutStoring({ imageCached });
    }
  };

  const restoreImage = async (draft: EventObjectProps) => {
    const dataUrl = readStoredImage();
    if (!dataUrl) {
      replaceEvent({ ...draft, eventImage: undefined });
      return;
    }

    replaceEvent({
      ...draft,
      eventImage: await fileFromDataUrl(dataUrl, draft.imageStorageKey),
      eventImageValid: true,
    });
  };

  return { updateEventImage, restoreImage };
}
