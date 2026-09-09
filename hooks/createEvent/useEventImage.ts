import type { ChangeEvent } from "react";

import { ImageCaching } from "../../types/types";
import {
  IMAGE_CACHE_LIMIT_BYTES,
  type EventObjectProps,
  clearStoredImage,
  readStoredImage,
  writeStoredImage,
} from "./eventDraft";
import type { EventDraft } from "./useEventDraft";

function cacheImage(file: File): Promise<void> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        writeStoredImage(reader.result);
      }
      resolve();
    });
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
  const storeImage = (file: File) => {
    if (file.size > IMAGE_CACHE_LIMIT_BYTES) {
      patchEventWithoutStoring({
        imageCached: ImageCaching.PREEMPTIVE_MESSAGE,
      });
      clearStoredImage();
      return;
    }

    patchEventWithoutStoring({ imageCached: ImageCaching.OK });
    cacheImage(file);
  };

  const updateEventImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    storeImage(file);
    patchEvent({
      eventImage: file,
      eventImageValid: true,
      imageStorageKey: file.name,
    });
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
