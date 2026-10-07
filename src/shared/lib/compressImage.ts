/** Photos above this size are re-encoded before upload. */
const TARGET_BYTES = 100 * 1024;
/** Longest side kept at first; shrunk further only if quality alone can't reach the target. */
const MAX_SIDE = 1920;
const MIN_SIDE = 1000;
const QUALITIES = [0.85, 0.8, 0.75, 0.7, 0.65];
/** GIF / SVG are left alone: re-encoding would drop the animation or the vectors. */
const COMPRESSIBLE = ["image/jpeg", "image/png", "image/webp"];

const toBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));

/**
 * Re-encodes a photo as WebP at the highest quality that fits ~100 KB (1–2 MB → ~100 KB with no
 * visible loss on screen). Resizes to at most 1920 px, and below that only when quality alone is
 * not enough. Returns the original file when it is already small, not a photo, or got no smaller.
 */
export async function compressImage(file: File): Promise<File> {
  if (!COMPRESSIBLE.includes(file.type) || file.size <= TARGET_BYTES) return file;

  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    let best: Blob | null = null;

    const longest = Math.max(bitmap.width, bitmap.height);
    let side = Math.min(MAX_SIDE, longest);
    // at least one pass; then 20% smaller per pass down to MIN_SIDE
    for (
      let first = true;
      first || side >= MIN_SIDE;
      first = false, side = Math.round(side * 0.8)
    ) {
      const scale = side / longest;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(bitmap.width * scale);
      canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

      for (const quality of QUALITIES) {
        const blob = await toBlob(canvas, quality);
        if (!blob) continue;
        if (!best || blob.size < best.size) best = blob;
        if (blob.size <= TARGET_BYTES) return asFile(blob, file);
      }
    }

    return best && best.size < file.size ? asFile(best, file) : file;
  } catch {
    // an image the browser can't decode is sent as it is
    return file;
  } finally {
    bitmap?.close();
  }
}

const asFile = (blob: Blob, original: File) =>
  new File([blob], original.name.replace(/\.[^.]+$/, "") + ".webp", {
    type: "image/webp",
    lastModified: Date.now(),
  });

/** Every photo inside a multipart body is compressed; other fields pass through unchanged. */
export async function compressFormImages(form: FormData): Promise<FormData> {
  const next = new FormData();
  for (const [key, value] of form.entries()) {
    if (value instanceof File) next.append(key, await compressImage(value));
    else next.append(key, value);
  }
  return next;
}
