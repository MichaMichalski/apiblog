import sharp from "sharp";
import { writeFile } from "fs/promises";
import { join, extname } from "path";

interface VariantResult {
  files: { filename: string; buffer: Buffer }[];
  width: number;
  height: number;
}

const VARIANT_DEFS = [
  { key: "thumb", maxWidth: 150, maxHeight: 150, crop: true },
  { key: "sm", maxWidth: 300, maxHeight: undefined, crop: false },
  { key: "lg", maxWidth: 1024, maxHeight: undefined, crop: false },
] as const;

const SKIP_MIME_TYPES = new Set(["image/svg+xml", "image/gif"]);

function variantFilename(
  base: string,
  ext: string,
  key: string,
  format: string
): string {
  return `${base}-${key}.${format === "webp" ? "webp" : ext}`;
}

export async function generateVariants(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<VariantResult> {
  const ext = extname(originalFilename).slice(1).toLowerCase();
  const base = originalFilename.replace(/\.[^.]+$/, "");

  if (SKIP_MIME_TYPES.has(mimeType)) {
    return { files: [], width: 0, height: 0 };
  }

  const metadata = await sharp(buffer).metadata();
  const origWidth = metadata.width ?? 0;
  const origHeight = metadata.height ?? 0;

  if (!origWidth || !origHeight) {
    return { files: [], width: origWidth, height: origHeight };
  }

  const isWebpOriginal = mimeType === "image/webp";
  const files: { filename: string; buffer: Buffer }[] = [];

  for (const def of VARIANT_DEFS) {
    if (def.crop && origWidth <= def.maxWidth && origHeight <= (def.maxHeight ?? Infinity)) {
      continue;
    }
    if (!def.crop && origWidth <= def.maxWidth) {
      continue;
    }

    let pipeline = sharp(buffer);

    if (def.crop) {
      pipeline = pipeline.resize(def.maxWidth, def.maxHeight, {
        fit: "cover",
        position: "centre",
      });
    } else {
      pipeline = pipeline.resize(def.maxWidth, undefined, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const originalFormatBuffer = await pipeline.toBuffer();
    files.push({
      filename: variantFilename(base, ext, def.key, ext),
      buffer: originalFormatBuffer,
    });

    if (!isWebpOriginal) {
      const webpBuffer = await sharp(originalFormatBuffer).webp({ quality: 80 }).toBuffer();
      files.push({
        filename: variantFilename(base, ext, def.key, "webp"),
        buffer: webpBuffer,
      });
    }
  }

  if (!isWebpOriginal) {
    const webpOriginal = await sharp(buffer).webp({ quality: 80 }).toBuffer();
    files.push({
      filename: `${base}.webp`,
      buffer: webpOriginal,
    });
  }

  return { files, width: origWidth, height: origHeight };
}

export async function writeVariants(
  uploadDir: string,
  variants: { filename: string; buffer: Buffer }[]
): Promise<void> {
  await Promise.all(
    variants.map((v) => writeFile(join(uploadDir, v.filename), v.buffer))
  );
}
