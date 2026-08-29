const THUMBNAIL_SIZE = 48;
const THUMBNAIL_QUALITY = 75;
const IMAGE_LOAD_TIMEOUT_MS = 5000;

function toSameOriginThumbnailUrl(imageUrl: string) {
  const parameters = new URLSearchParams({
    url: imageUrl,
    w: String(THUMBNAIL_SIZE),
    q: String(THUMBNAIL_QUALITY),
  });

  return `/_next/image?${parameters}`;
}

function decodeImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const giveUp = setTimeout(() => {
      image.src = "";
      reject(new Error(`Timed out reading ${source}`));
    }, IMAGE_LOAD_TIMEOUT_MS);

    image.onload = () => {
      clearTimeout(giveUp);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(giveUp);
      reject(new Error(`Could not read ${source}`));
    };
    image.src = source;
  });
}

export async function loadImagePixels(imageUrl: string) {
  const image = await decodeImage(toSameOriginThumbnailUrl(imageUrl));
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_SIZE;
  canvas.height = THUMBNAIL_SIZE;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("This browser has no 2d canvas to read pixels from");
  }

  context.drawImage(image, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
  return context.getImageData(0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE).data;
}
