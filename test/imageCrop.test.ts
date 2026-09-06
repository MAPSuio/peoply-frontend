import { describe, expect, it } from "vitest";

import {
  DEFAULT_CROP_TRANSFORM,
  EVENT_IMAGE_ASPECT_RATIO,
  MAX_ZOOM,
  MIN_SOURCE_CROP_WIDTH,
  OUTPUT_MAX_WIDTH,
  clampTransform,
  getBaseScale,
  getMaxPan,
  getMaxScale,
  getOutputSize,
  getPanOffset,
  getSourceRect,
  panBy,
  toJpegFileName,
  zoomTo,
} from "../utils/imageCrop";

/* A frame at the ratio the event page displays at, sized like the input on
   desktop. Sizes are arbitrary - the crop must not depend on them. */
const FRAME = { width: 500, height: 500 / EVENT_IMAGE_ASPECT_RATIO };
const MOBILE_FRAME = { width: 350, height: 350 / EVENT_IMAGE_ASPECT_RATIO };

/* Typical phone photos, plus one already at the target ratio. */
const LANDSCAPE = { width: 4032, height: 3024 };
const PORTRAIT = { width: 3024, height: 4032 };
const EXACT = {
  width: 1920,
  height: Math.round(1920 / EVENT_IMAGE_ASPECT_RATIO),
};
/* Wider than 16:9 - the only shape the frame's height constrains. */
const PANORAMA = { width: 4000, height: 1000 };

describe("getBaseScale", () => {
  it("is constrained by width for a source narrower than 16:9", () => {
    /* A 4:3 source is relatively taller than the frame, so matching widths is
       what covers it - matching heights would leave the sides short. */
    const scale = getBaseScale(LANDSCAPE, FRAME);
    expect(scale).toBeCloseTo(FRAME.width / LANDSCAPE.width, 10);

    const display = {
      width: LANDSCAPE.width * scale,
      height: LANDSCAPE.height * scale,
    };
    expect(display.width).toBeCloseTo(FRAME.width, 10);
    expect(display.height).toBeGreaterThanOrEqual(FRAME.height);
  });

  it("is constrained by height for a source wider than 16:9", () => {
    const scale = getBaseScale(PANORAMA, FRAME);
    expect(scale).toBeCloseTo(FRAME.height / PANORAMA.height, 10);
    expect(PANORAMA.width * scale).toBeGreaterThan(FRAME.width);
  });

  it("uses width for a portrait source", () => {
    expect(getBaseScale(PORTRAIT, FRAME)).toBeCloseTo(
      FRAME.width / PORTRAIT.width,
      10,
    );
  });

  it("falls back to 1 for a source with no dimensions", () => {
    expect(getBaseScale({ width: 0, height: 0 }, FRAME)).toBe(1);
  });
});

describe("scale 1 always fills the frame", () => {
  it.each([
    ["landscape", LANDSCAPE],
    ["portrait", PORTRAIT],
    ["exactly 16:9", EXACT],
  ])("leaves no gap for a %s source", (_name, natural) => {
    const scale = getBaseScale(natural, FRAME);
    expect(natural.width * scale).toBeGreaterThanOrEqual(FRAME.width - 1e-9);
    expect(natural.height * scale).toBeGreaterThanOrEqual(FRAME.height - 1e-9);
  });
});

describe("getMaxScale", () => {
  it("is capped by MAX_ZOOM on a high resolution source", () => {
    expect(getMaxScale(LANDSCAPE, FRAME)).toBe(MAX_ZOOM);
  });

  it("refuses to zoom past the resolution floor", () => {
    /* Exactly MIN_SOURCE_CROP_WIDTH wide at 16:9: already at the floor. */
    const tiny = {
      width: MIN_SOURCE_CROP_WIDTH,
      height: Math.round(MIN_SOURCE_CROP_WIDTH / EVENT_IMAGE_ASPECT_RATIO),
    };
    expect(getMaxScale(tiny, FRAME)).toBeCloseTo(1, 2);
  });

  it("never drops below 1, even for a source smaller than the floor", () => {
    expect(getMaxScale({ width: 200, height: 150 }, FRAME)).toBe(1);
  });

  it("keeps the cropped region above the resolution floor at max zoom", () => {
    const maxScale = getMaxScale(LANDSCAPE, FRAME);
    const rect = getSourceRect(
      { scale: maxScale, panX: 0, panY: 0 },
      LANDSCAPE,
      FRAME,
    );
    expect(rect.sw).toBeGreaterThanOrEqual(MIN_SOURCE_CROP_WIDTH);
  });
});

