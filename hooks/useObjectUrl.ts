import { useEffect, useState } from "react";

/**
 * A blob URL for a `File`, revoked when the file changes or on unmount.
 *
 * Exists because `URL.createObjectURL(file)` written inline in a render body
 * mints a fresh URL on every render and never releases any of them. The image
 * cropper makes that acute: each adjustment produces a new `File`, so a page
 * previewing one accumulates blob URLs for as long as the user keeps framing.
 *
 * The previous URL is deliberately still returned for the single frame between
 * the file changing and the effect running, so swapping images does not flash
 * the placeholder.
 */
export default function useObjectUrl(file: File | undefined) {
  const [entry, setEntry] = useState<{ file: File; url: string }>();

  useEffect(() => {
    if (!file) {
      setEntry(undefined);
      return;
    }

    const url = URL.createObjectURL(file);
    setEntry({ file, url });

    return () => URL.revokeObjectURL(url);
  }, [file]);

  return file ? entry?.url : undefined;
}
