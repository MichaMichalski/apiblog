import { extname } from "path";
import { getAssetUrl } from "@/lib/cdn";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}

const VARIANTS = [
  { key: "sm", width: 300 },
  { key: "lg", width: 1024 },
] as const;

function buildVariantPath(src: string, key: string, format: string): string {
  const ext = extname(src);
  const base = src.slice(0, -ext.length);
  return `${base}-${key}.${format}`;
}

function buildWebpPath(src: string): string {
  const ext = extname(src);
  const base = src.slice(0, -ext.length);
  return `${base}.webp`;
}

export default function ResponsiveImage({
  src,
  alt,
  width,
  height,
  sizes = "(max-width: 768px) 100vw, 1024px",
  className,
  style,
  priority,
}: ResponsiveImageProps) {
  const resolvedSrc = getAssetUrl(src);

  if (!width || !height) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? undefined : "lazy"}
        decoding="async"
      />
    );
  }

  const ext = extname(resolvedSrc).slice(1).toLowerCase();
  const isWebpOriginal = ext === "webp";
  const isSvg = ext === "svg";

  if (isSvg) {
    return (
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={style}
        loading={priority ? undefined : "lazy"}
        decoding="async"
      />
    );
  }

  const applicableVariants = VARIANTS.filter((v) => v.width < width);

  const originalSrcset = [
    ...applicableVariants.map(
      (v) => `${buildVariantPath(resolvedSrc, v.key, ext)} ${v.width}w`
    ),
    `${resolvedSrc} ${width}w`,
  ].join(", ");

  const webpSrcset = isWebpOriginal
    ? undefined
    : [
        ...applicableVariants.map(
          (v) => `${buildVariantPath(resolvedSrc, v.key, "webp")} ${v.width}w`
        ),
        `${buildWebpPath(resolvedSrc)} ${width}w`,
      ].join(", ");

  const fallbackSrc =
    applicableVariants.length > 0
      ? buildVariantPath(resolvedSrc, applicableVariants[applicableVariants.length - 1].key, ext)
      : resolvedSrc;

  return (
    <picture>
      {webpSrcset && (
        <source type="image/webp" srcSet={webpSrcset} sizes={sizes} />
      )}
      <img
        src={fallbackSrc}
        srcSet={originalSrcset}
        sizes={sizes}
        width={width}
        height={height}
        alt={alt}
        className={className}
        style={style}
        loading={priority ? undefined : "lazy"}
        decoding="async"
      />
    </picture>
  );
}