describe("clampTransform", () => {
  it("holds scale within [1, maxScale]", () => {
    expect(
      clampTransform({ scale: 0.2, panX: 0, panY: 0 }, LANDSCAPE, FRAME).scale,
    ).toBe(1);
    expect(
      clampTransform({ scale: 99, panX: 0, panY: 0 }, LANDSCAPE, FRAME).scale,
    ).toBe(getMaxScale(LANDSCAPE, FRAME));
  });

  it("holds pan within [-1, 1] on both axes", () => {
    const clamped = clampTransform(
      { scale: 2, panX: 5, panY: -5 },
      LANDSCAPE,
      FRAME,
    );
    expect(clamped.panX).toBe(1);
    expect(clamped.panY).toBe(-1);
  });
});

describe("panBy", () => {
  it("moves the image and stops at the edge", () => {
    const panned = panBy(DEFAULT_CROP_TRANSFORM, LANDSCAPE, FRAME, 0, 10_000);
    expect(panned.panY).toBe(1);

    const offset = getPanOffset(panned, LANDSCAPE, FRAME);
    const maxPan = getMaxPan(LANDSCAPE, FRAME, panned.scale);
    expect(offset.height).toBeCloseTo(maxPan.height, 10);
  });

  it("pins an axis that has no room to move", () => {
    /* At scale 1 a 4:3 source exactly matches the frame width... */
    expect(getMaxPan(LANDSCAPE, FRAME, 1).width).toBeCloseTo(0, 10);
    /* ...so a horizontal drag cannot shift it, and must not produce NaN. */
    const panned = panBy(DEFAULT_CROP_TRANSFORM, LANDSCAPE, FRAME, 50, 0);
    expect(panned.panX).toBe(0);
    /* Vertically there is room, so that axis still moves. */
    expect(getMaxPan(LANDSCAPE, FRAME, 1).height).toBeGreaterThan(0);
  });

  it("never exposes a gap at any edge", () => {
    const natural = PORTRAIT;
    const extremes = [
      [10_000, 10_000],
      [-10_000, 10_000],
      [10_000, -10_000],
      [-10_000, -10_000],
    ];

    for (const [deltaX, deltaY] of extremes) {
      const transform = panBy(
        { scale: 2.5, panX: 0, panY: 0 },
        natural,
        FRAME,
        deltaX,
        deltaY,
      );
      const rect = getSourceRect(transform, natural, FRAME);

      expect(rect.sx).toBeGreaterThanOrEqual(0);
      expect(rect.sy).toBeGreaterThanOrEqual(0);
      expect(rect.sx + rect.sw).toBeLessThanOrEqual(natural.width + 1e-6);
      expect(rect.sy + rect.sh).toBeLessThanOrEqual(natural.height + 1e-6);
    }
  });
});

describe("zoomTo", () => {
  it("holds the anchor point still", () => {
    const natural = LANDSCAPE;
    const anchor = { x: 80, y: -40 };
    const before = { scale: 1.5, panX: 0.3, panY: -0.2 };

    const imagePointAt = (transform: {
      scale: number;
      panX: number;
      panY: number;
    }) => {
      const k = getBaseScale(natural, FRAME) * transform.scale;
      const offset = getPanOffset(transform, natural, FRAME);
      return {
        x: (anchor.x - offset.width) / k,
        y: (anchor.y - offset.height) / k,
      };
    };

    const after = zoomTo(before, natural, FRAME, 3, anchor);

    expect(imagePointAt(after).x).toBeCloseTo(imagePointAt(before).x, 6);
    expect(imagePointAt(after).y).toBeCloseTo(imagePointAt(before).y, 6);
  });

  it("clamps to the zoom range", () => {
    expect(zoomTo(DEFAULT_CROP_TRANSFORM, LANDSCAPE, FRAME, 0.1).scale).toBe(1);
    expect(zoomTo(DEFAULT_CROP_TRANSFORM, LANDSCAPE, FRAME, 42).scale).toBe(
      getMaxScale(LANDSCAPE, FRAME),
    );
  });
});

