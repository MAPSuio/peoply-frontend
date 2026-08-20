/**
 * Geometry and encoding for the 16:9 event image cropper.
 *
 * Everything here is pure except `renderCropToFile`, which needs a canvas.
 * Kept out of the component so the maths can be unit tested without jsdom
 * pretending to have a rendering engine.
 */

/* Events are displayed at 1.78:1 everywhere - $event-image-height is
   calc(100vw / 1.78) and LargeEventCard uses aspect-ratio: 1.78 / 1. Cropping
   to the same ratio is what makes the preview match what gets published. */
export const EVENT_IMAGE_ASPECT_RATIO = 1.78;

/* next.config.js declares deviceSizes up to 1920, so a wider upload would only
   ever be downscaled again by the image optimizer. */
export const OUTPUT_MAX_WIDTH = 1920;

/* Mirrors MAX_IMAGE_BYTES in peoply-backend/src/azure/image-upload.ts. The
   backend rejects anything larger, so the encoder has to land under it. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/* Tried in order until the encoded blob fits MAX_IMAGE_BYTES. At 1920x1079 the
   first step is virtually always enough; the rest are there so a pathological
   photo degrades in quality instead of failing to upload. */
export const JPEG_QUALITY_STEPS = [0.85, 0.7, 0.55] as const;

/* Zooming further than this leaves too few source pixels to survive being
   displayed full-bleed on the event page, so the slider stops there. */
export const MIN_SOURCE_CROP_WIDTH = 640;

/* Hard ceiling regardless of how large the source is - beyond ~5x the framing
   is fiddly rather than useful. */
export const MAX_ZOOM = 5;

/**
 * How the image sits inside the crop frame.
 *
 * `scale` is relative to the cover-fit baseline, so 1 always exactly fills the
 * frame and never less. `panX`/`panY` are fractions of the maximum possible
 * pan in [-1, 1] rather than pixels: the frame's rendered size changes with
 * the viewport, and a fraction survives that unchanged, so a resize can never
 * knock the framing out of alignment or expose an empty edge.
 */
