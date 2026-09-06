// React.
import {
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

// Utils.
import cx from "../../utils/cx";
import {
  type CropTransform,
  DEFAULT_CROP_TRANSFORM,
  type Size,
  getDisplaySize,
  getMaxScale,
  getPanOffset,
  panBy,
  renderCropToFile,
  zoomTo,
} from "../../utils/imageCrop";

// Styles.
import styles from "../../styles/ImageCropper.module.scss";

export const DECODE_ERROR_MESSAGE =
  "Vi klarte ikke å lese dette bildeformatet. Prøv et JPG- eller PNG-bilde.";
const ENCODE_ERROR_MESSAGE =
  "Vi klarte ikke å behandle bildet. Prøv et annet bilde.";

/* Long enough that a flick of the slider does not queue an encode per frame,
   short enough that the cropped file is ready before the user can reach the
   next step. */
const COMMIT_DELAY_MS = 150;

const KEYBOARD_PAN_STEP = 12;
const KEYBOARD_PAN_STEP_LARGE = 48;
const KEYBOARD_ZOOM_STEP = 0.2;

const EMPTY_SIZE: Size = { width: 0, height: 0 };

interface DecodedSource {
  image: HTMLImageElement;
  url: string;
}

interface ImageCropperProps {
  /** The picked file, still in its original format and resolution. */
  file: File;
  /** Receives the cropped, re-encoded JPEG whenever the framing settles. */
  onCropped: (file: File) => void;
  /** True from the first adjustment until the cropped file is ready. */
  onProcessingChange?: (processing: boolean) => void;
  /** Called with a message on failure, and with undefined once it clears. */
  onError?: (message: string | undefined) => void;
}

/**
 * Pans and zooms an image inside a frame locked to the event image's 1.78:1
 * ratio, then hands the crop back as a JPEG.
 *
 * The framing is applied twice over: live as a CSS transform, which is cheap
 * enough to run on every pointer move, and - debounced, once the gesture ends -
 * onto a canvas that produces the file actually uploaded. Doing the encode on
 * every move would drop frames for no benefit, since only the last one counts.
 */
const ImageCropper = ({
  file,
  onCropped,
  onProcessingChange,
  onError,
}: ImageCropperProps) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const hintId = useId();

  const [source, setSource] = useState<DecodedSource | null>(null);
  const [frame, setFrame] = useState<Size>(EMPTY_SIZE);
  const [transform, setTransform] = useState<CropTransform>(
    DEFAULT_CROP_TRANSFORM,
  );
  const [dragging, setDragging] = useState(false);

  /* Callbacks come in as inline arrows, so holding them in refs keeps them out
     of the effect dependencies - otherwise every parent render would restart
     the decode and the debounce. */
  const onCroppedRef = useRef(onCropped);
  onCroppedRef.current = onCropped;
  const onProcessingChangeRef = useRef(onProcessingChange);
  onProcessingChangeRef.current = onProcessingChange;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  /* Pointer state lives in refs: it is read inside gesture handlers and must
     not trigger a render of its own. */
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  /* Encodes are async and the user keeps moving, so a counter lets a stale
     result be dropped instead of overwriting a newer crop. */
  const generationRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const natural: Size = source
    ? { width: source.image.naturalWidth, height: source.image.naturalHeight }
    : EMPTY_SIZE;
  const ready = Boolean(source) && frame.width > 0 && natural.width > 0;
  const maxScale = ready ? getMaxScale(natural, frame) : 1;
  const canZoom = maxScale > 1;

  /* Decode the file into an <img> rather than an ImageBitmap: browsers apply
     EXIF orientation when rendering and when drawing an HTMLImageElement, so
     portrait photos off a phone come out upright without extra work. */
  useEffect(() => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    let cancelled = false;

    /* The previous URL is revoked only once its replacement has loaded, so the
       rendered preview never points at a revoked blob. */
    const adoptUrl = () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = url;
    };

    image.onload = () => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      adoptUrl();
      setSource({ image, url });
      setTransform(DEFAULT_CROP_TRANSFORM);
      onErrorRef.current?.(undefined);
    };

    image.onerror = () => {
      if (cancelled) {
        URL.revokeObjectURL(url);
        return;
      }
      adoptUrl();
      setSource(null);
      onProcessingChangeRef.current?.(false);
      onErrorRef.current?.(DECODE_ERROR_MESSAGE);
    };

    image.src = url;

    return () => {
      cancelled = true;
    };
  }, [file]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    },
    [],
  );

  /* The frame is fluid (aspect-ratio against a max-width), so its pixel size is
     measured rather than assumed. Pan is stored as a fraction of the available
     travel, so a resize rescales the framing instead of breaking it. */
  useEffect(() => {
    const element = frameRef.current;
    if (!element) {
      return;
    }

    const measure = () => {
      const { width, height } = element.getBoundingClientRect();
      setFrame((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  /* Produce the file the form submits. Runs on mount too, so picking an image
     and touching nothing still uploads a properly framed 1.78:1 crop. */
  useEffect(() => {
    if (!source || !ready) {
      return;
    }

    onProcessingChangeRef.current?.(true);

    /* Wait for the gesture to finish - the intermediate framings are never the
       one that gets uploaded. */
    if (dragging) {
      return;
    }

    const generation = generationRef.current + 1;
    generationRef.current = generation;

    const timer = setTimeout(() => {
      renderCropToFile(source.image, transform, frame, file.name)
        .then((cropped) => {
          if (generation !== generationRef.current) {
            return;
          }
          onCroppedRef.current(cropped);
          onErrorRef.current?.(undefined);
          onProcessingChangeRef.current?.(false);
        })
        .catch(() => {
          if (generation !== generationRef.current) {
            return;
          }
          onErrorRef.current?.(ENCODE_ERROR_MESSAGE);
          onProcessingChangeRef.current?.(false);
        });
    }, COMMIT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [source, ready, dragging, transform, frame, file.name]);

  const distanceBetweenPointers = () => {
    const [first, second] = Array.from(pointersRef.current.values());
    if (!first || !second) {
      return 0;
    }
    return Math.hypot(first.x - second.x, first.y - second.y);
  };

  /* Pinch and wheel-free zoom both anchor on a point, expressed relative to the
     centre of the frame - which is the origin zoomTo() works in. */
  const anchorFromClient = (clientX: number, clientY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    return {
      x: clientX - (rect.left + rect.width / 2),
      y: clientY - (rect.top + rect.height / 2),
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!ready) {
      return;
    }
    /* EditImageSection renders this inside SummaryCard's outer button, so the
       gesture must not read as a click on the card. */
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    setDragging(true);

    if (pointersRef.current.size === 2) {
      pinchRef.current = {
        distance: distanceBetweenPointers(),
        scale: transformRef.current.scale,
      };
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!ready || !pointersRef.current.has(event.pointerId)) {
      return;
    }
    event.stopPropagation();

    const previous = pointersRef.current.get(event.pointerId);
    const current = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, current);

    const pinch = pinchRef.current;
    if (pointersRef.current.size >= 2 && pinch && pinch.distance > 0) {
      const points = Array.from(pointersRef.current.values());
      const first = points[0];
      const second = points[1];
      const anchor = anchorFromClient(
        (first.x + second.x) / 2,
        (first.y + second.y) / 2,
      );
      const nextScale =
        pinch.scale * (distanceBetweenPointers() / pinch.distance);

      setTransform((value) => zoomTo(value, natural, frame, nextScale, anchor));
      return;
    }

    if (!previous) {
      return;
    }

    setTransform((value) =>
      panBy(
        value,
        natural,
        frame,
        current.x - previous.x,
        current.y - previous.y,
      ),
    );
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size < 2) {
      pinchRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      setDragging(false);
    }
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!ready) {
      return;
    }

    const step = event.shiftKey ? KEYBOARD_PAN_STEP_LARGE : KEYBOARD_PAN_STEP;

    const pan = (deltaX: number, deltaY: number) => {
      event.preventDefault();
      event.stopPropagation();
      setTransform((value) => panBy(value, natural, frame, deltaX, deltaY));
    };

    const zoom = (delta: number) => {
      event.preventDefault();
      event.stopPropagation();
      setTransform((value) =>
        zoomTo(value, natural, frame, value.scale + delta),
      );
    };

    switch (event.key) {
      case "ArrowLeft":
        return pan(-step, 0);
      case "ArrowRight":
        return pan(step, 0);
      case "ArrowUp":
        return pan(0, -step);
      case "ArrowDown":
        return pan(0, step);
      case "+":
      case "=":
        return zoom(KEYBOARD_ZOOM_STEP);
      case "-":
      case "_":
        return zoom(-KEYBOARD_ZOOM_STEP);
      case "0":
        event.preventDefault();
        event.stopPropagation();
        return setTransform(DEFAULT_CROP_TRANSFORM);
      default:
        return;
    }
  };

  const reset = useCallback(() => setTransform(DEFAULT_CROP_TRANSFORM), []);

  const display = ready
    ? getDisplaySize(natural, frame, transform.scale)
    : EMPTY_SIZE;
  const offset = ready ? getPanOffset(transform, natural, frame) : EMPTY_SIZE;

  return (
    <div className={styles.container}>
      {/* role="application" rather than a plain group: this is a custom pan
          control, and it tells screen readers to pass the arrow keys through to
          it instead of consuming them for their own navigation. A <button>
          would be the alternative, but EditImageSection already renders this
          inside SummaryCard's button. */}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: the pan gesture is the control - there is no interactive element to move it onto. */}
      <div
        ref={frameRef}
        className={cx(styles.frame, dragging && styles.dragging)}
        role="application"
        aria-label="Bildeutsnitt - dra eller bruk piltastene for å flytte bildet"
        aria-describedby={hintId}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: a custom pan control has to take focus for its arrow keys to reach it.
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {source && (
          // biome-ignore lint/performance/noImgElement: next/image cannot be used here - the crop needs this exact decoded element for naturalWidth/naturalHeight and to hand to drawImage, at a pixel size it sets itself.
          <img
            className={styles.image}
            src={source.url}
            alt="Forhåndsvisning av arrangementsbildet"
            draggable={false}
            style={{
              height: `${display.height}px`,
              transform: `translate3d(calc(-50% + ${offset.width}px), calc(-50% + ${offset.height}px), 0)`,
              width: `${display.width}px`,
            }}
          />
        )}
        <div className={styles.grid} aria-hidden="true">
          <span
            className={cx(
              styles.gridLine,
              styles.gridLineVertical,
              styles.gridLineFirstThird,
            )}
          />
          <span
            className={cx(
              styles.gridLine,
              styles.gridLineVertical,
              styles.gridLineSecondThird,
            )}
          />
          <span
            className={cx(
              styles.gridLine,
              styles.gridLineHorizontal,
              styles.gridLineTopThird,
            )}
          />
          <span
            className={cx(
              styles.gridLine,
              styles.gridLineHorizontal,
              styles.gridLineBottomThird,
            )}
          />
        </div>
      </div>

      <div className={styles.controls}>
        <input
          className={styles.zoom}
          type="range"
          min={1}
          max={canZoom ? maxScale : 2}
          step={0.01}
          value={transform.scale}
          disabled={!canZoom}
          aria-label="Zoom"
          onChange={(event) =>
            setTransform((value) =>
              zoomTo(value, natural, frame, Number(event.target.value)),
            )
          }
        />
        <button type="button" className={styles.reset} onClick={reset}>
          Nullstill
        </button>
      </div>

      <p className={styles.hint} id={hintId}>
        Dra bildet for å flytte det, og zoom for å velge utsnitt. Slik vises det
        på arrangementssiden.
      </p>
    </div>
  );
};

export default ImageCropper;