describe("getSourceRect", () => {
  it("crops a 4:3 landscape source to full width, vertically centred", () => {
    const rect = getSourceRect(DEFAULT_CROP_TRANSFORM, LANDSCAPE, FRAME);

    expect(rect.sx).toBeCloseTo(0, 6);
    expect(rect.sw).toBeCloseTo(LANDSCAPE.width, 6);
    expect(rect.sw / rect.sh).toBeCloseTo(EVENT_IMAGE_ASPECT_RATIO, 6);
    expect(rect.sy).toBeCloseTo((LANDSCAPE.height - rect.sh) / 2, 6);
  });

  it("does not depend on the frame's rendered size", () => {
    const transform = { scale: 2.2, panX: 0.4, panY: -0.7 };
    const desktop = getSourceRect(transform, PORTRAIT, FRAME);
    const mobile = getSourceRect(transform, PORTRAIT, MOBILE_FRAME);

    expect(mobile.sx).toBeCloseTo(desktop.sx, 6);
    expect(mobile.sy).toBeCloseTo(desktop.sy, 6);
    expect(mobile.sw).toBeCloseTo(desktop.sw, 6);
    expect(mobile.sh).toBeCloseTo(desktop.sh, 6);
  });

  it("takes the whole of an already 16:9 source at scale 1", () => {
    const rect = getSourceRect(DEFAULT_CROP_TRANSFORM, EXACT, FRAME);

    /* Within a pixel rather than exact: EXACT's height is a rounded 1079 for
       1920, so the source is a hair taller than 1.78 and loses that sliver.
       This is the resume case - a restored draft is already a crop, and must
       come back framed as saved. */
    expect(rect.sx).toBeCloseTo(0, 6);
    expect(rect.sy).toBeLessThan(1);
    expect(rect.sw).toBeCloseTo(EXACT.width, 6);
    expect(rect.sh).toBeGreaterThan(EXACT.height - 1);
  });
});

describe("getOutputSize", () => {
  it("caps the width at OUTPUT_MAX_WIDTH", () => {
    const size = getOutputSize({ sx: 0, sy: 0, sw: 4032, sh: 2265 });
    expect(size.width).toBe(OUTPUT_MAX_WIDTH);
    expect(size.width / size.height).toBeCloseTo(EVENT_IMAGE_ASPECT_RATIO, 2);
  });

  it("never upscales past the cropped region", () => {
    const size = getOutputSize({ sx: 0, sy: 0, sw: 800, sh: 449 });
    expect(size.width).toBe(800);
  });

  it("always produces a drawable canvas", () => {
    const size = getOutputSize({ sx: 0, sy: 0, sw: 0, sh: 0 });
    expect(size.width).toBeGreaterThan(0);
    expect(size.height).toBeGreaterThan(0);
  });
});

describe("toJpegFileName", () => {
  it("swaps the extension for .jpg", () => {
    expect(toJpegFileName("IMG_2043.HEIC")).toBe("IMG_2043.jpg");
    expect(toJpegFileName("fest.png")).toBe("fest.jpg");
  });

  it("keeps dots inside the name", () => {
    expect(toJpegFileName("fadderuke.2026.final.jpeg")).toBe(
      "fadderuke.2026.final.jpg",
    );
  });

  it("handles a name that is only an extension", () => {
    expect(toJpegFileName(".jpeg")).toBe("arrangementsbilde.jpg");
  });

  it("adds an extension when there is none", () => {
    expect(toJpegFileName("bilde")).toBe("bilde.jpg");
  });
});