export interface CropTransform {
  scale: number;
  panX: number;
  panY: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export const DEFAULT_CROP_TRANSFORM: CropTransform = {
  scale: 1,
  panX: 0,
  panY: 0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Scale at which the image exactly covers the frame - the larger of the two
 * axis ratios, so the shorter side is the one that fits.
 */
export function getBaseScale(natural: Size, frame: Size) {
  if (natural.width <= 0 || natural.height <= 0) {
    return 1;
  }
  return Math.max(frame.width / natural.width, frame.height / natural.height);
}

/**
 * Upper zoom bound: whichever of the resolution floor and {@link MAX_ZOOM}
 * bites first. Never below 1, so a source too small to zoom at all still has a
 * valid (single-position) range.
 */
export function getMaxScale(natural: Size, frame: Size) {
  const baseScale = getBaseScale(natural, frame);
  const resolutionLimit =
    frame.width / (baseScale * MIN_SOURCE_CROP_WIDTH) || MAX_ZOOM;

  return Math.max(1, Math.min(MAX_ZOOM, resolutionLimit));
}

/** Rendered size of the image at a given scale, in frame pixels. */
export function getDisplaySize(
  natural: Size,
  frame: Size,
  scale: number,
): Size {
  const k = getBaseScale(natural, frame) * scale;
  return { width: natural.width * k, height: natural.height * k };
}

/**
 * How far the image can travel from centred before a gap would show, in frame
 * pixels. Zero on an axis means that axis is pinned.
 */
export function getMaxPan(natural: Size, frame: Size, scale: number): Size {
  const display = getDisplaySize(natural, frame, scale);
  return {
    width: Math.max(0, (display.width - frame.width) / 2),
    height: Math.max(0, (display.height - frame.height) / 2),
  };
}

/** Current pan expressed in frame pixels, for CSS `translate`. */
export function getPanOffset(
  transform: CropTransform,
  natural: Size,
  frame: Size,
): Size {
  const maxPan = getMaxPan(natural, frame, transform.scale);
  return {
    width: transform.panX * maxPan.width,
    height: transform.panY * maxPan.height,
  };
}

/** Forces a transform back into the valid range. */
export function clampTransform(
  transform: CropTransform,
  natural: Size,
  frame: Size,
): CropTransform {
  return {
    scale: clamp(transform.scale, 1, getMaxScale(natural, frame)),
    panX: clamp(transform.panX, -1, 1),
    panY: clamp(transform.panY, -1, 1),
  };
}

/** Moves the image by a pointer delta in frame pixels. */
export function panBy(
  transform: CropTransform,
  natural: Size,
  frame: Size,
  deltaX: number,
  deltaY: number,
): CropTransform {
  const maxPan = getMaxPan(natural, frame, transform.scale);

  return clampTransform(
    {
      scale: transform.scale,
      /* A pinned axis has no room to move, so the delta is simply dropped
         rather than dividing by zero. */
      panX: maxPan.width > 0 ? transform.panX + deltaX / maxPan.width : 0,
      panY: maxPan.height > 0 ? transform.panY + deltaY / maxPan.height : 0,
    },
    natural,
    frame,
  );
}

/**
 * Changes the scale while holding one point still.
 *
 * `anchor` is relative to the centre of the frame, in frame pixels - the
 * midpoint between two fingers during a pinch, or the origin for the zoom
 * slider, which then zooms about the centre of the frame.
 */
export function zoomTo(
  transform: CropTransform,
  natural: Size,
  frame: Size,
  nextScale: number,
  anchor: { x: number; y: number } = { x: 0, y: 0 },
): CropTransform {
  const baseScale = getBaseScale(natural, frame);
  const scale = clamp(nextScale, 1, getMaxScale(natural, frame));

  const k = baseScale * transform.scale;
  const nextK = baseScale * scale;
  const offset = getPanOffset(transform, natural, frame);

  /* Point of the image currently under the anchor, in natural pixels. Solving
     for the offset that keeps it there after the scale change is what stops a
     pinch from sliding the subject out from under the fingers. */
  const imagePointX = (anchor.x - offset.width) / k;
  const imagePointY = (anchor.y - offset.height) / k;

  const nextOffsetX = anchor.x - imagePointX * nextK;
  const nextOffsetY = anchor.y - imagePointY * nextK;

  const maxPan = getMaxPan(natural, frame, scale);

  return clampTransform(
    {
      scale,
      panX: maxPan.width > 0 ? nextOffsetX / maxPan.width : 0,
      panY: maxPan.height > 0 ? nextOffsetY / maxPan.height : 0,
    },
    natural,
    frame,
  );
}

/**
 * Region of the source image the frame is showing, in natural pixels, ready
 * for `drawImage`.
 *
 * Depends on the frame's aspect ratio but not its rendered size, since pan is
 * stored as a fraction - so the crop is identical on mobile and desktop.
 */
export function getSourceRect(
  transform: CropTransform,
  natural: Size,
  frame: Size,
): SourceRect {
  const k = getBaseScale(natural, frame) * transform.scale;
  const offset = getPanOffset(transform, natural, frame);

  const sw = frame.width / k;
  const sh = frame.height / k;

  /* The frame sees the region opposite to where the image was translated. */
  const centreX = natural.width / 2 - offset.width / k;
  const centreY = natural.height / 2 - offset.height / k;

  return {
    sx: clamp(centreX - sw / 2, 0, Math.max(0, natural.width - sw)),
    sy: clamp(centreY - sh / 2, 0, Math.max(0, natural.height - sh)),
    sw,
    sh,
  };
}

/**
 * Output canvas size: the cropped region's own resolution, capped at
 * {@link OUTPUT_MAX_WIDTH} and never upscaled past what the source actually
 * holds.
 */
export function getOutputSize(sourceRect: SourceRect): Size {
  const width = Math.max(
    1,
    Math.round(Math.min(sourceRect.sw, OUTPUT_MAX_WIDTH)),
  );
  return {
    width,
    height: Math.max(1, Math.round(width / EVENT_IMAGE_ASPECT_RATIO)),
  };
}

/** Swaps any extension for `.jpg`, since the output is always JPEG. */
export function toJpegFileName(fileName: string) {
  const base = fileName.replace(/\.[^./\\]+$/, "").trim();
  return `${base || "arrangementsbilde"}.jpg`;
}

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

/**
 * Renders the cropped region to a JPEG `File` that satisfies the backend's
 * contract: `image/jpeg` and under {@link MAX_IMAGE_BYTES}.
 *
 * Takes an `HTMLImageElement` rather than a `Blob`/`ImageBitmap` on purpose -
 * browsers apply EXIF orientation when rendering an `<img>` and when drawing
 * one, so portrait photos straight off a phone come out upright for free.
 */
export async function renderCropToFile(
  image: HTMLImageElement,
  transform: CropTransform,
  frame: Size,
  fileName: string,
): Promise<File> {
  const natural = { width: image.naturalWidth, height: image.naturalHeight };
  const sourceRect = getSourceRect(transform, natural, frame);
  const output = getOutputSize(sourceRect);

  const canvas = document.createElement("canvas");
  canvas.width = output.width;
  canvas.height = output.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Kunne ikke lage en canvas-kontekst for bildet.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    sourceRect.sx,
    sourceRect.sy,
    sourceRect.sw,
    sourceRect.sh,
    0,
    0,
    output.width,
    output.height,
  );

  let blob: Blob | null = null;
  for (const quality of JPEG_QUALITY_STEPS) {
    blob = await canvasToBlob(canvas, quality);
    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      break;
    }
  }

  if (!blob) {
    throw new Error("Kunne ikke lagre det beskårne bildet.");
  }

  return new File([blob], toJpegFileName(fileName), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
