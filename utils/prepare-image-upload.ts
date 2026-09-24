// Phone photos are routinely 3-8 MB, but PHP's default upload_max_filesize is
// 2 MB (and shared hosting rarely raises it). A file over that limit is
// dropped by PHP before Laravel sees it, surfacing only as the unhelpful 422
// "The image failed to upload." — so every multipart image upload shrinks
// large images here first. 2000px on the long edge is still well above
// anything the storefront renders.
const MAX_DIMENSION = 2000;
const MAX_BYTES_UNTOUCHED = 1.5 * 1024 * 1024;
// Target for re-encoded output — comfortably under PHP's 2 MB default.
const TARGET_BYTES = 1.5 * 1024 * 1024;
// Tried in order until the output fits TARGET_BYTES. Typical photos fit on
// the first attempt; noisy/high-detail images step down.
const ATTEMPTS = [
  { maxDimension: MAX_DIMENSION, quality: 0.85 },
  { maxDimension: MAX_DIMENSION, quality: 0.7 },
  { maxDimension: 1600, quality: 0.7 },
  { maxDimension: 1200, quality: 0.65 },
];

// Animated GIFs would lose their animation and SVGs aren't raster — leave
// both alone (the backend rejects SVG anyway).
const SKIP_TYPES = new Set(["image/gif", "image/svg+xml"]);

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// WebP keeps PNG transparency and is smaller than JPEG; browsers that can't
// encode it hand back a PNG instead, so fall back to JPEG then.
const encode = async (
  bitmap: ImageBitmap,
  maxDimension: number,
  quality: number,
) => {
  const scale = Math.min(
    1,
    maxDimension / Math.max(bitmap.width, bitmap.height),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") {
    return { blob: webp, extension: "webp" };
  }
  const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
  return jpeg ? { blob: jpeg, extension: "jpg" } : null;
};

const renameWithExtension = (name: string, extension: string) =>
  `${name.replace(/\.[^.]+$/, "") || "image"}.${extension}`;

export const prepareImageUpload = async (file: File): Promise<File> => {
  if (
    typeof window === "undefined" ||
    typeof createImageBitmap === "undefined" ||
    !file.type.startsWith("image/") ||
    SKIP_TYPES.has(file.type)
  ) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Not decodable by this browser (e.g. HEIC outside Safari) — send it
    // as-is and let the backend's validation message explain.
    return file;
  }

  const longestEdge = Math.max(bitmap.width, bitmap.height);
  if (file.size <= MAX_BYTES_UNTOUCHED && longestEdge <= MAX_DIMENSION) {
    bitmap.close();
    return file;
  }

  let result: Awaited<ReturnType<typeof encode>> = null;
  for (const { maxDimension, quality } of ATTEMPTS) {
    result = await encode(bitmap, maxDimension, quality);
    if (result && result.blob.size <= TARGET_BYTES) break;
  }
  bitmap.close();

  if (!result || result.blob.size >= file.size) {
    return file;
  }

  return new File(
    [result.blob],
    renameWithExtension(file.name, result.extension),
    {
      type: result.blob.type,
      lastModified: file.lastModified,
    },
  );
};
